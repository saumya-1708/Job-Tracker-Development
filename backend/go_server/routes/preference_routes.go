package routes

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"time"

	"backend/go_server/db"
	"backend/go_server/middleware"
	"backend/go_server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
)

// PreferencesHandler saves preference and triggers FastAPI
func PreferencesHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("✅ PreferencesHandler called")

	// ❌ Only POST allowed
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 🔐 Extract username from JWT context
	usernameCtx := r.Context().Value(middleware.ContextUsernameKey)
	username, ok := usernameCtx.(string)
	if !ok || username == "" {
		log.Println("❌ Username missing in context")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 📥 Decode request body into struct
	var prefs models.PreferenceDetails
	if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
		log.Println("❌ Invalid JSON:", err)
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// ⚠️ Validation check
	if len(prefs.Roles) == 0 || len(prefs.Locations) == 0 || len(prefs.SalaryRange) != 2 || prefs.Experience < 0 {
		log.Println("❌ Validation failed")
		http.Error(w, "Invalid fields", http.StatusBadRequest)
		return
	}

	// 🧠 Initialize preference
	prefs.Username = username
	prefs.Status = "pending" // initial state
	prefs.Jobs = make(map[string][]string)
	prefs.CreatedAt = time.Now()
	prefs.UpdatedAt = time.Now()

	// 💾 Insert into MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	insertRes, err := db.PreferencesCollection.InsertOne(ctx, prefs)
	if err != nil {
		log.Println("❌ DB insert error:", err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	prefs.ID = insertRes.InsertedID.(primitive.ObjectID)

	log.Println("✅ Preference saved with ID:", prefs.ID.Hex())

	// 📤 Send response immediately (async processing continues)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"preferenceId": prefs.ID.Hex(),
		"status":       prefs.Status,
	})

	// 🚀 Trigger async Python call
	go callFastAPI(prefs)
}

// Async call to FastAPI
func callFastAPI(pref models.PreferenceDetails) {
	log.Println("🚀 callFastAPI triggered for:", pref.ID.Hex())

	asyncCtx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// 🔍 Fetch user's resume ID
	var userRecord struct {
		ResumeID *primitive.ObjectID `bson:"resumeId"`
	}

	err := db.UserCollection.FindOne(asyncCtx, bson.M{"username": pref.Username}).Decode(&userRecord)
	if err != nil || userRecord.ResumeID == nil {
		log.Println("❌ No resume found for user:", pref.Username)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	log.Println("✅ Resume ID found:", userRecord.ResumeID.Hex())

	// 📥 Download resume from GridFS
	var fileBuf bytes.Buffer

	// ⚠️ IMPORTANT: Check database name here
	bucket, err := gridfs.NewBucket(db.Client.Database("authdb"))
	if err != nil {
		log.Println("❌ GridFS init error:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	_, err = bucket.DownloadToStream(*userRecord.ResumeID, &fileBuf)
	if err != nil {
		log.Println("❌ Failed to download resume:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	log.Println("📄 Resume downloaded, size:", fileBuf.Len())

	// 📦 Create multipart request
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", "resume.pdf")
	if err != nil {
		log.Println("❌ File part creation failed:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	_, err = io.Copy(part, &fileBuf)
	if err != nil {
		log.Println("❌ File copy failed:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	// 📤 Add preferences JSON
	prefJSON, _ := json.Marshal(map[string]string{
		"preferenceId": pref.ID.Hex(),
		"username":     pref.Username,
	})

	writer.WriteField("preferences", string(prefJSON))
	writer.Close()

	log.Println("📦 Sending request to FastAPI...")

	// 🌐 Send request to Python
	req, err := http.NewRequest("POST", "http://localhost:8000/recommend-jobs", body)
	if err != nil {
		log.Println("❌ Request creation failed:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("❌ FastAPI call failed:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}
	defer resp.Body.Close()

	log.Println("📩 FastAPI response status:", resp.StatusCode)

	respBody, _ := io.ReadAll(resp.Body)
	log.Println("📦 FastAPI response body:", string(respBody))

	// ✅ Parse response
	if resp.StatusCode == http.StatusOK && len(respBody) > 0 {
		var data struct {
			Jobs map[string][]string `json:"jobs"`
		}

		err := json.Unmarshal(respBody, &data)
		if err != nil {
			log.Println("❌ JSON parsing failed:", err)
			updatePreference(pref.ID, "failed", nil)
			return
		}

		// ⚠️ Check if jobs exist
		if data.Jobs == nil {
			log.Println("❌ Jobs is nil")
			updatePreference(pref.ID, "failed", nil)
			return
		}

		log.Println("✅ Jobs received, updating DB")

		updatePreference(pref.ID, "success", data.Jobs)
		log.Println("🎉 FastAPI succeeded for:", pref.ID.Hex())

	} else {
		log.Println("❌ FastAPI returned error")
		updatePreference(pref.ID, "failed", nil)
	}
}

// Update preference status + jobs
func updatePreference(prefID primitive.ObjectID, status string, jobs map[string][]string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{
		"status":    status,
		"updatedAt": time.Now(),
	}

	// ✔ Only add jobs if available
	if jobs != nil {
		update["jobs"] = jobs
	}

	_, err := db.PreferencesCollection.UpdateOne(
		ctx,
		bson.M{"_id": prefID},
		bson.M{"$set": update},
	)

	if err != nil {
		log.Println("❌ Failed to update preference:", prefID.Hex(), "Error:", err)
	} else {
		log.Println("✅ Preference updated:", prefID.Hex(), "Status:", status)
	}
}

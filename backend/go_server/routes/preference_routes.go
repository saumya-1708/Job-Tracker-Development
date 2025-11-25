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
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	usernameCtx := r.Context().Value(middleware.ContextUsernameKey)
	username, ok := usernameCtx.(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var prefs models.PreferenceDetails
	if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validation
	if len(prefs.Roles) == 0 || len(prefs.Locations) == 0 || len(prefs.SalaryRange) != 2 || prefs.Experience < 0 {
		http.Error(w, "Invalid fields", http.StatusBadRequest)
		return
	}

	prefs.Username = username
	prefs.Status = "pending"
	prefs.Jobs = make(map[string][]string)
	prefs.CreatedAt = time.Now()
	prefs.UpdatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	insertRes, err := db.PreferencesCollection.InsertOne(ctx, prefs)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	prefs.ID = insertRes.InsertedID.(primitive.ObjectID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"preferenceId": prefs.ID.Hex(),
		"status":       prefs.Status,
	})

	go callFastAPI(prefs)
}

// Async call to FastAPI
func callFastAPI(pref models.PreferenceDetails) {
	asyncCtx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	var userRecord struct {
		ResumeID *primitive.ObjectID `bson:"resumeId"`
	}
	err := db.UserCollection.FindOne(asyncCtx, bson.M{"username": pref.Username}).Decode(&userRecord)
	if err != nil || userRecord.ResumeID == nil {
		log.Println("⚠️ No resume found:", pref.Username)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	var fileBuf bytes.Buffer
	bucket, _ := gridfs.NewBucket(db.Client.Database("authdb"))
	_, err = bucket.DownloadToStream(*userRecord.ResumeID, &fileBuf)
	if err != nil {
		log.Println("❌ Failed to download resume:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}

	// Multipart request
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("file", "resume.pdf")
	io.Copy(part, &fileBuf)

	prefJSON, _ := json.Marshal(map[string]string{
		"preferenceId": pref.ID.Hex(),
		"username":     pref.Username,
	})
	writer.WriteField("preferences", string(prefJSON))
	writer.Close()

	req, _ := http.NewRequest("POST", "http://localhost:8000/recommend-jobs", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("❌ FastAPI error:", err)
		updatePreference(pref.ID, "failed", nil)
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode == http.StatusOK && len(respBody) > 0 {
		var data struct {
			Jobs map[string][]string `json:"jobs"`
		}
		json.Unmarshal(respBody, &data)
		updatePreference(pref.ID, "success", data.Jobs)
		log.Println("✅ FastAPI succeeded for:", pref.ID.Hex())
	} else {
		updatePreference(pref.ID, "failed", nil)
		log.Println("⚠️ FastAPI returned error for:", pref.ID.Hex())
	}
}

// Update preference status + jobs
func updatePreference(prefID primitive.ObjectID, status string, jobs map[string][]string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{"status": status, "updatedAt": time.Now()}
	if jobs != nil {
		update["jobs"] = jobs
	}

	_, err := db.PreferencesCollection.UpdateOne(ctx, bson.M{"_id": prefID}, bson.M{"$set": update})
	if err != nil {
		log.Println("❌ Failed to update preference:", prefID.Hex(), "Error:", err)
	}
}

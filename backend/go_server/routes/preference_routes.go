package routes

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"backend/go_server/db"
	"backend/go_server/middleware"
	"backend/go_server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
	"log"
)

func PreferencesHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("✅ PreferencesHandler called")

	if r.Method != http.MethodPost {
		log.Println("❌ Method not allowed:", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get username from context
	usernameCtx := r.Context().Value(middleware.ContextUsernameKey)
	username, ok := usernameCtx.(string)
	if !ok || username == "" {
		log.Println("❌ Unauthorized: username not found in context")
		http.Error(w, "Unauthorized: username not found", http.StatusUnauthorized)
		return
	}
	log.Println("User:", username)

	// Decode preferences JSON
	var prefs models.PreferenceDetails
	if err := json.NewDecoder(r.Body).Decode(&prefs); err != nil {
		log.Println("❌ Failed to decode JSON:", err)
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}
	log.Printf("Decoded preferences: %+v\n", prefs)

	// Basic validation
	if len(prefs.Roles) == 0 || len(prefs.Locations) == 0 {
		log.Println("❌ Validation failed: Roles or Locations missing")
		http.Error(w, "Roles and Locations are required", http.StatusBadRequest)
		return
	}
	if prefs.Experience < 0 {
		log.Println("❌ Validation failed: Experience < 0")
		http.Error(w, "Experience must be >= 0", http.StatusBadRequest)
		return
	}
	if len(prefs.SalaryRange) != 2 {
		log.Println("❌ Validation failed: SalaryRange length != 2")
		http.Error(w, "Salary range must have 2 values [min, max]", http.StatusBadRequest)
		return
	}

	prefs.Username = username

	// Save preferences in MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Println("Saving preferences to MongoDB")
	_, err := db.PreferencesCollection.InsertOne(ctx, prefs)
	if err != nil {
		log.Println("❌ Database error while inserting preferences:", err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Println("✅ Preferences saved successfully")

	// Fetch resume from GridFS
	log.Println("Fetching resumeID from users collection")
	var userRecord struct {
		ResumeID *primitive.ObjectID `bson:"resumeId"`
	}
	err = db.UserCollection.FindOne(ctx, bson.M{"username": username}).Decode(&userRecord)
	if err != nil {
		log.Println("⚠️ No resume found for user:", username, "Error:", err)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Preferences saved, no resume found",
		})
		return
	}

	if userRecord.ResumeID == nil {
		log.Println("⚠️ ResumeID is nil for user:", username)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Preferences saved, no resume found",
		})
		return
	}
	log.Println("✅ Found ResumeID:", userRecord.ResumeID.Hex())

	// Download resume from GridFS
	var fileBuf bytes.Buffer
	bucket, err := gridfs.NewBucket(db.Client.Database("authdb"))
	if err != nil {
		log.Println("❌ Failed to create GridFS bucket:", err)
		http.Error(w, "Failed to open GridFS bucket: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Downloading resume from GridFS")
	_, err = bucket.DownloadToStream(*userRecord.ResumeID, &fileBuf)
	if err != nil {
		log.Println("❌ Error downloading resume from GridFS:", err)
		http.Error(w, "Error reading resume from GridFS: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Println("✅ Resume downloaded, size:", fileBuf.Len())

	// Send resume + preferences to FastAPI
	log.Println("Preparing multipart request to FastAPI")
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", "resume.pdf")
	if err != nil {
		log.Println("❌ Failed to create multipart file:", err)
		http.Error(w, "Failed to create multipart file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if _, err := io.Copy(part, &fileBuf); err != nil {
		log.Println("❌ Failed to copy resume to multipart:", err)
		http.Error(w, "Failed to copy resume to multipart: "+err.Error(), http.StatusInternalServerError)
		return
	}

	prefJSON, _ := json.Marshal(prefs)
	_ = writer.WriteField("preferences", string(prefJSON))
	writer.Close()

	req, err := http.NewRequest("POST", "http://localhost:8000/recommend-jobs", body)
	if err != nil {
		log.Println("❌ Failed to create HTTP request for FastAPI:", err)
		http.Error(w, "Failed to create request to FastAPI: "+err.Error(), http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("❌ Error sending request to FastAPI:", err)
		http.Error(w, "Error sending data to FastAPI: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("❌ Failed to read FastAPI response:", err)
		http.Error(w, "Failed to read FastAPI response: "+err.Error(), http.StatusInternalServerError)
		return
	}
	log.Println("✅ FastAPI returned status:", resp.Status, "Response length:", len(respBody))

	// Forward FastAPI response to frontend
	w.Header().Set("Content-Type", "application/json")
	w.Write(respBody)
	log.Println("✅ Response forwarded to frontend")
}

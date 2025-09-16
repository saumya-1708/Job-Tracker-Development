package routes

import (
	"backend/go_server/db"
	"backend/go_server/models"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RecommendJobsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON body to get userId
	var req struct {
		UserId string `json:"userId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Convert userId to ObjectID
	userObjectID, err := primitive.ObjectIDFromHex(req.UserId)
	if err != nil {
		http.Error(w, "Invalid userId", http.StatusBadRequest)
		return
	}

	// Fetch user from MongoDB
	var user models.UserDetails
	err = db.UserDetailsCollection.FindOne(context.Background(), bson.M{"_id": userObjectID}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Fetch all jobs from MongoDB
	cursor, err := db.Client.Database("jobsdb").Collection("jobs").Find(context.Background(), bson.M{})
	if err != nil {
		http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var jobs []models.Job
	if err = cursor.All(context.Background(), &jobs); err != nil {
		http.Error(w, "Failed to parse jobs", http.StatusInternalServerError)
		return
	}

	// Prepare payload for Python
	payload := map[string]interface{}{
		"user": user,
		"jobs": jobs,
	}

	payloadBytes, _ := json.Marshal(payload)

	// Call Python service
	resp, err := http.Post("http://localhost:8000/recommend-jobs", "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		http.Error(w, "Python service error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

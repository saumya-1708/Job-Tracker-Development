package routes

import (
	"context"
	"encoding/json"
	"net/http"

	"backend/go_server/db" 
	"go.mongodb.org/mongo-driver/bson"
)

// UserProfile is the response struct (without password)
type UserProfile struct {
	Username string `json:"username" bson:"username"`
	Email    string `json:"email" bson:"email"`
	Phone    string `json:"phone" bson:"phone"`
}

// ProfileHandler returns the user profile
func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Fetch the first user for now
	var user UserProfile
	err := db.UserCollection.FindOne(context.TODO(), bson.M{}).Decode(&user)
	if err != nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(user)
}

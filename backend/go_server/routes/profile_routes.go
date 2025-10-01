package routes

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"backend/go_server/db"
	"backend/go_server/middleware"
	"backend/go_server/models"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
)

// Secret key used to sign JWT tokens (make sure it's the same everywhere)
var JwtKey = []byte("your_super_secret_key")

// Claims defines JWT claims
type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

// UserProfile is the response struct (without password)
type UserProfile struct {
	Username string `json:"username" bson:"username"`
	Email    string `json:"email" bson:"email"`
	Phone    string `json:"phone" bson:"phone"`
}

// ProfileHandler returns the logged-in user's profile
func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value(middleware.ContextUsernameKey).(string)

	var user models.User
	err := db.UserCollection.FindOne(context.TODO(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// LogoutHandler deletes the refresh token (server-side logout)
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		http.Error(w, "Missing authorization header", http.StatusUnauthorized)
		return
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
		return
	}
	tokenStr := parts[1]

	// Parse JWT just to get the email
	claims := &Claims{}
	_, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return JwtKey, nil
	})
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Delete refresh token from DB (invalidate session)
	_, err = db.RefreshTokenCollection.DeleteOne(context.TODO(), bson.M{"email": claims.Email})
	if err != nil {
		http.Error(w, "Error logging out", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

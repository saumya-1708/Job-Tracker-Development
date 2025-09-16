package routes

import (
	"backend/go_server/models"
	"backend/go_server/services"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"

	"go.mongodb.org/mongo-driver/mongo"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(user.Email) == "" || strings.TrimSpace(user.Password) == "" {
		http.Error(w, "Email and password cannot be empty", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(user.Phone) == "" || len(user.Phone) != 10 {
    http.Error(w, "Phone number must be 10 digits", http.StatusBadRequest)
    return
	}
	if strings.TrimSpace(user.Username) == "" {
		http.Error(w, "Username cannot be empty", http.StatusBadRequest)
		return
	}

	if !emailRegex.MatchString(user.Email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	if len(user.Password) < 6 {
		http.Error(w, "Password must be at least 6 characters long", http.StatusBadRequest)
		return
	}

	err = services.Signup(user)
	if err != nil {
		// Handle duplicate key error (email already exists)
		if we, ok := err.(mongo.WriteException); ok {
			for _, e := range we.WriteErrors {
				if e.Code == 11000 {
					http.Error(w, "Email already exists", http.StatusConflict)
					return
				}
			}
		}
		http.Error(w, "Error signing up", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Signup successful"})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds models.User
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return 
	}

	if strings.TrimSpace(creds.Email) == "" || strings.TrimSpace(creds.Password) == "" {
		http.Error(w, "Email and password cannot be empty", http.StatusBadRequest)
		return
	}

	valid, accessToken := services.Login(creds.Email, creds.Password)
	if !valid {
		http.Error(w, "Invalid Email or password", http.StatusUnauthorized)
		return
	}

	// Send access token to frontend
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid":        true,
		"access_token": accessToken,
	})
}

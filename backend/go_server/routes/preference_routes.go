package routes

import (
    "context"
    "encoding/json"
    "net/http"

    "backend/go_server/db"
    "backend/go_server/middleware"
    "backend/go_server/models"
)

func PreferencesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get username from context (set by JWT middleware)
	usernameCtx := r.Context().Value(middleware.ContextUsernameKey)
	username, ok := usernameCtx.(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized: username not found", http.StatusUnauthorized)
		return
	}

	var user models.PreferenceDetails

	// Decode JSON from frontend
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if len(user.Roles) == 0 || len(user.Locations) == 0 {
		http.Error(w, "Roles and Locations are required", http.StatusBadRequest)
		return
	}
	if user.Experience < 0 {
		http.Error(w, "Experience must be >= 0", http.StatusBadRequest)
		return
	}
	if len(user.SalaryRange) != 2 {
		http.Error(w, "Salary range must have 2 values [min, max]", http.StatusBadRequest)
		return
	}

    // Set the username from JWT
	user.Username = username

    // Insert into MongoDB
    _, err = db.PreferencesCollection.InsertOne(context.Background(), user)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User preferences saved successfully",
	})
}

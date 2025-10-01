package routes

import (
	"backend/go_server/models"
	"backend/go_server/services"
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"
)

// Regex patterns
var (
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	phoneRegex    = regexp.MustCompile(`^\d{10}$`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_.-]{3,30}$`) // 3-30 chars, letters, digits, _, -
)

// Helper function for password validation
func IsValidPassword(password string) bool {
	if len(password) < 6 {
		return false
	}
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasDigit := regexp.MustCompile(`\d`).MatchString(password)
	return hasLower && hasUpper && hasDigit
}

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	log.Println("Signup request received")

	// Parse multipart form (10 MB max)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		log.Println("Error parsing form:", err)
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	// Extract fields
	email := strings.TrimSpace(r.FormValue("email"))
	password := r.FormValue("password")
	phone := strings.TrimSpace(r.FormValue("phone"))
	username := strings.TrimSpace(r.FormValue("username"))

	// Validate email
	if email == "" || !emailRegex.MatchString(email) {
		log.Println("Invalid email:", email)
		http.Error(w, "Invalid or empty email", http.StatusBadRequest)
		return
	}

	// Validate password
	if password == "" || !IsValidPassword(password) {
		log.Println("Invalid password for email:", email)
		http.Error(w, "Password must be at least 6 characters, include 1 uppercase, 1 lowercase, and 1 number", http.StatusBadRequest)
		return
	}

	// Validate phone
	if !phoneRegex.MatchString(phone) {
		log.Println("Invalid phone for email:", email)
		http.Error(w, "Phone must be exactly 10 digits", http.StatusBadRequest)
		return
	}

	// Validate username
	if username == "" || !usernameRegex.MatchString(username) {
		log.Println("Invalid username:", username)
		http.Error(w, "Username must be 3-30 characters, letters/numbers/_/- only", http.StatusBadRequest)
		return
	}

	// Validate resume file
	file, header, err := r.FormFile("resume")
	if err != nil || file == nil {
		log.Println("Resume file missing for email:", email)
		http.Error(w, "Resume file is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Allow only PDF/DOC/DOCX
	allowedExt := regexp.MustCompile(`(?i)\.(pdf|doc|docx)$`)
	if !allowedExt.MatchString(header.Filename) {
		log.Println("Invalid resume file type:", header.Filename)
		http.Error(w, "Resume must be PDF/DOC/DOCX", http.StatusBadRequest)
		return
	}

	// Upload resume to GridFS
	resumeID, err := services.UploadResumeToGridFS(file, header.Filename)
	if err != nil {
		log.Println("Resume upload failed for email:", email, "error:", err)
		http.Error(w, "Error uploading resume: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create user object
	user := models.User{
		Email:    email,
		Password: password, // will be hashed in service
		Phone:    phone,
		Username: username,
		ResumeID: &resumeID,
	}

	// Call service layer to create user
	if err := services.Signup(user); err != nil {
		log.Println("Signup service failed for email:", email, "error:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Println("Signup successful for email:", email)

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Signup successful",
	})
}

// LoginHandler handles user login with input validation
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	email := strings.TrimSpace(creds.Email)
	password := creds.Password

	// Input validation
	if email == "" || password == "" {
		http.Error(w, "Email and password cannot be empty", http.StatusBadRequest)
		return
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	// Password strength: at least 6 chars, 1 uppercase, 1 lowercase, 1 digit
	if len(password) < 6 ||
		!regexp.MustCompile(`[a-z]`).MatchString(password) ||
		!regexp.MustCompile(`[A-Z]`).MatchString(password) ||
		!regexp.MustCompile(`\d`).MatchString(password) {
		http.Error(w, "Password must be at least 6 characters, include 1 uppercase, 1 lowercase, and 1 number", http.StatusBadRequest)
		return
	}

	// Use existing Login function from services
	valid, accessToken, username := services.Login(email, password)
	if !valid {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Send only access token to frontend
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid":        true,
		"access_token": accessToken,
		"username":     username,
	})
}

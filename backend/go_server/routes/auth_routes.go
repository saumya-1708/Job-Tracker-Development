package routes

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"

	"backend/go_server/utils"
	"backend/go_server/models"
	"backend/go_server/services"
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
        utils.JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
        return
    }

    // Limit overall request size (prevents huge uploads)
    r.Body = http.MaxBytesReader(w, r.Body, 12<<20) // 12MB max

    log.Println("Signup request received")

    // Parse multipart form (10 MB max)
    if err := r.ParseMultipartForm(10 << 20); err != nil {
        log.Println("Error parsing form:", err)
        utils.JSONError(w, http.StatusBadRequest, "Error parsing form")
        return
    }

    // Extract fields
    email := strings.TrimSpace(r.FormValue("email"))
    password := r.FormValue("password")
    phone := strings.TrimSpace(r.FormValue("phone"))
    username := strings.TrimSpace(r.FormValue("username"))

    // Text field size validation
    if len(email) > 254 {
        utils.JSONError(w, http.StatusBadRequest, "Email too long")
        return
    }
    if len(username) > 30 {
        utils.JSONError(w, http.StatusBadRequest, "Username too long")
        return
    }
    if len(password) > 128 {
        utils.JSONError(w, http.StatusBadRequest, "Password too long")
        return
    }

    // Validate email
    if email == "" || !emailRegex.MatchString(email) {
        utils.JSONError(w, http.StatusBadRequest, "Invalid or empty email")
        return
    }

    // Validate password
    if password == "" || !IsValidPassword(password) {
        utils.JSONError(w, http.StatusBadRequest, "Password must be at least 6 characters, include 1 uppercase, 1 lowercase, and 1 number")
        return
    }

    // Validate phone
    if !phoneRegex.MatchString(phone) {
        utils.JSONError(w, http.StatusBadRequest, "Phone must be exactly 10 digits")
        return
    }

    // Validate username
    if username == "" || !usernameRegex.MatchString(username) {
        utils.JSONError(w, http.StatusBadRequest, "Username must be 3-30 characters, letters/numbers/_/- only")
        return
    }

    // Validate resume file
    file, header, err := r.FormFile("resume")
    if err != nil || file == nil {
        utils.JSONError(w, http.StatusBadRequest, "Resume file is required")
        return
    }
    defer file.Close()

    // Check file size (max 10MB)
    if header.Size > 10<<20 {
        utils.JSONError(w, http.StatusBadRequest, "Resume file too large (max 10 MB)")
        return
    }

    // Allow only PDF/DOC/DOCX
    allowedExt := regexp.MustCompile(`(?i)\.(pdf|doc|docx)$`)
    if !allowedExt.MatchString(header.Filename) {
        utils.JSONError(w, http.StatusBadRequest, "Resume must be PDF/DOC/DOCX")
        return
    }

    // Upload resume to GridFS
    resumeID, err := services.UploadResumeToGridFS(file, header.Filename)
    if err != nil {
        utils.JSONError(w, http.StatusInternalServerError, "Error uploading resume: "+err.Error())
        return
    }

    // Create user object
    user := models.User{
        Email:    email,
        Password: password,
        Phone:    phone,
        Username: username,
        ResumeID: &resumeID,
    }

    // Call service layer to create user
    if err := services.Signup(user); err != nil {
        utils.JSONError(w, http.StatusBadRequest, err.Error())
        return
    }

    // Success response
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Signup successful",
    })
}


// LoginHandler handles user login with input validation
func LoginHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        utils.JSONError(w, http.StatusMethodNotAllowed, "Method not allowed")
        return
    }

    // Limit request size to 1MB (prevents large JSON attacks)
    r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB

    var creds struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
        utils.JSONError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    email := strings.TrimSpace(creds.Email)
    password := creds.Password

    // Size limits
    if len(email) > 254 {
        utils.JSONError(w, http.StatusBadRequest, "Email too long")
        return
    }
    if len(password) > 128 {
        utils.JSONError(w, http.StatusBadRequest, "Password too long")
        return
    }

    // Basic validation
    if email == "" || password == "" {
        utils.JSONError(w, http.StatusBadRequest, "Email and password cannot be empty")
        return
    }

    if !emailRegex.MatchString(email) {
        utils.JSONError(w, http.StatusBadRequest, "Invalid email format")
        return
    }

    // Password strength (same rules as signup)
    if len(password) < 6 ||
        !regexp.MustCompile(`[a-z]`).MatchString(password) ||
        !regexp.MustCompile(`[A-Z]`).MatchString(password) ||
        !regexp.MustCompile(`\d`).MatchString(password) {
        utils.JSONError(w, http.StatusBadRequest, "Password must be at least 6 characters, include 1 uppercase, 1 lowercase, and 1 number")
        return
    }

    // Use existing Login service
    valid, accessToken, username := services.Login(email, password)
    if !valid {
        utils.JSONError(w, http.StatusUnauthorized, "Invalid email or password")
        return
    }

    // Respond with token + username
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "valid":        true,
        "access_token": accessToken,
        "username":     username,
    })
}

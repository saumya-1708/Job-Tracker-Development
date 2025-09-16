package routes

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
	"strconv"

	"backend/go_server/db"
	"backend/go_server/models"
)

// ✅ Max file size = 5MB
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

func UserDetailsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// ✅ Parse multipart form
	err := r.ParseMultipartForm(MAX_UPLOAD_SIZE)
	if err != nil {
		http.Error(w, "File too big or bad request", http.StatusBadRequest)
		return
	}

	// ✅ Extract form fields
	name := strings.TrimSpace(r.FormValue("name"))
	email := strings.TrimSpace(r.FormValue("email"))
	ageStr := strings.TrimSpace(r.FormValue("age"))
	domain := strings.TrimSpace(r.FormValue("domain"))
	skillsStr := strings.TrimSpace(r.FormValue("skills"))
	resumeFile, handler, err := r.FormFile("resume")

	if name == "" || email == "" || ageStr == "" || domain == "" || skillsStr == "" || err != nil {
		http.Error(w, "All fields including resume are required", http.StatusBadRequest)
		return
	}
	defer resumeFile.Close()

	// ✅ Convert & validate age
	age, err := strconv.Atoi(ageStr)
	if err != nil || age < 18 || age > 99 {
		http.Error(w, "Age must be a valid number between 18 and 99", http.StatusBadRequest)
		return
	}

	// ✅ Validate name (letters + spaces only)
	nameRegex := regexp.MustCompile(`^[A-Za-z\s]+$`)
	if !nameRegex.MatchString(name) {
		http.Error(w, "Name must contain only letters and spaces", http.StatusBadRequest)
		return
	}

	// ✅ Validate email format
	emailRegex := regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	if !emailRegex.MatchString(email) {
		http.Error(w, "Invalid email format", http.StatusBadRequest)
		return
	}

	// ✅ Validate skills (at least 2 comma-separated)
	skills := strings.Split(skillsStr, ",")
	for i := range skills {
		skills[i] = strings.TrimSpace(skills[i])
	}
	if len(skills) < 2 {
		http.Error(w, "Enter at least two comma-separated skills", http.StatusBadRequest)
		return
	}

	// ✅ Validate resume file type (only PDF)
	if !strings.HasSuffix(strings.ToLower(handler.Filename), ".pdf") {
		http.Error(w, "Resume must be a PDF file", http.StatusBadRequest)
		return
	}

	// ✅ Save file inside backend/uploads
	uploadPath := "./backend/uploads"
	os.MkdirAll(uploadPath, os.ModePerm)

	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), handler.Filename)
	filePath := filepath.Join(uploadPath, fileName)

	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Unable to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()
	io.Copy(dst, resumeFile)

	// ✅ Generate public URL
	fileURL := fmt.Sprintf("http://localhost:8080/uploads/%s", fileName)

	// ✅ Create user object
	user := models.UserDetails{
		Name:   name,
		Email:  email,
		Age:    age,
		Domain: domain,
		Skills: skills,
		Resume: fileURL,
	}

	// ✅ Insert into MongoDB
	_, err = db.UserDetailsCollection.InsertOne(context.Background(), user)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// ✅ Success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User saved successfully",
		"resume":  fileURL,
	})
}

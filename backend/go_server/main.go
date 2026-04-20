package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"backend/go_server/db"
	"backend/go_server/middleware"
	"backend/go_server/routes"
	"backend/go_server/services"
)

// enableCORS sets CORS headers for requests
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
		origin := r.Header.Get("Origin")

		for _, allowed := range allowedOrigins {
			if strings.TrimSpace(origin) == strings.TrimSpace(allowed) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				break
			}
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, Accept")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware logs each request
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("%s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize MongoDB
	db.InitMongo()
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is missing in environment")
	}
	services.InitJWT(jwtSecret)

	// Create mux
	mux := http.NewServeMux()

	// Public routes (no JWT required)
	mux.HandleFunc("/signup", routes.SignupHandler)
	mux.HandleFunc("/login", routes.LoginHandler)

	// Protected routes (JWT required)
    mux.Handle("/preferences", middleware.JWTAuth(http.HandlerFunc(routes.PreferencesHandler)))
	mux.Handle("/profile", middleware.JWTAuth(http.HandlerFunc(routes.ProfileHandler)))
	mux.Handle("/jobs-history", middleware.JWTAuth(http.HandlerFunc(routes.JobsHistoryHandler)))

	// Wrap mux with CORS and logging middleware
	handler := enableCORS(loggingMiddleware(mux))

	// Start server
	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

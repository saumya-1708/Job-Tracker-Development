package main

import (
	"log"
	"net/http"

	"backend/go_server/db"
	"backend/go_server/routes"
)

// ✅ CORS setup
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	// ✅ Initialize MongoDB
	db.InitMongo()

	// ✅ Create mux
	mux := http.NewServeMux()

	// Auth routes
	mux.HandleFunc("/signup", routes.SignupHandler)
	mux.HandleFunc("/login", routes.LoginHandler)

	// ✅ User upload route
	mux.HandleFunc("/api/user-details", routes.UserDetailsHandler)
	mux.HandleFunc("/api/jobs/recommend", routes.RecommendJobsHandler)

	// ✅ Serve static files from uploads folder
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./backend/uploads"))))

	// ✅ Start server
	log.Println("🚀 Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", enableCORS(mux)))
}

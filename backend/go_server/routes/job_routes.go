package routes

import (
    "context"
    "encoding/json"
    "log"
    "net/http"

    "backend/go_server/db"
    "backend/go_server/middleware"
    "backend/go_server/models"

    "go.mongodb.org/mongo-driver/bson"
)

// JobsDataHandler fetches jobs for the logged-in user based on preference
func JobsDataHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Get username from JWT (set by middleware)
    usernameCtx := r.Context().Value(middleware.ContextUsernameKey)
    username, ok := usernameCtx.(string)
    if !ok || username == "" {
        http.Error(w, "Unauthorized: username not found", http.StatusUnauthorized)
        return
    }
    log.Println("✅ JobsDataHandler called for user:", username)

    // Parse request body to get preferenceId
    var req struct {
        PreferenceID string `json:"preferenceId"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }
    log.Println("📩 Received preferenceId:", req.PreferenceID)

    // Build filter
    filter := bson.M{"username": username}
    if req.PreferenceID != "" {
        filter["preferenceId"] = req.PreferenceID
    }
    log.Println("🔎 MongoDB filter:", filter)

    // Fetch jobs
    cursor, err := db.JobsCollection.Find(context.TODO(), filter)
    if err != nil {
        http.Error(w, "Failed to fetch jobs", http.StatusInternalServerError)
        log.Println("❌ MongoDB find error:", err)
        return
    }
    defer cursor.Close(context.TODO())

    var jobs []models.Job
    if err := cursor.All(context.TODO(), &jobs); err != nil {
        http.Error(w, "Failed to parse jobs", http.StatusInternalServerError)
        log.Println("❌ MongoDB cursor error:", err)
        return
    }

    log.Println("📊 Jobs fetched:", len(jobs))

    // If no jobs found, fetch all jobs for this user (ignore preferenceId)
    if len(jobs) == 0 && req.PreferenceID != "" {
        log.Println("⚠️ No jobs found with preferenceId, fetching all jobs for user...")
        cursor, err = db.JobsCollection.Find(context.TODO(), bson.M{"username": username})
        if err == nil {
            defer cursor.Close(context.TODO())
            _ = cursor.All(context.TODO(), &jobs)
            log.Println("📊 Total jobs fetched ignoring preferenceId:", len(jobs))
        }
    }

    // Convert jobs to frontend-friendly format
    type JobResponse struct {
        Title    string   `json:"Title"`
        Company  string   `json:"Company"`
        Website  string   `json:"Website"`
        Location string   `json:"Location"`
        Type     string   `json:"Type"`
        Skills   []string `json:"Skills"`
    }

    var resp []JobResponse
    for _, job := range jobs {
        resp = append(resp, JobResponse{
            Title:    job.Title,
            Company:  job.Company,
            Website:  job.Website,
            Location: "Remote",
            Type:     "Full-Time",
            Skills:   job.Skills,
        })
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(resp)
    log.Println("✅ Response sent with", len(resp), "jobs")
}

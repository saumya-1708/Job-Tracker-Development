package routes

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"backend/go_server/db"
	"backend/go_server/middleware"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func JobsHistoryHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("🚀 JobsHistoryHandler called")

	if r.Method != http.MethodGet {
		log.Println("❌ Invalid method:", r.Method)
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	usernameCtx := r.Context().Value(middleware.ContextUsernameKey)
	username, ok := usernameCtx.(string)
	if !ok || username == "" {
		log.Println("❌ Username missing in context")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	log.Println("👤 Fetching history for user:", username)

	// DB query
	findOptions := options.Find().SetSort(bson.M{"createdAt": -1})
	cursor, err := db.PreferencesCollection.Find(context.TODO(), bson.M{"username": username}, findOptions)
	if err != nil {
		log.Println("❌ DB find error:", err)
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var prefs []bson.M
	if err := cursor.All(context.TODO(), &prefs); err != nil {
		log.Println("❌ Cursor parse error:", err)
		http.Error(w, "Parse error", http.StatusInternalServerError)
		return
	}

	log.Println("📦 Total preferences fetched:", len(prefs))

	var history []map[string]interface{}

	for _, pref := range prefs {
		log.Println("🔍 Processing preference record")

		// ID
		prefID := ""
		if id, ok := pref["_id"].(primitive.ObjectID); ok {
			prefID = id.Hex()
		}
		log.Println("🆔 Preference ID:", prefID)

		// Status
		status := "pending"
		if s, ok := pref["status"].(string); ok {
			status = s
		}
		log.Println("📊 Status:", status)

		// Extract jobs
		jobsMap := make(map[string][]string)

		if jobs, ok := pref["jobs"].(bson.M); ok {
			log.Println("📁 Jobs found in DB")

			for k, v := range jobs {

				log.Printf("🔍 Raw type for %s: %T\n", k, v)

				// 🔥 FORCE convert to slice
				arr, ok := v.(primitive.A)
				if !ok {
					// try fallback
					if temp, ok := v.([]interface{}); ok {
						arr = temp
					} else {
						log.Println("❌ Cannot convert jobs for:", k)
						continue
					}
				}

				for _, item := range arr {
					str, ok := item.(string)
					if ok {
						jobsMap[k] = append(jobsMap[k], str)
					}
				}
			}
		} else {
			log.Println("⚠️ No jobs field or wrong format")
		}

		// Count jobs
		jobCount := 0
		finalJobs := map[string][]string{}

		if status == "success" {
			finalJobs = jobsMap
			for _, links := range jobsMap {
				jobCount += len(links)
			}
		}

		log.Println("📈 Job count:", jobCount)

		history = append(history, map[string]interface{}{
			"PreferenceID": prefID,
			"CreatedAt":    pref["createdAt"],
			"Status":       status,
			"JobCount":     jobCount,
			"Jobs":         finalJobs,
			"roles":        pref["roles"],
			"locations":    pref["locations"],
			"experience":   pref["experience"],
			"salaryRange":  pref["salaryRange"],
		})
	}

	log.Println("✅ Sending response with history count:", len(history))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

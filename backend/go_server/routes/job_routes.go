package routes

import (
	"context"
	"encoding/json"
	"net/http"

	"backend/go_server/db"
	"backend/go_server/middleware"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// JobsHistoryHandler returns all preference requests for a user with status and job count
func JobsHistoryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	usernameCtx := r.Context().Value(middleware.ContextUsernameKey)
	username, ok := usernameCtx.(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Sort by createdAt descending (latest first)
	findOptions := options.Find().SetSort(bson.M{"createdAt": -1})
	cursor, err := db.PreferencesCollection.Find(context.TODO(), bson.M{"username": username}, findOptions)
	if err != nil {
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.TODO())

	var prefs []bson.M
	if err := cursor.All(context.TODO(), &prefs); err != nil {
		http.Error(w, "Parse error", http.StatusInternalServerError)
		return
	}

	var history []map[string]interface{}
	for _, pref := range prefs {
		prefID := ""
		if id, ok := pref["_id"].(primitive.ObjectID); ok {
			prefID = id.Hex()
		}

		// Determine status
		status := "pending"
		if s, ok := pref["status"].(string); ok {
			status = s
		}

		// Fetch embedded jobs
		jobsMap := make(map[string][]string)
		if jobs, ok := pref["jobs"].(map[string]interface{}); ok {
			for k, v := range jobs {
				if links, ok := v.([]interface{}); ok {
					for _, link := range links {
						if str, ok := link.(string); ok {
							jobsMap[k] = append(jobsMap[k], str)
						}
					}
				}
			}
		}

		// Count total jobs
		jobCount := 0
		for _, links := range jobsMap {
			jobCount += len(links)
		}

		history = append(history, map[string]interface{}{
			"PreferenceID": prefID,
			"CreatedAt":    pref["createdAt"],
			"Status":       status,
			"JobCount":     jobCount,
			"Jobs":         jobsMap, // send full jobs map for download/view
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

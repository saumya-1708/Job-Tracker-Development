package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PreferenceDetails struct {
	ID          primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	Username    string              `json:"username" bson:"username"`
	Roles       []string            `json:"roles" bson:"roles"`
	Locations   []string            `json:"locations" bson:"locations"`
	Experience  int                 `json:"experience" bson:"experience"`
	SalaryRange [2]int              `json:"salaryRange" bson:"salaryRange"`
	Status      string              `json:"status" bson:"status"` // pending, success, failed
	Jobs        map[string][]string `json:"jobs" bson:"jobs"`     // jobs embedded in preference
	CreatedAt   time.Time           `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time           `json:"updatedAt" bson:"updatedAt"`
}

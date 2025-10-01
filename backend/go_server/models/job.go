package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Job represents a single job recommendation for a user preference
type Job struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       primitive.ObjectID `bson:"userId" json:"userId"`           // Reference to the user
	PreferenceID primitive.ObjectID `bson:"preferenceId" json:"preferenceId"` // Reference to the preference set
	Title        string             `bson:"title" json:"title"`
	Company      string             `bson:"company" json:"company"`
	Website      string             `bson:"website" json:"website"`
	Skills       []string           `bson:"skills" json:"skills"`
	CreatedAt    primitive.DateTime `bson:"createdAt" json:"createdAt"` // Optional: when this job was saved
}

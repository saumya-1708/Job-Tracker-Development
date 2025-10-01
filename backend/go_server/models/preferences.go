package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type PreferenceDetails struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Username    string             `json:"username" bson:"username"`  // Added username
	Roles       []string `json:"roles" bson:"roles"`
	Locations   []string `json:"locations" bson:"locations"`
	Experience  int      `json:"experience" bson:"experience"`
	SalaryRange [2]int   `json:"salaryRange" bson:"salaryRange"`
}

package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
    Email    string             `json:"email" bson:"email"`
    Password string             `json:"password" bson:"password"`
    Phone    string             `json:"phone" bson:"phone"`
    Username string             `json:"username" bson:"username"`
    ResumeID *primitive.ObjectID `json:"resumeId,omitempty" bson:"resumeId,omitempty"`
}

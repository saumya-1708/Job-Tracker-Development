package models

type User struct {
	Email string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
	Phone    string `json:"phone" bson:"phone"`
    Username string `json:"username" bson:"username"`
}

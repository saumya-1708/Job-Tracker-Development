package models

type UserDetails struct {
	Name   string `json:"name" bson:"name" validate:"required"`
	Email  string `json:"email" bson:"email" validate:"required,email"`
	Age    int    `json:"age" bson:"age" validate:"gte=1,lte=120"`
	Domain string `json:"domain" bson:"domain" validate:"required"`
	Skills []string `json:"skills" bson:"skills" validate:"required"`
	Resume string `json:"resume" bson:"resume" validate:"required"`
}

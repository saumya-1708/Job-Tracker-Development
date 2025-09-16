package services

import (
	"backend/go_server/db"
	"backend/go_server/models"
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("my_secret_key")

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

type RefreshTokenRecord struct {
	Email    string    `bson:"email"`
	Token       string    `bson:"token"`
	ExpiresAt   time.Time `bson:"expires_at"`
	CreatedAt   time.Time `bson:"created_at"`
}

// Signup checks if username exists, hashes password, inserts new user
func Signup(user models.User) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var existingUser models.User
    err := db.UserCollection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existingUser)
    if err == nil {
        return fmt.Errorf("email already exists")
    }
    if err != mongo.ErrNoDocuments {
        return fmt.Errorf("database error: %w", err)
    } 

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("failed to hash password: %w", err)
    } 
    user.Password = string(hashedPassword)

    _, err = db.UserCollection.InsertOne(ctx, bson.M{
    "email":    user.Email,
    "password": user.Password,
    "phone":    user.Phone,
    "username": user.Username,
})

    if err != nil {
        return fmt.Errorf("failed to insert user: %w", err)
    }
    return nil
} 


// Login returns access and refresh tokens and stores refresh token in DB
func Login(email, password string) (bool, string) {
	var storedUser models.User
	err := db.UserCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&storedUser)
	if err != nil {
		fmt.Println("Login error: user not found")
		return false, ""
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(password))
	if err != nil {
		fmt.Println("Login error: invalid password for", email)
		return false, ""
	}

	// Generate tokens
	accessToken, _ := generateToken(email, time.Minute*15)
	refreshToken, _ := generateToken(email, time.Hour*24*7)

	// Store refresh token in DB with logging
	refreshRecord := RefreshTokenRecord{
		Email:     email,
		Token:     refreshToken,
		ExpiresAt: time.Now().Add(time.Hour * 24 * 7),
		CreatedAt: time.Now(),
	}

	insertResult, err := db.RefreshTokenCollection.InsertOne(context.TODO(), refreshRecord)
	if err != nil {
		fmt.Println("Error inserting refresh token for", email, ":", err)
		return false, ""
	} else {
		fmt.Println("Refresh token inserted successfully with ID:", insertResult.InsertedID)
	}

	return true, accessToken
}


func generateToken(email string, duration time.Duration) (string, error) {
	expirationTime := time.Now().Add(duration)
	claims := &Claims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

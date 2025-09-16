package db

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var UserCollection *mongo.Collection
var RefreshTokenCollection *mongo.Collection
var UserDetailsCollection *mongo.Collection // ✅ new collection

func InitMongo() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("⚠️ No .env file found, relying on system environment variables")
	}

	// Get Mongo URI from environment
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("❌ MONGO_URI not set in environment")
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	Client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal(err)
	}

	// Database for users
	UserCollection = Client.Database("authdb").Collection("users")

	// Separate database for refresh tokens
	RefreshTokenCollection = Client.Database("token_db").Collection("refresh_tokens")

	// ✅ New collection for user details
	UserDetailsCollection = Client.Database("authdb").Collection("user_details")

	log.Println("✅ Connected to MongoDB")
}

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
var PreferencesCollection *mongo.Collection 
var JobsCollection *mongo.Collection 


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
	// indexModel := mongo.IndexModel{
	// 	Keys:    bson.D{{Key: "email", Value: 1}},
	// 	Options: options.Index().SetUnique(true),
	// }
	// _, err = UserCollection.Indexes().CreateOne(context.Background(), indexModel)
	// if err != nil {
	// 	log.Fatalf("❌ Could not create index on email: %v", err)
	//}

	// Separate database for refresh tokens
	RefreshTokenCollection = Client.Database("token_db").Collection("refresh_tokens")

	// ✅ New collection for user preferences
	PreferencesCollection = Client.Database("authdb").Collection("preferences")
	
	//New collection for jobs
	JobsCollection = Client.Database("job_db").Collection("jobs")
	log.Println("✅ Connected to MongoDB")
}

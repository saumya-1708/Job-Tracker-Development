package services

import (
	"context"
	"io"
	"log"
	"time"

	"backend/go_server/db"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
)

// UploadResumeToGridFS uploads a resume to GridFS and returns its ObjectID
func UploadResumeToGridFS(file io.Reader, filename string) (primitive.ObjectID, error) {
	// Set a timeout for GridFS operations
	_, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Create a GridFS bucket on the "authdb" database
	bucket, err := gridfs.NewBucket(
		db.Client.Database("authdb"),
	)
	if err != nil {
		return primitive.NilObjectID, err
	}

	// Open upload stream
	uploadStream, err := bucket.OpenUploadStream(filename)
	if err != nil {
		return primitive.NilObjectID, err
	}
	defer uploadStream.Close()

	// Copy file content into GridFS
	_, err = io.Copy(uploadStream, file)
	if err != nil {
		return primitive.NilObjectID, err
	}

	log.Printf("✅ Resume %s uploaded to GridFS successfully", filename)
	return uploadStream.FileID.(primitive.ObjectID), nil
}

package services

import (
	"bytes"
	"context"
	"io"
	"time"

	"backend/go_server/db"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
)

// GetFileFromGridFS retrieves a file from GridFS by its ObjectID
func GetFileFromGridFS(fileID primitive.ObjectID) ([]byte, error) {
	// Set a timeout context
	_, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Create a GridFS bucket
	bucket, err := gridfs.NewBucket(db.Client.Database("jobtracker_db"))
	if err != nil {
		return nil, err
	}

	// Open download stream by ObjectID
	var buf bytes.Buffer
	downloadStream, err := bucket.OpenDownloadStream(fileID)
	if err != nil {
		return nil, err
	}
	defer downloadStream.Close()

	// Copy the file content to buffer
	_, err = io.Copy(&buf, downloadStream)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

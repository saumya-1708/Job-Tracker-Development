package models

type Job struct {
    ID       string   `bson:"_id,omitempty" json:"id"`
    Title    string   `bson:"title" json:"title"`
    Company  string   `bson:"company" json:"company"`
    Location string   `bson:"location" json:"location"`
    Type     string   `bson:"type" json:"type"`
    Website  string   `bson:"website" json:"website"`
    Skills   []string `bson:"skills" json:"skills"`
}

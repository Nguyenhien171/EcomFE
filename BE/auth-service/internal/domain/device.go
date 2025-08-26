package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Device struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    UserID    primitive.ObjectID `bson:"userId" json:"userId"`
    UserAgent string             `bson:"userAgent" json:"userAgent"`
    IP        string             `bson:"ip" json:"ip"`
    IsActive  bool               `bson:"isActive" json:"isActive"`
    CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

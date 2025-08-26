package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RefreshToken struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    Token     string             `bson:"token" json:"token"`
    UserID    primitive.ObjectID `bson:"userId" json:"userId"`
    DeviceID  primitive.ObjectID `bson:"deviceId" json:"deviceId"`
    ExpiresAt time.Time          `bson:"expiresAt" json:"expiresAt"`
    CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

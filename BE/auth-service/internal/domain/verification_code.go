package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
    VerificationTypeRegister       = "REGISTER"
    VerificationTypeForgotPassword = "FORGOT_PASSWORD"
)

type VerificationCode struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    Email     string             `bson:"email" json:"email"`
    Code      string             `bson:"code" json:"code"`
    Type      string             `bson:"type" json:"type"`
    ExpiresAt time.Time          `bson:"expiresAt" json:"expiresAt"`
    CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

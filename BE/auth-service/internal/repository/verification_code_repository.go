package repository

import (
	"context"
	"time"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

type VerificationCodeRepository struct {
    col *mongo.Collection
    log *zap.Logger
}

func NewVerificationCodeRepository(db *mongo.Database, log *zap.Logger) *VerificationCodeRepository {
    return &VerificationCodeRepository{
        col: db.Collection("verification_codes"),
        log: log.With(zap.String("component", "VerificationCodeRepository")),
    }
}

func (r *VerificationCodeRepository) Create(ctx context.Context, code *domain.VerificationCode) error {
    code.CreatedAt = time.Now()
    _, err := r.col.InsertOne(ctx, code)
    if err != nil {
        r.log.Error("Create verification code failed", zap.Error(err))
    }
    return err
}

func (r *VerificationCodeRepository) Validate(ctx context.Context, email, code, otpType string) error {
    filter := bson.M{"email": email, "code": code, "type": otpType}
    var verificationCode domain.VerificationCode
    err := r.col.FindOne(ctx, filter).Decode(&verificationCode)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return err
        }
        r.log.Error("Find verification code failed", zap.Error(err))
        return err
    }
    if verificationCode.ExpiresAt.Before(time.Now()) {
        return err
    }
    return nil
}

func (r *VerificationCodeRepository) Delete(ctx context.Context, email, code, otpType string) error {
    filter := bson.M{"email": email, "code": code, "type": otpType}
    _, err := r.col.DeleteOne(ctx, filter)
    if err != nil {
        r.log.Error("Delete verification code failed", zap.Error(err))
    }
    return err
}

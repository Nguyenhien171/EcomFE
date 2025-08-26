package repository

import (
	"context"
	"time"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

type RefreshTokenRepository struct {
    col *mongo.Collection
    log *zap.Logger
}

func NewRefreshTokenRepository(db *mongo.Database, log *zap.Logger) *RefreshTokenRepository {
    return &RefreshTokenRepository{
        col: db.Collection("refreshTokens"),
        log: log.With(zap.String("component", "RefreshTokenRepository")),
    }
}

func (r *RefreshTokenRepository) EnsureIndexes() {
    idx := mongo.IndexModel{
        Keys:    bson.D{{Key: "token", Value: 1}},
        Options: options.Index().SetUnique(true),
    }
    _, err := r.col.Indexes().CreateOne(context.Background(), idx)
    if err != nil {
        r.log.Fatal("Failed to create refresh token unique index", zap.Error(err))
    }

    ttlIdx := mongo.IndexModel{
        Keys:    bson.D{{Key: "expiresAt", Value: 1}},
        Options: options.Index().SetExpireAfterSeconds(0),
    }
    _, err = r.col.Indexes().CreateOne(context.Background(), ttlIdx)
    if err != nil {
        r.log.Fatal("Failed to create refresh token TTL index", zap.Error(err))
    }
}

func (r *RefreshTokenRepository) Create(ctx context.Context, token *domain.RefreshToken) error {
    token.ID = primitive.NewObjectID()
    token.CreatedAt = time.Now()
    _, err := r.col.InsertOne(ctx, token)
    if err != nil {
        r.log.Error("Create RefreshToken failed", zap.Error(err))
    }
    return err
}

func (r *RefreshTokenRepository) FindWithUser(ctx context.Context, token string) (*domain.RefreshToken, error) {
    pipeline := mongo.Pipeline{
        {{Key: "$match", Value: bson.M{"token": token}}},
        {{Key: "$lookup", Value: bson.M{
            "from":         "users",
            "localField":   "userId",
            "foreignField": "_id",
            "as":           "user",
        }}},
        {{Key: "$unwind", Value: "$user"}},
        {{Key: "$lookup", Value: bson.M{
            "from":         "roles",
            "localField":   "user.roleId",
            "foreignField": "_id",
            "as":           "user.role",
        }}},
        {{Key: "$unwind", Value: "$user.role"}},
    }
    cursor, err := r.col.Aggregate(ctx, pipeline)
    if err != nil {
        r.log.Error("RefreshToken FindWithUser aggregate failed", zap.Error(err))
        return nil, err
    }
    defer cursor.Close(ctx)
    var tokens []domain.RefreshToken
    if err := cursor.All(ctx, &tokens); err != nil {
        r.log.Error("RefreshToken aggregation decode failed", zap.Error(err))
        return nil, err
    }
    if len(tokens) == 0 {
        return nil, nil
    }
    return &tokens[0], nil
}

func (r *RefreshTokenRepository) Delete(ctx context.Context, token string) (*domain.RefreshToken, error) {
    var deletedToken domain.RefreshToken
    err := r.col.FindOneAndDelete(ctx, bson.M{"token": token}).Decode(&deletedToken)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return nil, nil
        }
        r.log.Error("Delete RefreshToken failed", zap.Error(err))
        return nil, err
    }
    return &deletedToken, nil
}

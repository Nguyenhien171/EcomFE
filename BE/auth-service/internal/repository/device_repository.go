package repository

import (
	"context"
	"time"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

type DeviceRepository struct {
    col *mongo.Collection
    log *zap.Logger
}

func NewDeviceRepository(db *mongo.Database, log *zap.Logger) *DeviceRepository {
    return &DeviceRepository{
        col: db.Collection("devices"),
        log: log.With(zap.String("component", "DeviceRepository")),
    }
}

func (r *DeviceRepository) CreateDevice(ctx context.Context, device *domain.Device) (*domain.Device, error) {
    device.ID = primitive.NewObjectID()
    device.CreatedAt = time.Now()
    device.UpdatedAt = time.Now()
    device.IsActive = true // default active
    _, err := r.col.InsertOne(ctx, device)
    if err != nil {
        r.log.Error("CreateDevice failed", zap.Error(err))
        return nil, err
    }
    r.log.Info("CreateDevice succeeded", zap.String("deviceID", device.ID.Hex()))
    return device, nil
}

func (r *DeviceRepository) UpdateDevice(ctx context.Context, id primitive.ObjectID, updates bson.M) error {
    updates["updatedAt"] = time.Now()
    _, err := r.col.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": updates})
    if err != nil {
        r.log.Error("UpdateDevice failed", zap.String("deviceID", id.Hex()), zap.Error(err))
    }
    return err
}

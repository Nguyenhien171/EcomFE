package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

var ErrDuplicateEmail = errors.New("email already exists")

type UserRepository struct {
	db  *mongo.Database
	col *mongo.Collection
	log *zap.Logger
}

func NewUserRepository(db *mongo.Database, log *zap.Logger) *UserRepository {
	return &UserRepository{
		db:  db,
		col: db.Collection("users"),
		log: log,
	}
}

// --------- COUNTER (sequence) ---------

func (r *UserRepository) nextSeq(ctx context.Context, name string) (int64, error) {
	counters := r.db.Collection("counters")
	res := counters.FindOneAndUpdate(
		ctx,
		bson.M{"_id": name},
		bson.M{"$inc": bson.M{"seq": 1}},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	)
	var doc struct {
		Seq int64 `bson:"seq"`
	}
	if err := res.Decode(&doc); err != nil {
		return 0, err
	}
	return doc.Seq, nil
}

// --------- CRUD ---------

func (r *UserRepository) CreateUser(ctx context.Context, u *domain.User) (*domain.User, error) {
	now := time.Now().UTC()
	u.ID = primitive.NewObjectID()
	u.CreatedAt = now
	u.UpdatedAt = now
	u.IsActive = true

	// cấp userCode (số tăng dần)
	code, err := r.nextSeq(ctx, "userCode")
	if err != nil {
		return nil, err
	}
	u.UserCode = code

	_, err = r.col.InsertOne(ctx, u)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "e11000") {
			return nil, ErrDuplicateEmail
		}
		return nil, err
	}
	return u, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var u domain.User
	err := r.col.FindOne(ctx, bson.M{"email": email}).Decode(&u)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*domain.User, error) {
	var u domain.User
	err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&u)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

// --- thao tác theo userCode (ID số nhỏ) ---

func (r *UserRepository) FindByCode(ctx context.Context, code int64) (*domain.User, error) {
	var u domain.User
	err := r.col.FindOne(ctx, bson.M{"userCode": code}).Decode(&u)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) UpdateByCode(ctx context.Context, code int64, updates bson.M) (*domain.User, error) {
	updates["updatedAt"] = time.Now().UTC()
	res := r.col.FindOneAndUpdate(
		ctx,
		bson.M{"userCode": code},
		bson.M{"$set": updates},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)
	var u domain.User
	if err := res.Decode(&u); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		if strings.Contains(strings.ToLower(err.Error()), "e11000") {
			return nil, ErrDuplicateEmail
		}
		return nil, err
	}
	u.Password = ""
	return &u, nil
}

func (r *UserRepository) DeleteByCode(ctx context.Context, code int64) error {
	res, err := r.col.DeleteOne(ctx, bson.M{"userCode": code})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (r *UserRepository) FindAll(ctx context.Context) ([]*domain.User, error) {
	cur, err := r.col.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []*domain.User
	for cur.Next(ctx) {
		var u domain.User
		if err := cur.Decode(&u); err != nil {
			return nil, err
		}
		u.Password = ""
		out = append(out, &u)
	}
	return out, cur.Err()
}

func (r *UserRepository) FindByRole(ctx context.Context, role string) ([]*domain.User, error) {
	cur, err := r.col.Find(ctx, bson.M{"role": role})
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []*domain.User
	for cur.Next(ctx) {
		var u domain.User
		if err := cur.Decode(&u); err != nil {
			return nil, err
		}
		u.Password = ""
		out = append(out, &u)
	}
	return out, cur.Err()
}

// Unique index (gọi lúc bootstrap)
func (r *UserRepository) EnsureIndexes(ctx context.Context) error {
	_, err := r.col.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("uniq_email"),
		},
		{
			Keys:    bson.D{{Key: "userCode", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("uniq_userCode"),
		},
	})
	return err
}

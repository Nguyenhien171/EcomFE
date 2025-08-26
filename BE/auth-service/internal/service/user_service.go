// service/user_service.go
package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/repository"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/hashing"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"
)

var (
	ErrForbiddenRole = errors.New("forbidden to create or assign target role")
	ErrInvalidRole   = errors.New("invalid role")
	ErrUserNotFound  = errors.New("user not found")
)

type UserService struct {
	repo       *repository.UserRepository
	hashingSvc *hashing.HashingService
	log        *zap.Logger
	validate   *validator.Validate
}

func NewUserService(repo *repository.UserRepository, hashingSvc *hashing.HashingService, log *zap.Logger) *UserService {
	return &UserService{
		repo:       repo,
		hashingSvc: hashingSvc,
		log:        log,
		validate:   validator.New(),
	}
}

func normalizeRole(s string) (string, error) {
	x := strings.ToUpper(strings.TrimSpace(s))
	switch x {
	case "ADMIN", "MANAGER", "STAFF":
		return x, nil
	default:
		return "", ErrInvalidRole
	}
}

// CreateUser: ADMIN tạo MANAGER/STAFF; MANAGER tạo STAFF
func (s *UserService) CreateUser(ctx context.Context, currentRole string, u *domain.User) (*domain.User, error) {
	// validate đầu vào (dựa trên tag trong domain nếu có)
	if err := s.validate.Struct(u); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// chuẩn hoá input
	u.Username = strings.TrimSpace(u.Username)
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))

	role, err := normalizeRole(u.Role)
	if err != nil {
		return nil, err
	}

	switch strings.ToUpper(currentRole) {
	case "ADMIN":
		if role != "MANAGER" && role != "STAFF" {
			return nil, ErrForbiddenRole
		}
	case "MANAGER":
		if role != "STAFF" {
			return nil, ErrForbiddenRole
		}
	default:
		return nil, ErrForbiddenRole
	}

	// hash password
	hashed, err := s.hashingSvc.Hash(u.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}
	u.Password = hashed
	u.Role = role

	created, err := s.repo.CreateUser(ctx, u) // repo sẽ tự gán userCode tăng dần
	if err != nil {
		return nil, err
	}

	created.Password = "" // không trả password ra ngoài
	return created, nil
}

// ListUsers: ADMIN xem tất cả; MANAGER chỉ xem STAFF
func (s *UserService) ListUsers(ctx context.Context, currentRole string) ([]*domain.User, error) {
	switch strings.ToUpper(currentRole) {
	case "ADMIN":
		return s.repo.FindAll(ctx)
	case "MANAGER":
		return s.repo.FindByRole(ctx, "STAFF")
	default:
		return nil, ErrForbiddenRole
	}
}

// GetUser: dùng userCode (ID số nhỏ)
func (s *UserService) GetUser(ctx context.Context, code int64) (*domain.User, error) {
	u, err := s.repo.FindByCode(ctx, code)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrUserNotFound
	}
	u.Password = ""
	    s.log.Info("Getuser on user service")

	return u, nil
}

func (s *UserService) GetUserByObjectID(ctx context.Context, id primitive.ObjectID) (*domain.User, error) {
    u, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, err
    }
    if u == nil {
        return nil, ErrUserNotFound
    }
    u.Password = ""
    return u, nil
}

// UpdateUser: dùng userCode (ID số nhỏ)
// - ADMIN đổi role bất kỳ
// - MANAGER chỉ đổi được thành STAFF
func (s *UserService) UpdateUser(ctx context.Context, currentRole string, code int64, updates map[string]any) (*domain.User, error) {
	// role guard nếu có yêu cầu đổi role
	if v, ok := updates["role"]; ok {
		roleStr, err := normalizeRole(fmt.Sprint(v))
		if err != nil {
			return nil, err
		}
		switch strings.ToUpper(currentRole) {
		case "ADMIN":
			// full quyền
		case "MANAGER":
			if roleStr != "STAFF" {
				return nil, ErrForbiddenRole
			}
		default:
			return nil, ErrForbiddenRole
		}
		updates["role"] = roleStr
	}

	// chuẩn hoá email nếu có
	if v, ok := updates["email"]; ok {
		updates["email"] = strings.ToLower(strings.TrimSpace(fmt.Sprint(v)))
	}
	// tự set updatedAt nếu layer trên chưa set
	if _, ok := updates["updatedAt"]; !ok {
		updates["updatedAt"] = time.Now().UTC()
	}

	u, err := s.repo.UpdateByCode(ctx, code, bson.M(updates))
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, ErrUserNotFound
	}
	if u != nil {
		u.Password = ""
	}
	return u, nil
}

// DeleteUser: dùng userCode (ID số nhỏ)
// - ADMIN xoá bất kỳ
// - MANAGER chỉ xoá STAFF
func (s *UserService) DeleteUser(ctx context.Context, currentRole string, code int64) error {
	user, err := s.repo.FindByCode(ctx, code)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	switch strings.ToUpper(currentRole) {
	case "ADMIN":
		// ok
	case "MANAGER":
		if strings.ToUpper(user.Role) != "STAFF" {
			return ErrForbiddenRole
		}
	default:
		return ErrForbiddenRole
	}

	return s.repo.DeleteByCode(ctx, code)
}

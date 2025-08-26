package service

import (
	"context"
	"errors"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/dto"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/repository"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/hashing"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/token"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"
)

var (
	ErrEmailNotFound           = errors.New("email not found")
	ErrInvalidCredentials      = errors.New("invalid credentials")
	ErrUnauthorizedAccess      = errors.New("unauthorized access")
	ErrRefreshTokenAlreadyUsed = errors.New("refresh token already used")
)

type AuthService struct {
	userRepo    *repository.UserRepository
	deviceRepo  *repository.DeviceRepository
	refreshRepo *repository.RefreshTokenRepository
	hashingSvc  *hashing.HashingService
	tokenSvc    *token.TokenService
	log         *zap.Logger
}

func NewAuthService(
	userRepo *repository.UserRepository,
	deviceRepo *repository.DeviceRepository,
	refreshRepo *repository.RefreshTokenRepository,
	hashingSvc *hashing.HashingService,
	tokenSvc *token.TokenService,
	log *zap.Logger,
) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		deviceRepo:  deviceRepo,
		refreshRepo: refreshRepo,
		hashingSvc:  hashingSvc,
		tokenSvc:    tokenSvc,
		log:         log,
	}
}

func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*dto.TokenResponse, error) {
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil || user == nil {
		return nil, ErrEmailNotFound
	}

	ok, err := s.hashingSvc.Compare(req.Password, user.Password)
	if err != nil || !ok {
		return nil, ErrInvalidCredentials
	}

	device := &domain.Device{
		UserID:    user.ID,
		UserAgent: req.UserAgent,
		IP:        req.Ip, // FIX: dùng req.IP (không phải req.Ip)
		IsActive:  true,
	}
	created, err := s.deviceRepo.CreateDevice(ctx, device)
	if err != nil {
		return nil, err
	}

	// KHÔNG còn user.RoleID / user.Role.Name — dùng user.Role (string)
	return s.generateTokens(ctx, user.ID, created.ID, primitive.NilObjectID, user.Role)
}

func (s *AuthService) RefreshToken(
	ctx context.Context,
	req dto.RefreshTokenRequest,
) (*dto.TokenResponse, error) {
	// 1. Xác thực chữ ký và expiry của refresh token
	claims, err := s.tokenSvc.VerifyRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, ErrUnauthorizedAccess
	}

	// 2. Xóa bản ghi refresh token cũ và trả về thông tin token đã xóa
	oldRT, err := s.refreshRepo.Delete(ctx, req.RefreshToken)
	if err != nil {
		return nil, err
	}
	if oldRT == nil {
		return nil, ErrRefreshTokenAlreadyUsed
	}

	// 3. Đánh dấu thiết bị cũ không còn active (không chặn flow nếu lỗi)
	if err := s.deviceRepo.UpdateDevice(ctx, oldRT.DeviceID, bson.M{"isActive": false}); err != nil {
		s.log.Warn("Failed to deactivate old device", zap.Error(err))
	}

	// 4. Chuyển claims.UserID (string) thành ObjectID
	userObjID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return nil, err
	}

	// 5. Lấy thông tin user (Role dạng string)
	user, err := s.userRepo.FindByID(ctx, userObjID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUnauthorizedAccess
	}

	return s.generateTokens(ctx, userObjID, oldRT.DeviceID, primitive.NilObjectID, user.Role)
}

func (s *AuthService) Logout(ctx context.Context, rt string) error {
	deleted, err := s.refreshRepo.Delete(ctx, rt)
	if err != nil || deleted == nil {
		return ErrRefreshTokenAlreadyUsed
	}
	return s.deviceRepo.UpdateDevice(ctx, deleted.DeviceID, map[string]interface{}{"isActive": false})
}

func (s *AuthService) ValidateToken(ctx context.Context, accessToken string) (bool, string, string) {
	claims, err := s.tokenSvc.VerifyAccessToken(accessToken)
	if err != nil {
		return false, "", ""
	}
	return true, claims.UserID, claims.RoleName
}

// generateTokens: tạm thời vẫn giữ roleID trong payload để tương thích,
// nhưng truyền primitive.NilObjectID. Nếu bạn sửa struct token để bỏ RoleID,
// hãy bỏ tham số roleID ở đây và trong payload.
func (s *AuthService) generateTokens(
	ctx context.Context,
	userID, deviceID, roleID primitive.ObjectID,
	roleName string,
) (*dto.TokenResponse, error) {
	// 1. Tạo payload cho access token
	atPayload := token.AccessTokenPayloadCreate{
		UserID:   userID,
		DeviceID: deviceID,
		RoleID:   roleID,   // giờ truyền NilObjectID
		RoleName: roleName, // "ADMIN" | "MANAGER" | "STAFF"
	}
	accessToken, err := s.tokenSvc.SignAccessToken(atPayload)
	if err != nil {
		return nil, err
	}

	// 2. Tạo payload cho refresh token
	rtPayload := token.RefreshTokenPayloadCreate{
		UserID: userID,
	}
	refreshToken, err := s.tokenSvc.SignRefreshToken(rtPayload)
	if err != nil {
		return nil, err
	}

	// 3. Lưu refresh token vào DB để chống tái sử dụng
	claims, err := s.tokenSvc.VerifyRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}
	rtRecord := &domain.RefreshToken{
		Token:     refreshToken,
		UserID:    userID,
		DeviceID:  deviceID,
		ExpiresAt: claims.ExpiresAt.Time,
	}
	if err := s.refreshRepo.Create(ctx, rtRecord); err != nil {
		return nil, err
	}

	return &dto.TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

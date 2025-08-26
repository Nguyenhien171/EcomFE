package server

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/dto"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/repository"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/service"
	mw "github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/middleware"
	"go.mongodb.org/mongo-driver/bson/primitive"

	authpb "github.com/linhhuynhcoding/jss-microservices/rpc/gen/auth"
	userpb "github.com/linhhuynhcoding/jss-microservices/rpc/gen/user"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"google.golang.org/protobuf/types/known/emptypb"
	empty "google.golang.org/protobuf/types/known/emptypb"
)

// Server implements both AuthServiceServer and UserServiceServer.
type Server struct {
	authpb.UnimplementedAuthServiceServer
	userpb.UnimplementedUserServiceServer

	authSvc *service.AuthService
	userSvc *service.UserService
	log     *zap.Logger
}

func NewServer(
	authSvc *service.AuthService,
	userSvc *service.UserService,
	log *zap.Logger,
) *Server {
	return &Server{authSvc: authSvc, userSvc: userSvc, log: log}
}

func (s *Server) Register(grpcServer *grpc.Server) {
	authpb.RegisterAuthServiceServer(grpcServer, s)
	userpb.RegisterUserServiceServer(grpcServer, s)
}

// ------------------ helpers ------------------

func roleEnumToString(r userpb.Role) (string, bool) {
	switch r {
	case userpb.Role_ADMIN:
		return "ADMIN", true
	case userpb.Role_MANAGER:
		return "MANAGER", true
	case userpb.Role_STAFF:
		return "STAFF", true
	default:
		return "", false
	}
}

func roleStringToEnum(role string) userpb.Role {
	switch strings.ToUpper(role) {
	case "ADMIN":
		return userpb.Role_ADMIN
	case "MANAGER":
		return userpb.Role_MANAGER
	case "STAFF":
		return userpb.Role_STAFF
	default:
		return userpb.Role_ROLE_UNSPECIFIED
	}
}

// Lấy role từ context do middleware gắn (ưu tiên typed key, fallback string key)
func getCurrentRoleFromCtx(ctx context.Context) (string, bool) {
	if r, ok := mw.RoleFromContext(ctx); ok && r != "" {
		return strings.ToUpper(r), true
	}
	if v := ctx.Value("role"); v != nil {
		if rs, ok := v.(string); ok && rs != "" {
			return strings.ToUpper(rs), true
		}
	}
	return "", false
}

func getUserIDFromCtx(ctx context.Context) (string, bool) {
	if id, ok := mw.UserIDFromContext(ctx); ok && id != "" {
		return id, true
	}
	if v := ctx.Value("userId"); v != nil {
		if s, ok := v.(string); ok && s != "" {
			return s, true
		}
	}
	return "", false
}

// ------------------ AuthService RPCs ------------------

func (s *Server) Login(ctx context.Context, req *authpb.LoginRequest) (*authpb.TokenResponse, error) {
	s.log.Debug("Login called", zap.String("email", req.Email))
	tokens, err := s.authSvc.Login(ctx, dto.LoginRequest{
		Email:     req.Email,
		Password:  req.Password,
		UserAgent: req.UserAgent,
		Ip:        req.Ip,
	})
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, err.Error())
	}
	return &authpb.TokenResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}

func (s *Server) RefreshToken(ctx context.Context, req *authpb.RefreshTokenRequest) (*authpb.TokenResponse, error) {
	s.log.Debug("RefreshToken called")
	tokens, err := s.authSvc.RefreshToken(ctx, dto.RefreshTokenRequest{
		RefreshToken: req.RefreshToken,
	})
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, err.Error())
	}
	return &authpb.TokenResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}

func (s *Server) Logout(ctx context.Context, req *authpb.LogoutRequest) (*empty.Empty, error) {
	s.log.Debug("Logout called")
	if err := s.authSvc.Logout(ctx, req.RefreshToken); err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}
	return &empty.Empty{}, nil
}

func (s *Server) ValidateToken(ctx context.Context, req *authpb.ValidateTokenRequest) (*authpb.ValidateTokenResponse, error) {
	s.log.Debug("ValidateToken called")
	valid, userID, roleName := s.authSvc.ValidateToken(ctx, req.AccessToken)
	return &authpb.ValidateTokenResponse{
		IsValid: valid,
		UserId:  userID,
		Role:    roleName, // auth.proto: string
	}, nil
}

// ------------------ UserService RPCs ------------------

func (s *Server) GetMe(ctx context.Context, _ *emptypb.Empty) (*userpb.UserResponse, error) {
    // 1) Lấy userId từ context
    userIDHex, ok := getUserIDFromCtx(ctx) // đã có helper ở file này
    if !ok || userIDHex == "" {
        return nil, status.Error(codes.Unauthenticated, "missing user id in context")
    }

    // 2) Convert sang ObjectID
    oid, err := primitive.ObjectIDFromHex(userIDHex)
    if err != nil {
        return nil, status.Error(codes.InvalidArgument, "invalid user id in token")
    }

    // 3) Lấy user
    u, err := s.userSvc.GetUserByObjectID(ctx, oid) // tạo helper dưới đây
    if err != nil || u == nil {
        return nil, status.Error(codes.NotFound, "user not found")
    }

    // 4) Trả về id = userCode (dạng string)
    return &userpb.UserResponse{
        Id:       strconv.FormatInt(u.UserCode, 10),
        Username: u.Username,
        Email:    u.Email,
        Role:     roleStringToEnum(u.Role),
    }, nil
}

func (s *Server) CreateUser(ctx context.Context, req *userpb.CreateUserRequest) (*userpb.UserResponse, error) {
	s.log.Debug("CreateUser called", zap.String("email", req.Email))

	// 1) Validate input cơ bản
	username := strings.TrimSpace(req.Username)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	password := req.Password

	if username == "" || email == "" || password == "" {
		return nil, status.Error(codes.InvalidArgument, "username, email, password are required")
	}
	if len(username) < 3 {
		return nil, status.Error(codes.InvalidArgument, "username must be at least 3 characters")
	}
	if !strings.Contains(email, "@") || len(email) < 6 {
		return nil, status.Error(codes.InvalidArgument, "invalid email format")
	}
	if len(password) < 8 {
		return nil, status.Error(codes.InvalidArgument, "password must be at least 8 characters")
	}

	// 2) Lấy role người gọi từ context
	currentRole, ok := getCurrentRoleFromCtx(ctx)
	if !ok || currentRole == "" {
		return nil, status.Error(codes.Unauthenticated, "missing role in context")
	}

	// 3) Map role enum -> string
	targetRole, ok := roleEnumToString(req.Role)
	if !ok {
		return nil, status.Error(codes.InvalidArgument, "invalid role")
	}

	// 4) Build domain model (hash ở UserService)
	u := &domain.User{
		Username: username,
		Email:    email,
		Password: password,
		Role:     targetRole,
		IsActive: true,
	}

	// 5) Gọi service
	created, err := s.userSvc.CreateUser(ctx, currentRole, u)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidRole):
			return nil, status.Error(codes.InvalidArgument, err.Error())
		case errors.Is(err, service.ErrForbiddenRole):
			return nil, status.Error(codes.PermissionDenied, err.Error())
		case errors.Is(err, repository.ErrDuplicateEmail),
			strings.Contains(strings.ToLower(err.Error()), "e11000"):
			return nil, status.Error(codes.AlreadyExists, "email already exists")
		default:
			return nil, status.Error(codes.Internal, err.Error())
		}
	}

	return &userpb.UserResponse{
    Id:       strconv.FormatInt(created.UserCode, 10), // id = userCode
		Username: created.Username,
		Email:    created.Email,
		Role:     roleStringToEnum(created.Role),
	}, nil
}

func (s *Server) ListUsers(ctx context.Context, _ *empty.Empty) (*userpb.ListUsersResponse, error) {
	s.log.Debug("ListUsers called")

	currentRole, ok := getCurrentRoleFromCtx(ctx)
	if !ok || currentRole == "" {
		return nil, status.Error(codes.Unauthenticated, "missing role in context")
	}

	users, err := s.userSvc.ListUsers(ctx, currentRole)
	if err != nil {
		return nil, status.Error(codes.PermissionDenied, err.Error())
	}

	resp := &userpb.ListUsersResponse{}
	for _, u := range users {
		resp.Users = append(resp.Users, &userpb.UserResponse{
      Id:       strconv.FormatInt(u.UserCode, 10), // id = userCode
			Username: u.Username,
			Email:    u.Email,
			Role:     roleStringToEnum(u.Role),
		})
	}
	return resp, nil
}


// GetUser: id là userCode (số)
func (s *Server) GetUser(ctx context.Context, req *userpb.GetUserRequest) (*userpb.UserResponse, error) {
	s.log.Debug("GetUser called", zap.String("id", req.Id))

	code, err := strconv.ParseInt(req.Id, 10, 64)
	if err != nil || code <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid numeric id")
	}

	u, err := s.userSvc.GetUser(ctx, code)
	if err != nil || u == nil {
		return nil, status.Error(codes.NotFound, "user not found")
	}
	return &userpb.UserResponse{
    Id:       strconv.FormatInt(u.UserCode, 10), // id = userCode
		Username: u.Username,
		Email:    u.Email,
		Role:     roleStringToEnum(u.Role),
	}, nil
}

// UpdateUser: id là userCode (số)
func (s *Server) UpdateUser(ctx context.Context, req *userpb.UpdateUserRequest) (*userpb.UserResponse, error) {
	s.log.Debug("UpdateUser called", zap.String("id", req.Id))

	code, err := strconv.ParseInt(req.Id, 10, 64)
	if err != nil || code <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid numeric id")
	}

	currentRole, ok := getCurrentRoleFromCtx(ctx)
	if !ok || currentRole == "" {
		return nil, status.Error(codes.Unauthenticated, "missing role in context")
	}

	updates := map[string]any{
		"updatedAt": time.Now().UTC(),
	}
	if req.Username != "" {
		updates["username"] = strings.TrimSpace(req.Username)
	}
	if req.Email != "" {
		updates["email"] = strings.ToLower(strings.TrimSpace(req.Email))
	}
	if req.Role != userpb.Role_ROLE_UNSPECIFIED {
		roleStr, ok := roleEnumToString(req.Role)
		if !ok {
			return nil, status.Error(codes.InvalidArgument, "invalid role")
		}
		updates["role"] = roleStr
	}

	u, err := s.userSvc.UpdateUser(ctx, currentRole, code, updates)
	if err != nil || u == nil {
		if err != nil && (errors.Is(err, service.ErrForbiddenRole) || errors.Is(err, service.ErrInvalidRole)) {
			return nil, status.Error(codes.PermissionDenied, err.Error())
		}
		if err != nil && strings.Contains(strings.ToLower(err.Error()), "e11000") {
			return nil, status.Error(codes.AlreadyExists, "email already exists")
		}
		if err != nil {
			return nil, status.Error(codes.Internal, err.Error())
		}
		return nil, status.Error(codes.NotFound, "user not found")
	}

	return &userpb.UserResponse{
    Id:       strconv.FormatInt(u.UserCode, 10), // id = userCode
		Username: u.Username,
		Email:    u.Email,
		Role:     roleStringToEnum(u.Role),
	}, nil
}

// DeleteUser: id là userCode (số)
func (s *Server) DeleteUser(ctx context.Context, req *userpb.DeleteUserRequest) (*empty.Empty, error) {
	s.log.Debug("DeleteUser called", zap.String("id", req.Id))

	code, err := strconv.ParseInt(req.Id, 10, 64)
	if err != nil || code <= 0 {
		return nil, status.Error(codes.InvalidArgument, "invalid numeric id")
	}

	currentRole, ok := getCurrentRoleFromCtx(ctx)
	if !ok || currentRole == "" {
		return nil, status.Error(codes.Unauthenticated, "missing role in context")
	}

	// Optional: chặn tự xoá chính mình (so sánh theo userCode nếu bạn lưu trong token)
	if callerID, ok := getUserIDFromCtx(ctx); ok && callerID == req.Id {
		return nil, status.Error(codes.PermissionDenied, "cannot delete yourself")
	}

	// Kiểm tra tồn tại & quyền sẽ do service thực hiện
	if err := s.userSvc.DeleteUser(ctx, currentRole, code); err != nil {
		if errors.Is(err, service.ErrForbiddenRole) {
			return nil, status.Error(codes.PermissionDenied, err.Error())
		}
		if errors.Is(err, service.ErrUserNotFound) {
			return nil, status.Error(codes.NotFound, "user not found")
		}
		return nil, status.Error(codes.Internal, err.Error())
	}
	return &empty.Empty{}, nil
}
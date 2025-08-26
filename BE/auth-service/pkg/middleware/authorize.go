// pkg/middleware/authorize.go
package middleware

import (
	"context"
	"strings"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/service"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

// typed keys tránh va chạm
type ctxKey string

const (
	ctxKeyUserID ctxKey = "userId"
	ctxKeyRole   ctxKey = "role"
)

// Các RPC không yêu cầu auth
var publicMethods = map[string]struct{}{
	"/auth.AuthService/Login":         {},
	"/auth.AuthService/RefreshToken":  {},
	"/auth.AuthService/ValidateToken": {}, // nếu muốn public
	// thêm health check nếu có: "/grpc.health.v1.Health/Check": {},
}

func AuthInterceptor(authSvc *service.AuthService) grpc.UnaryServerInterceptor {
	return func(
		ctx context.Context,
		req interface{},
		info *grpc.UnaryServerInfo,
		handler grpc.UnaryHandler,
	) (interface{}, error) {

		// Cho qua các method public
		if _, ok := publicMethods[info.FullMethod]; ok {
			return handler(ctx, req)
		}

		// Lấy Authorization header từ metadata (đảm bảo đã cấu hình gateway forward header này)
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok {
			return nil, status.Error(codes.Unauthenticated, "missing metadata")
		}
		authHeaders := md.Get("authorization")
		if len(authHeaders) == 0 {
			return nil, status.Error(codes.Unauthenticated, "authorization token not provided")
		}

		authHeader := strings.TrimSpace(authHeaders[0])
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return nil, status.Error(codes.Unauthenticated, "invalid authorization header format")
		}
		token := strings.TrimSpace(parts[1])
		if token == "" {
			return nil, status.Error(codes.Unauthenticated, "empty bearer token")
		}

		// Xác thực token
		valid, userID, roleName := authSvc.ValidateToken(ctx, token)
		if !valid || userID == "" || roleName == "" {
			return nil, status.Error(codes.Unauthenticated, "invalid or expired token")
		}

		// Gắn vào context (typed keys + legacy keys để tương thích)
		ctx = context.WithValue(ctx, ctxKeyUserID, userID)
		ctx = context.WithValue(ctx, ctxKeyRole, strings.ToUpper(roleName))
		ctx = context.WithValue(ctx, "userId", userID)                 // legacy
		ctx = context.WithValue(ctx, "role", strings.ToUpper(roleName)) // legacy

		return handler(ctx, req)
	}
}

// Helpers để lấy từ context
func UserIDFromContext(ctx context.Context) (string, bool) {
	if v := ctx.Value(ctxKeyUserID); v != nil {
		if s, ok := v.(string); ok && s != "" {
			return s, true
		}
	}
	// fallback legacy
	if v := ctx.Value("userId"); v != nil {
		if s, ok := v.(string); ok && s != "" {
			return s, true
		}
	}
	return "", false
}

func RoleFromContext(ctx context.Context) (string, bool) {
	if v := ctx.Value(ctxKeyRole); v != nil {
		if s, ok := v.(string); ok && s != "" {
			return s, true
		}
	}
	// fallback legacy
	if v := ctx.Value("role"); v != nil {
		if s, ok := v.(string); ok && s != "" {
			return s, true
		}
	}
	return "", false
}

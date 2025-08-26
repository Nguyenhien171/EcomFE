package token

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TokenService struct {
	jwtSecret  string
	issuer     string        // iss
	audience   string        // aud
	accessTTL  time.Duration // TTL access token
	refreshTTL time.Duration // TTL refresh token
}

func NewTokenService(jwtSecret string) *TokenService {
	return &TokenService{
		jwtSecret:  jwtSecret,
		issuer:     "auth-service",
		audience:   "jss-api",
		accessTTL:  15 * time.Minute,
		refreshTTL: 30 * 24 * time.Hour,
	}
}

type AccessTokenClaims struct {
	UserID   string `json:"sub"`  // subject (user id)
	DeviceID string `json:"did"`  // device id
	RoleName string `json:"role"` // ADMIN | MANAGER | STAFF
	jwt.RegisteredClaims
}

type RefreshTokenClaims struct {
	UserID string `json:"sub"` // subject (user id)
	jwt.RegisteredClaims
}

type AccessTokenPayloadCreate struct {
	UserID   primitive.ObjectID
	DeviceID primitive.ObjectID
	// RoleID vẫn để tương thích nếu nơi khác còn field này, nhưng không dùng ở claims
	RoleID   primitive.ObjectID
	RoleName string
}

type RefreshTokenPayloadCreate struct {
	UserID primitive.ObjectID
}

var ErrInvalidToken = errors.New("invalid token")

func (s *TokenService) SignAccessToken(p AccessTokenPayloadCreate) (string, error) {
	now := time.Now()
	claims := AccessTokenClaims{
		UserID:   p.UserID.Hex(),
		DeviceID: p.DeviceID.Hex(),
		RoleName: p.RoleName,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Audience:  []string{s.audience},
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now.Add(-30 * time.Second)),
			ID:        primitive.NewObjectID().Hex(), // jti
			Subject:   p.UserID.Hex(),               // sub
		},
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Cách A: KHÔNG gắn kid vào header, không yêu cầu kid khi verify
	return t.SignedString([]byte(s.jwtSecret))
}

func (s *TokenService) SignRefreshToken(p RefreshTokenPayloadCreate) (string, error) {
	now := time.Now()
	claims := RefreshTokenClaims{
		UserID: p.UserID.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Audience:  []string{s.audience},
			ExpiresAt: jwt.NewNumericDate(now.Add(s.refreshTTL)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ID:        primitive.NewObjectID().Hex(), // jti
			Subject:   p.UserID.Hex(),               // sub
		},
	}

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Cách A: KHÔNG gắn kid vào header
	return t.SignedString([]byte(s.jwtSecret))
}

func (s *TokenService) VerifyAccessToken(tokenString string) (*AccessTokenClaims, error) {
	parsed, err := jwt.ParseWithClaims(tokenString, &AccessTokenClaims{}, func(t *jwt.Token) (interface{}, error) {
		// chống "alg none" hoặc thuật toán khác
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %T", t.Method)
		}
		// Cách A: KHÔNG tra cứu theo kid, trả secret trực tiếp
		return []byte(s.jwtSecret), nil
	}, jwt.WithAudience(s.audience), jwt.WithIssuer(s.issuer))
	if err != nil {
		return nil, err
	}
	claims, ok := parsed.Claims.(*AccessTokenClaims)
	if !ok || !parsed.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

func (s *TokenService) VerifyRefreshToken(tokenString string) (*RefreshTokenClaims, error) {
	parsed, err := jwt.ParseWithClaims(tokenString, &RefreshTokenClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %T", t.Method)
		}
		// Cách A: KHÔNG tra kid
		return []byte(s.jwtSecret), nil
	}, jwt.WithAudience(s.audience), jwt.WithIssuer(s.issuer))
	if err != nil {
		return nil, err
	}
	claims, ok := parsed.Claims.(*RefreshTokenClaims)
	if !ok || !parsed.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

// Decode giữ lại cho tương thích
func (s *TokenService) DecodeRefreshToken(tokenString string) (*RefreshTokenClaims, error) {
	return s.VerifyRefreshToken(tokenString)
}

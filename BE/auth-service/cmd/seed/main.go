package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/domain"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/repository"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/database"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/hashing"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"
)

func main() {
	logg := zap.NewExample()
	defer logg.Sync()

	// Kết nối MongoDB (đọc MONGO_URI, MONGO_DB từ ENV bên trong hàm Connect)
	db := database.Connect(logg)
	ctx := context.Background()

	// KHÔNG còn RoleRepository/seed roles
	userRepo := repository.NewUserRepository(db, logg)
	hashingSvc := hashing.NewHashingService()

	// ENV mặc định (nếu không set từ ngoài)
	adminEmail := os.Getenv("DEFAULT_ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@jss.local"
	}
	adminPass :=  os.Getenv("DEFAULT_ADMIN_PASSWORD")
	if adminPass == "" {
		adminPass = "Admin@123"
	}
 
	// Nếu đã tồn tại admin thì thôi
	existing, _ := userRepo.FindByEmail(ctx, adminEmail)
	if existing != nil {
		log.Println("Admin already exists:", adminEmail)
		return
	}

	hashed, err := hashingSvc.Hash(adminPass)
	if err != nil {
		log.Fatalf("Hash admin password failed: %v", err)
	}

	// Tạo admin với Role là string ("ADMIN")
	_, err = userRepo.CreateUser(ctx, &domain.User{
		ID:        primitive.NewObjectID(),
		Username:  os.Getenv("DEFAULT_ADMIN_USERNAME"),
		Email:     adminEmail,
		Password:  hashed,
		Role:      "ADMIN",
		IsActive:  true,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})
	if err != nil {
		log.Fatalf("Create admin user failed: %v", err)
	}

	log.Println("Seeded default admin:", adminEmail)
}

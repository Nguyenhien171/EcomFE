package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/grpc/server"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/repository"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/internal/service"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/config"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/database"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/hashing"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/logger"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/middleware"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/queue"
	"github.com/linhhuynhcoding/jss-microservices/auth-service/pkg/token"

	authpb "github.com/linhhuynhcoding/jss-microservices/rpc/gen/auth"
	userpb "github.com/linhhuynhcoding/jss-microservices/rpc/gen/user"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
)

func main() {
	// 1. Load config & logger
	cfg := config.Load()
	logg := logger.New(cfg.LogLevel)
	defer logg.Sync()

	// 2. Connect MongoDB (Atlas/local tuỳ MONGO_URI, MONGO_DB)
	mongoDB := database.Connect(logg)
	defer func() {
		if err := mongoDB.Client().Disconnect(context.Background()); err != nil {
			logg.Error("Failed to disconnect MongoDB", zap.Error(err))
		}
	}()

	// 3. Setup RabbitMQ (nếu cần)
	var publisher *queue.Publisher
	if cfg.RabbitMQURL != "" {
		publisher = queue.NewPublisher(cfg.RabbitMQURL, cfg.ExchangeName, logg)
		defer publisher.Close()
	}
	_ = publisher // hiện chưa dùng trong main, nhưng giữ lại để tiện mở rộng

	// 4. Init repository
	userRepo := repository.NewUserRepository(mongoDB, logg)
    if err := userRepo.EnsureIndexes(context.Background()); err != nil {
    logg.Warn("ensure user indexes failed", zap.Error(err))
    }

	deviceRepo := repository.NewDeviceRepository(mongoDB, logg)
	refreshRepo := repository.NewRefreshTokenRepository(mongoDB, logg)
	// ❌ Bỏ RoleRepository: không còn dùng collection roles

	// 5. Init services
	hashingSvc := hashing.NewHashingService()
	tokenSvc := token.NewTokenService(cfg.JWTSecret)

	authSvc := service.NewAuthService(
		userRepo,
		deviceRepo,
		refreshRepo,
		hashingSvc,
		tokenSvc,
		logg,
	)

	// NewUserService KHÔNG còn roleRepo — chỉ truyền repo + logger (theo code bạn đã sửa)
	userSvc := service.NewUserService(userRepo, hashingSvc, logg)

	// 6. Init gRPC server với middleware
	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(middleware.AuthInterceptor(authSvc)),
	)

	// NewServer KHÔNG còn tham số roleRepo
	mainServer := server.NewServer(authSvc, userSvc, logg)

	authpb.RegisterAuthServiceServer(grpcServer, mainServer)
	userpb.RegisterUserServiceServer(grpcServer, mainServer)

	// 7. Listen GRPC
	grpcLis, err := net.Listen("tcp", ":"+cfg.GRPCPort)
	if err != nil {
		logg.Fatal("gRPC listen failed", zap.Error(err))
	}

	go func() {
		logg.Info("gRPC listening", zap.String("port", cfg.GRPCPort))
		if err := grpcServer.Serve(grpcLis); err != nil {
			logg.Fatal("gRPC serve failed", zap.Error(err))
		}
	}()

	// 8. Start HTTP REST via gRPC-Gateway
	go func() {
		ctx := context.Background()
		ctx, cancel := context.WithCancel(ctx)
		defer cancel()

		mux := runtime.NewServeMux()
		opts := []grpc.DialOption{grpc.WithInsecure()}

		// register gRPC gateway handlers
		if err := authpb.RegisterAuthServiceHandlerFromEndpoint(ctx, mux, "localhost:"+cfg.GRPCPort, opts); err != nil {
			log.Fatal("failed to register auth gateway:", err)
		}
		if err := userpb.RegisterUserServiceHandlerFromEndpoint(ctx, mux, "localhost:"+cfg.GRPCPort, opts); err != nil {
			log.Fatal("failed to register user gateway:", err)
		}

		log.Printf("HTTP REST gateway listening on :%s", cfg.HTTPPort)
		if err := http.ListenAndServe(":"+cfg.HTTPPort, mux); err != nil {
			log.Fatal("HTTP REST serve failed:", err)
		}
	}()

	// 9. Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logg.Info("Shutting down gRPC")
	grpcServer.GracefulStop()
	logg.Info("Exited")
}

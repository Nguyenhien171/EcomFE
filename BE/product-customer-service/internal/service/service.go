package service

import (
	"github.com/linhhuynhcoding/jss-microservices/product/config"
	"github.com/linhhuynhcoding/jss-microservices/rpc/gen/product"
	"go.uber.org/zap"
)

type Service struct {
	product.UnimplementedProductCustomerServer

	logger *zap.Logger
	cfg    config.Config
}

func NewService(logger *zap.Logger, cfg config.Config) *Service {
	return &Service{
		logger: logger,
		cfg:    cfg,
	}
}

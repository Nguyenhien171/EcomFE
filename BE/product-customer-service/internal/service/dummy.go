package service

import (
	"context"

	"github.com/linhhuynhcoding/jss-microservices/rpc/gen/product"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (s *Service) Dummy(context.Context, *product.DummyRequest) (*product.DummyResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Dummy not implemented")
}

package logger

import (
	"go.uber.org/zap"
)

func New(level string) *zap.Logger {
	cfg := zap.NewProductionConfig()
	_ = cfg.Level.UnmarshalText([]byte(level))
	logger, _ := cfg.Build()
	return logger
}
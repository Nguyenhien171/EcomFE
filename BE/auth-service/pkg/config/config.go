package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	HTTPPort     string
	GRPCPort     string
	MongoURI     string
	RabbitMQURL  string
	ExchangeName string
	JWTSecret    string
	JWTExpiry    string
	LogLevel     string
	DEFAULT_ADMIN_USERNAME	string
	DEFAULT_ADMIN_EMAIL			string
	DEFAULT_ADMIN_PASSWORD	string
}

func Load() *Config {
	viper.SetConfigFile(".env.example")
	viper.AutomaticEnv()
	_ = viper.ReadInConfig()
	return &Config{
		HTTPPort:     viper.GetString("HTTP_PORT"),
		GRPCPort:     viper.GetString("GRPC_PORT"),
		MongoURI:     viper.GetString("MONGODB_URI"),
		RabbitMQURL:  viper.GetString("RABBITMQ_URL"),
		ExchangeName: viper.GetString("EXCHANGE_NAME"),
		JWTSecret:    viper.GetString("JWT_SECRET"),
		JWTExpiry:    viper.GetString("JWT_EXPIRY"),
		LogLevel:     viper.GetString("LOG_LEVEL"),
	}
}
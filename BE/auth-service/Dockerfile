FROM golang:1.24.5-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build main service
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o auth-service ./cmd/main.go

# Build seed binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o seed ./cmd/seed/main.go

FROM alpine:3.18 AS runtime
WORKDIR /app
RUN apk add --no-cache curl netcat-openbsd

COPY --from=builder /app/auth-service .
COPY --from=builder /app/seed .
COPY --from=builder /app/.env.example .env
COPY --from=builder /app/wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s \
    CMD curl -f http://localhost:8001/health || exit 1

EXPOSE 8001 50001
CMD ["/wait-for.sh", "rabbitmq", "5672", "--", "./auth-service"]

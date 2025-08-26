DB_URL=postgresql://root:secret@localhost:9999/jss_product?sslmode=disable
POSTGRES_CONTAINER=product-customer-service-postgres-1

network:
	docker network create jss-network

postgres:
	docker run --name postgres --network jss-network -p 9999:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:14-alpine

createdb:
	docker exec -it $(POSTGRES_CONTAINER) createdb --username=root --owner=root jss_product

dropdb:
	docker exec -it $(POSTGRES_CONTAINER) dropdb jss_product

migrate-up:
	migrate -path db/migration -database "$(DB_URL)" -verbose up

new_migration:
	migrate create -ext sql -dir db/migration -seq $(name)

update:
	go mod tidy
	go mod vendor

update-rpc:
	go get github.com/linhhuynhcoding/jss-microservices/rpc@main

.PHOYE: network postgres createdb dropdb migrate-up new_migration update
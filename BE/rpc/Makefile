PROTOC       = protoc
PROTO_DIR    = rpc
OUT_DIR      = gen

# Lấy danh sách proto, bỏ qua google/api
PROTO_FILES := $(shell find $(PROTO_DIR) -name "*.proto" ! -path "$(PROTO_DIR)/google/api/*")

proto: clean
	@mkdir -p $(OUT_DIR)
	@for file in $(PROTO_FILES); do \
		out_dir="$(OUT_DIR)/$$(dirname $$file | sed 's|^$(PROTO_DIR)/||')"; \
		mkdir -p $$out_dir; \
		$(PROTOC) \
			--proto_path=$(PROTO_DIR) \
			--go_out=$(OUT_DIR) --go_opt=paths=source_relative \
			--go-grpc_out=$(OUT_DIR) --go-grpc_opt=paths=source_relative \
			--grpc-gateway_out=$(OUT_DIR) --grpc-gateway_opt=paths=source_relative \
			$$file; \
	done

clean:
	@echo "🧹 Cleaning generated files..."
	@rm -rf $(OUT_DIR)

update:
	go mod tidy 
	go mod vendor

.PHONY: proto

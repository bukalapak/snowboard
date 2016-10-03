.PHONY: all
all: install
submodules:
	git submodule update --init --recursive
drafter: submodules
	cd engines/drafter/ext/drafter && ./configure && make drafter
go-gen:
	@go get github.com/mjibson/esc
	go generate ./cmd/snowboard/main.go
go-build:
	go build -o snowboard ./cmd/snowboard/...
go-install:
	go install ./...
go-test:
	go test -v ./engines/...
build: drafter go-gen go-build
install: drafter go-gen go-install
test: drafter go-gen go-test
examples: build
	./examples/generate.sh ./snowboard ./fixtures/api-blueprint/examples ./examples

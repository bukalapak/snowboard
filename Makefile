.PHONY: all
all: install
drafter:
	git submodule update --init --recursive
	cd ext/drafter && ./configure && make drafter
go-gen:
	@go get github.com/mjibson/esc
	go generate ./cmd/snowboard/main.go
go-build:
	go build -o snowboard ./cmd/snowboard/...
go-install:
	go install ./...
go-test:
	go test -v
build: drafter go-gen go-build
install: drafter go-gen go-install
test: drafter go-gen go-test

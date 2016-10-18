.PHONY: all
all: install
submodules:
	git submodule update --init --recursive
drafter:
	cd engines/drafter/ext/drafter && ./configure && make drafter
go-gen:
	@go get github.com/mjibson/esc
	go generate ./cmd/snowboard/main.go
go-build:
	go build -ldflags "-X main.versionStr=$$TRAVIS_TAG" -o snowboard ./cmd/snowboard/...
go-install:
	go install ./...
go-test:
	go test -v && go test -v ./engines/...
build: submodules drafter go-gen go-build
install: submodules drafter go-gen go-install
test: submodules drafter go-gen go-test
examples: build
	./examples/generate.sh ./snowboard ./fixtures/api-blueprint/examples ./examples

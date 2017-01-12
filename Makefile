.PHONY: all
all: install
submodules:
	git submodule update --init --recursive
drafter:
	cd drafter/ext/drafter && make drafter
go-gen:
	@go get github.com/mjibson/esc
	go generate ./main.go
go-build:
	go build -ldflags "-X main.versionStr=$$TRAVIS_TAG" -o snowboard .
go-install:
	go install ./...
go-test:
	go test -v && go test -v ./...
build: submodules drafter go-gen go-build
install: submodules drafter go-gen go-install
test: submodules drafter go-gen go-test
examples: build
	./examples/generate.sh ./snowboard ./fixtures/api-blueprint/examples ./examples

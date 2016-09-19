all: install
build-drafter:
	git submodule update --init --recursive
	cd ext/drafter && ./configure && make drafter
build: build-drafter
	go build -o snowboard ./cmd/snowboard/main.go
install: build-drafter
	go install ./...
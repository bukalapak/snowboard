FROM golang:1.9 AS builder
MAINTAINER Alif Rachmawadi <subosito@bukalapak.com>

COPY . /go/src/github.com/bukalapak/snowboard
RUN cd /go/src/github.com/bukalapak/snowboard \
 && make build

FROM debian:stretch-slim
COPY --from=builder /go/src/github.com/bukalapak/snowboard/snowboard /usr/local/bin

RUN apt-get -y update \
 && apt-get -y install --no-install-recommends inotify-tools \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /doc
VOLUME /doc
EXPOSE 8088 8087

ENTRYPOINT ["snowboard"]

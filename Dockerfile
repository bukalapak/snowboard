FROM golang:1.7
MAINTAINER Alif Rachmawadi <code@subosito.com>

COPY . /go/src/github.com/subosito/snowboard
RUN cd /go/src/github.com/subosito/snowboard \
 && make build \
 && cp snowboard /usr/local/bin \
 && cd /go \
 && rm -Rf src bin pkg \
 && mkdir src bin pkg

ENTRYPOINT /usr/local/bin/snowboard
EXPOSE 8088

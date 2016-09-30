FROM golang:1.7
MAINTAINER Alif Rachmawadi <code@subosito.com>

ENV SNOWBOARD_PATH=/go/src/github.com/subosito/snowboard

COPY . $SNOWBOARD_PATH
RUN cd $SNOWBOARD_PATH \
 && make install

ENTRYPOINT /go/bin/snowboard
EXPOSE 8088

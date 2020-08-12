FROM node:12 AS builder

COPY . /app

RUN cd /app \
 && npm install \
 && npm run bootstrap \
 && npm run build \
 && npm run manifest \
 && npm run pack-linux \
 && mkdir /doc \
 && tar -zxf packages/snowboard/dist/snowboard-*/snowboard-*-linux-x64.tar.gz -C . \
 && rm snowboard/bin/node

FROM gcr.io/distroless/nodejs:12

COPY --from=builder /app/snowboard /snowboard
COPY --from=builder --chown=nonroot:nonroot /doc /doc

WORKDIR /doc
USER nonroot

EXPOSE 8087 8088

ENTRYPOINT ["/nodejs/bin/node", "/snowboard/bin/run"]
CMD ["help"]

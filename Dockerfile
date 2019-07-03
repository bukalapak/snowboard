FROM node:10 AS builder
COPY . /app
RUN cd /app && yarn install

FROM gcr.io/distroless/nodejs
COPY --from=builder /app /app
WORKDIR /doc
ENTRYPOINT ["/nodejs/bin/node", "/app/lib/main.js"]
CMD ["--help"]

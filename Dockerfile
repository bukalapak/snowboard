FROM node:12

COPY . /app

RUN cd /app \
 && npm install \
 && npm run build

WORKDIR /doc
ENTRYPOINT ["/app/bin/run"]
CMD ["help"]

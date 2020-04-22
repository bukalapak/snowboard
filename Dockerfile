FROM node:12

COPY . /app

RUN cd /app \
 && npm install \
 && npm run bootstrap \
 && npm run build

EXPOSE 8087 8088
WORKDIR /doc
ENTRYPOINT ["/app/packages/snowboard/bin/run"]
CMD ["help"]

FROM node:12

COPY . /app
RUN cd /app \
 && yarn install

WORKDIR /doc
ENTRYPOINT ["node", "/app/lib/main.js"]
CMD ["--help"]

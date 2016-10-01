#!/usr/bin/env bash

if [[ "$TRAVIS_TEST_RESULT" == "0" ]]; then
  echo "Generating snowboard-$TRAVIS_TAG.${TRAVIS_OS_NAME/osx/darwin}-amd64.tar.gz"
  make go-build
  tar -czf $TRAVIS_BUILD_DIR/snowboard-$TRAVIS_TAG.${TRAVIS_OS_NAME/osx/darwin}-amd64.tar.gz snowboard
fi

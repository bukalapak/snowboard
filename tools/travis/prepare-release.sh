#!/usr/bin/env bash

TRAVIS_ARCHIVE_FILE=snowboard-$TRAVIS_TAG.${TRAVIS_OS_NAME/osx/darwin}-amd64.tar.gz

if [[ "$TRAVIS_TEST_RESULT" == "0" ]]; then
  echo "Generating ${TRAVIS_ARCHIVE_FILE}"

  npm install -g pkg
  pkg .

  cp node_modules/protagonist/build/Release/protagonist.node .
  cp snowboard-${TRAVIS_OS_NAME/osx/macos} snowboard

  if [ "$TRAVIS_OS_NAME" == "macos"]; then
    cp node_modules/fsevents/fsevents.node .
    tar -czf $TRAVIS_ARCHIVE_FILE snowboard protagonist.node fsevents.node
  else
    tar -czf $TRAVIS_ARCHIVE_FILE snowboard protagonist.node
  fi

  shasum -a 256 -b $TRAVIS_ARCHIVE_FILE
fi

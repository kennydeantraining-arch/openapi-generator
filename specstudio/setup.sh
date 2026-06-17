#!/usr/bin/env bash
# One-time setup: install dependencies and fetch the openapi-generator CLI jar.
set -euo pipefail
cd "$(dirname "$0")"

VERSION="${OPENAPI_GENERATOR_VERSION:-7.12.0}"
JAR="vendor/openapi-generator-cli.jar"

npm install

if [ ! -f "$JAR" ]; then
  mkdir -p vendor
  echo "Downloading openapi-generator-cli ${VERSION}..."
  BASE_URL="https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/${VERSION}"
  curl -fL -o "$JAR" "${BASE_URL}/openapi-generator-cli-${VERSION}.jar"
  echo "Verifying download integrity..."
  EXPECTED_SHA1="$(curl -fsSL "${BASE_URL}/openapi-generator-cli-${VERSION}.jar.sha1")"
  ACTUAL_SHA1="$(sha1sum "$JAR" | cut -d' ' -f1)"
  if [ "$EXPECTED_SHA1" != "$ACTUAL_SHA1" ]; then
    echo "ERROR: checksum mismatch (expected ${EXPECTED_SHA1}, got ${ACTUAL_SHA1})" >&2
    rm -f "$JAR"
    exit 1
  fi
  echo "Checksum verified."
fi

echo "Setup complete. Run: node server.js"

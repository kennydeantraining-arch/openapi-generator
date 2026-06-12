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
  curl -fL -o "$JAR" \
    "https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/${VERSION}/openapi-generator-cli-${VERSION}.jar"
fi

echo "Setup complete. Run: node server.js"

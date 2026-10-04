#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "Preparing Real Standalone Mozilla Gecko Runtime for Linux"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
RUNTIME_DIR="${SCRIPT_DIR}/runtime"

mkdir -p "${RUNTIME_DIR}"

GECKO_URL="https://ftp.mozilla.org/pub/firefox/releases/115.15.0esr/linux-x86_64/en-US/firefox-115.15.0esr.tar.bz2"
ARCHIVE_PATH="${SCRIPT_DIR}/gecko-linux64.tar.bz2"

if [ ! -f "${ARCHIVE_PATH}" ]; then
  echo "Downloading standalone Mozilla Gecko engine runtime (Linux x86_64)..."
  curl -fsSL --retry 3 "${GECKO_URL}" -o "${ARCHIVE_PATH}"
fi

echo "Extracting Mozilla Gecko runtime..."
TEMP_EXTRACT="${SCRIPT_DIR}/temp_extract"
rm -rf "${TEMP_EXTRACT}"
mkdir -p "${TEMP_EXTRACT}"
tar -xjf "${ARCHIVE_PATH}" -C "${TEMP_EXTRACT}"

# Move extracted files into runtime directory
rm -rf "${RUNTIME_DIR}"/*
cp -a "${TEMP_EXTRACT}/firefox"/* "${RUNTIME_DIR}/"
rm -rf "${TEMP_EXTRACT}"

# Rebrand binary to quantum
if [ -f "${RUNTIME_DIR}/firefox" ]; then
  mv "${RUNTIME_DIR}/firefox" "${RUNTIME_DIR}/quantum"
fi
chmod +x "${RUNTIME_DIR}/quantum"

# Install policies and bundled uBlock Origin WebExtension
mkdir -p "${RUNTIME_DIR}/distribution/extensions"
cp "${ROOT_DIR}/desktop/common/policies.json" "${RUNTIME_DIR}/distribution/policies.json"
cp "${ROOT_DIR}/desktop/common/extensions/uBlock0@raymondhill.net.xpi" "${RUNTIME_DIR}/distribution/extensions/uBlock0@raymondhill.net.xpi"

# Verify standalone Gecko engine presence
test -f "${RUNTIME_DIR}/quantum"
test -f "${RUNTIME_DIR}/libxul.so"
test -f "${RUNTIME_DIR}/distribution/extensions/uBlock0@raymondhill.net.xpi"

echo "✅ Real standalone Mozilla Gecko runtime prepared at: ${RUNTIME_DIR}"

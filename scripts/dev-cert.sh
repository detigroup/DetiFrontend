#!/bin/bash

# Script to generate mkcert certificates for local HTTPS development
# Usage: bash ./scripts/dev-cert.sh

set -e

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed."
    echo "📦 Please install it using: brew install mkcert nss"
    exit 1
fi

echo "✅ mkcert found"

# Install root certificate (one-time setup)
echo "🔐 Installing mkcert root certificate..."
mkcert -install

# Create .cert directory if it doesn't exist
echo "📁 Creating .cert directory..."
mkdir -p .cert

# Generate certificate for dev domain
echo "🔑 Generating certificates for dev.detidex.yeuthich.net..."
mkcert \
  -key-file .cert/dev.detidex.yeuthich.net-key.pem \
  -cert-file .cert/dev.detidex.yeuthich.net.pem \
  dev.detidex.yeuthich.net

echo "✅ Certificates generated successfully!"
echo "📍 Location: .cert/"
echo "   - .cert/dev.detidex.yeuthich.net.pem (cert)"
echo "   - .cert/dev.detidex.yeuthich.net-key.pem (key)"
echo ""
echo "🚀 Next steps:"
echo "1. Add to /etc/hosts: 127.0.0.1 dev.detidex.yeuthich.net"
echo "2. Run: npm run dev:domain"
echo "3. Open: https://dev.detidex.yeuthich.net:3000"

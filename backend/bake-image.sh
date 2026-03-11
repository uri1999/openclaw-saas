#!/bin/bash
set -e
echo "Starting image bake process..."

# 1. Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Install Caddy for HTTPS
apt-get update
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# 3. Pull Base Images to skip 1-2GB downloads during live provisioning
docker pull docker.n8n.io/n8nio/n8n
docker pull ghcr.io/openclaw/openclaw:latest

# 4. Pre-compile the custom OpenClaw image with socat and gaxios patch
mkdir -p /tmp/openclaw-build
cat << 'DOCKERFILE' > /tmp/openclaw-build/Dockerfile
FROM ghcr.io/openclaw/openclaw:latest
USER root
RUN apt-get update && apt-get install -y socat curl tar && rm -rf /var/lib/apt/lists/*
RUN find /app/node_modules -path "*/gaxios/build/cjs/src/gaxios.js" -exec sed -i "s/(await import('node-fetch')).default/typeof globalThis.fetch === 'function' ? globalThis.fetch : (await import('node-fetch')).default/g" {} +
USER node
DOCKERFILE

cd /tmp/openclaw-build
docker build -t ghcr.io/openclaw/openclaw:latest-custom .

# Finish
echo "Bake complete!"

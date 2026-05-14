#!/bin/bash

# Inkling Deployment Script
# Usage: ./deploy.sh [project-name] [token]

set -e

PROJECT_NAME=${1:-"inkling"}
TOKEN=$2

echo "🚀 Deploying $PROJECT_NAME to EdgeOne Pages..."

# Check if edgeone CLI is installed
if ! command -v edgeone &> /dev/null; then
    echo "❌ EdgeOne CLI not found. Installing..."
    npm install -g edgeone@latest
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests (optional)
echo "🧪 Running tests..."
npm test || echo "⚠️  Tests failed, continuing deployment..."

# Build project
echo "🔨 Building project..."
npm run build

# Deploy
echo "🌐 Deploying to EdgeOne Pages..."
if [ -n "$TOKEN" ]; then
    edgeone pages deploy -n "$PROJECT_NAME" -t "$TOKEN"
else
    edgeone pages deploy -n "$PROJECT_NAME"
fi

echo "✅ Deployment complete!"
echo "📎 Check EdgeOne Pages dashboard for your URL"

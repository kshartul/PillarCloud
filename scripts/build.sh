#!/usr/bin/env bash
set -euo pipefail

REGISTRY="${REGISTRY:-openstack-portal}"
TAG="${TAG:-latest}"

services=(api-gateway auth-service billing-service notification-service)
python_services=(admin-service cloud-service)

echo "==> Building Node.js services..."
for svc in "${services[@]}"; do
  echo "  Building $svc..."
  docker build -t "$REGISTRY/$svc:$TAG" "services/$svc"
done

echo "==> Building Python services..."
for svc in "${python_services[@]}"; do
  echo "  Building $svc..."
  docker build -t "$REGISTRY/$svc:$TAG" "services/$svc"
done

echo "==> Building frontend..."
docker build -t "$REGISTRY/frontend:$TAG" frontend

echo ""
echo "Build complete. Images tagged as $REGISTRY/*:$TAG"
echo "To push: REGISTRY=<your-registry> TAG=<tag> ./scripts/push.sh"

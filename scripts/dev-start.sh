#!/usr/bin/env bash
# Start local dev environment
set -euo pipefail

echo "==> Checking .env file..."
if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "  Created .env from .env.example — please edit it with your OpenStack credentials"
fi

echo "==> Starting services with Docker Compose..."
docker compose up --build -d

echo ""
echo "==> Waiting for services to be healthy..."
sleep 10
docker compose ps

echo ""
echo "==> Services available at:"
echo "  Frontend:       http://localhost"
echo "  API Gateway:    http://localhost:3000"
echo "  Auth Service:   http://localhost:3001"
echo "  Admin Service:  http://localhost:8001/docs"
echo "  Cloud Service:  http://localhost:8002/docs"
echo "  Billing:        http://localhost:3002"
echo "  RabbitMQ UI:    http://localhost:15672  (guest/guest)"
echo ""
echo "  Default login: admin / admin123"

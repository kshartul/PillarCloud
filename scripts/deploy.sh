#!/usr/bin/env bash
# Deploy all Kubernetes manifests
set -euo pipefail

KUBECTL="${KUBECTL:-kubectl}"
NAMESPACE="openstack-portal"

echo "==> Applying namespace..."
$KUBECTL apply -f k8s/base/namespace.yaml

echo "==> Applying ConfigMap..."
$KUBECTL apply -f k8s/base/configmap.yaml

echo "==> Applying Secrets (ensure values are set)..."
$KUBECTL apply -f k8s/base/secrets.yaml

echo "==> Deploying infrastructure..."
$KUBECTL apply -f k8s/base/postgres.yaml
$KUBECTL apply -f k8s/base/redis.yaml
$KUBECTL apply -f k8s/base/rabbitmq.yaml

echo "==> Waiting for postgres to be ready..."
$KUBECTL rollout status deployment/postgres -n $NAMESPACE --timeout=120s

echo "==> Deploying application services..."
$KUBECTL apply -f k8s/base/services.yaml

echo "==> Applying HPA..."
$KUBECTL apply -f k8s/base/hpa.yaml

echo "==> Applying Ingress..."
$KUBECTL apply -f k8s/base/ingress.yaml

echo ""
echo "==> Deployment complete!"
echo "==> Pod status:"
$KUBECTL get pods -n $NAMESPACE

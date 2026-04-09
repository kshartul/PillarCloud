#!/usr/bin/env bash
# Manual scaling helper (HPA handles auto-scaling in production)
set -euo pipefail

KUBECTL="${KUBECTL:-kubectl}"
NAMESPACE="openstack-portal"

usage() {
  echo "Usage: $0 <service> <replicas>"
  echo ""
  echo "Services: api-gateway auth-service admin-service cloud-service"
  echo "          billing-service notification-service frontend"
  echo ""
  echo "Examples:"
  echo "  $0 api-gateway 4"
  echo "  $0 cloud-service 3"
  exit 1
}

[[ $# -lt 2 ]] && usage

SERVICE=$1
REPLICAS=$2

# Validate replicas
if ! [[ "$REPLICAS" =~ ^[0-9]+$ ]] || [[ $REPLICAS -lt 1 ]]; then
  echo "Error: replicas must be a positive integer"
  exit 1
fi

echo "==> Scaling $SERVICE to $REPLICAS replicas..."
$KUBECTL scale deployment "$SERVICE" --replicas="$REPLICAS" -n $NAMESPACE

echo "==> Watching rollout..."
$KUBECTL rollout status deployment/"$SERVICE" -n $NAMESPACE

echo ""
echo "==> Current pod counts:"
$KUBECTL get deployment -n $NAMESPACE | grep -E "NAME|$SERVICE"

#!/usr/bin/env bash
# Start the Compute Engine VM that owns the PayRam external IP (default 35.222.76.90).
# Run on your machine after: gcloud auth login
#
# Usage:
#   ./scripts/start-payram-gce-vm.sh
#   PAYRAM_HOST_IP=1.2.3.4 GCP_PROJECT_ID=my-project ./scripts/start-payram-gce-vm.sh
set -euo pipefail

PROJECT="${GCP_PROJECT_ID:-payvantage-payram}"
IP="${PAYRAM_HOST_IP:-35.222.76.90}"

echo "Project: $PROJECT  (set GCP_PROJECT_ID to override)"
echo "Looking for instance with external IP: $IP"
gcloud config set project "$PROJECT" >/dev/null

filter="networkInterfaces[0].accessConfigs[0].natIP=${IP}"
name="$(gcloud compute instances list --filter="$filter" --format="value(name)" | head -1)"
zone="$(gcloud compute instances list --filter="$filter" --format="value(zone)" | head -1)"

if [[ -z "$name" || -z "$zone" ]]; then
  echo "No VM found with that IP in this project. All instances:"
  gcloud compute instances list \
    --format="table(name,zone,status,networkInterfaces[0].accessConfigs[0].natIP)"
  exit 1
fi

status="$(gcloud compute instances describe "$name" --zone="$zone" --format='value(status)')"
echo "Instance: $name  zone: $zone  status: $status"

if [[ "$status" == "RUNNING" ]]; then
  echo "Already running. If the site still fails, SSH in and restart PayRam (docker/systemd)."
  exit 0
fi

echo "Starting instance..."
gcloud compute instances start "$name" --zone="$zone"
echo "Done. Wait ~1–2 minutes, then open http://${IP}/"

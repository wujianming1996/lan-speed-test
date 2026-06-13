#!/bin/sh
# Simple CLI speed test using iperf3
# Usage: ./speedtest-cli.sh <server> [port]

SERVER=${1:-iperf3-server}
PORT=${2:-5201}

echo "=== LAN Speed Test CLI ==="
echo "Server: $SERVER:$PORT"
echo ""

echo "--- Download Test ---"
iperf3 -c "$SERVER" -p "$PORT" -t 10
echo ""

echo "--- Upload Test ---"
iperf3 -c "$SERVER" -p "$PORT" -t 10 -R
echo ""

echo "Done."

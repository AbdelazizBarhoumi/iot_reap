mosquitto_pub -h localhost -p 1883 \
  -u backend -P backend \
  -t "robot/1/telemetry" \
  -m '{"action":"status","timestamp":"2026-01-01T00:00:00Z","session_id":"test"}'
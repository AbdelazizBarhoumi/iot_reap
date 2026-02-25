#!/bin/bash
set -e

echo "Installing usbip..."
apt update
apt install -y usbip

echo "Loading kernel modules..."
modprobe usbip_core
modprobe usbip_host
modprobe vhci-hcd

echo "Making modules persistent..."
cat <<EOF > /etc/modules-load.d/usbip.conf
usbip_core
usbip_host
vhci-hcd
EOF

echo "Creating systemd service..."
cat <<EOF > /etc/systemd/system/usbipd.service
[Unit]
Description=USB/IP Daemon
After=network.target

[Service]
Type=simple
ExecStart=/usr/sbin/usbipd
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "Enabling service..."
systemctl daemon-reload
systemctl enable usbipd
systemctl restart usbipd

echo "Done. Checking status..."
systemctl status usbipd --no-pager
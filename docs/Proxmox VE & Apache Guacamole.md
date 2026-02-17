# Complete API Reference - Proxmox VE & Apache Guacamole

## Table of Contents
1. [Proxmox VE API Complete Reference](#proxmox-ve-api-complete-reference)
2. [Apache Guacamole API Complete Reference](#apache-guacamole-api-complete-reference)
3. [Session Management](#session-management)
4. [Authentication & Authorization](#authentication--authorization)
5. [Complete API Call Examples](#complete-api-call-examples)

---

# Proxmox VE API Complete Reference

## Base Information

**Base URL:** `https://proxmox-host:8006/api2/json/`  
**Alternative Formats:**
- `/api2/json/` - JSON responses (recommended)
- `/api2/extjs/` - ExtJS formatted responses
- `/api2/yaml/` - YAML responses

**Default Port:** 8006 (HTTPS)

---

## Authentication Methods

### 1. Ticket-Based Authentication (Session-Based)

#### Obtain Authentication Ticket
```bash
POST /api2/json/access/ticket
```

**Parameters:**
- `username` (required) - Username in format `user@realm`
- `password` (required) - User password
- `otp` (optional) - One-time password for 2FA
- `path` (optional) - Verify ticket path
- `privs` (optional) - Verify ticket privileges

**Request Example:**
```bash
curl -k -X POST https://proxmox:8006/api2/json/access/ticket \
  -d 'username=root@pam' \
  --data-urlencode 'password=YourPassword'
```

**Response:**
```json
{
  "data": {
    "username": "root@pam",
    "ticket": "PVE:root@pam:62F1F7B5::...",
    "CSRFPreventionToken": "62F1F7B5:...",
    "cap": {
      "vms": { "VM.Allocate": 1, "VM.Audit": 1, ... },
      "storage": { "Datastore.Allocate": 1, ... },
      ...
    }
  }
}
```

**Using the Ticket:**

For GET requests:
```bash
curl -k -b "PVEAuthCookie=PVE:root@pam:62F1F7B5::..." \
  https://proxmox:8006/api2/json/nodes
```

For POST/PUT/DELETE requests:
```bash
curl -k -b "PVEAuthCookie=PVE:root@pam:62F1F7B5::..." \
  -H "CSRFPreventionToken: 62F1F7B5:..." \
  -X POST https://proxmox:8006/api2/json/nodes/pve/qemu/100/status/start
```

**Session Properties:**
- Default timeout: 2 hours
- Extends on activity
- CSRF token required for write operations
- Ticket includes capability map showing user permissions

---

### 2. API Token Authentication (Stateless)

#### Create API Token
```bash
pveum user token add <userid> <tokenid> [OPTIONS]
```

**CLI Options:**
- `--privsep <0|1>` - Enable privilege separation (default: 1)
  - 0: Token has full user privileges
  - 1: Token requires explicit ACL permissions
- `--expire <timestamp>` - Expiration time
- `--comment <string>` - Description

**Example:**
```bash
# Create token with privilege separation
pveum user token add root@pam mytoken --privsep 1

# Create token with full user privileges
pveum user token add root@pam automation --privsep 0

# Set permissions for separated token
pveum acl modify / -token 'root@pam!mytoken' -role PVEVMAdmin
```

**Using API Token:**
```bash
curl -k \
  -H "Authorization: PVEAPIToken=root@pam!mytoken=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  https://proxmox:8006/api2/json/nodes
```

**API Token Management via API:**

List user's tokens:
```bash
GET /access/users/{userid}/token
```

Create token:
```bash
POST /access/users/{userid}/token/{tokenid}
Parameters:
  - privsep (boolean)
  - expire (integer)
  - comment (string)
```

Delete token:
```bash
DELETE /access/users/{userid}/token/{tokenid}
```

Generate new secret:
```bash
POST /access/users/{userid}/token/{tokenid}/generate-secret
```

---

## Complete API Endpoints

### Access Control & Authentication

#### Tickets
```
POST   /access/ticket              - Create authentication ticket
GET    /access/ticket              - Verify ticket (dummy call)
```

#### Users
```
GET    /access/users               - List all users
POST   /access/users               - Create user
GET    /access/users/{userid}      - Get user configuration
PUT    /access/users/{userid}      - Update user
DELETE /access/users/{userid}      - Delete user
POST   /access/password            - Change user password
```

**User Parameters:**
- `userid` - User ID (format: name@realm)
- `password` - Password
- `email` - Email address
- `firstname` - First name
- `lastname` - Last name
- `groups` - Comma-separated group list
- `expire` - Account expiration timestamp
- `enable` - Enable/disable account
- `comment` - User comment
- `keys` - 2FA keys

#### Groups
```
GET    /access/groups              - List all groups
POST   /access/groups              - Create group
GET    /access/groups/{groupid}    - Get group info
PUT    /access/groups/{groupid}    - Update group
DELETE /access/groups/{groupid}    - Delete group
```

**Group Parameters:**
- `groupid` - Group ID
- `comment` - Group comment

#### Roles
```
GET    /access/roles               - List all roles
POST   /access/roles               - Create role
GET    /access/roles/{roleid}      - Get role permissions
PUT    /access/roles/{roleid}      - Update role
DELETE /access/roles/{roleid}      - Delete role
```

**Role Parameters:**
- `roleid` - Role ID
- `privs` - Comma-separated privilege list
- `append` - Append privs (don't replace)

**Built-in Roles:**
- `Administrator` - Full access
- `PVEAdmin` - Proxmox admin (no root)
- `PVEAuditor` - Read-only access
- `PVEVMAdmin` - VM administration
- `PVEVMUser` - VM usage
- `PVEDatastoreAdmin` - Storage administration
- `PVEDatastoreUser` - Storage usage
- `PVETemplateUser` - Template usage
- `PVEPoolAdmin` - Pool administration
- `PVEPoolUser` - Pool usage
- `NoAccess` - Explicitly deny access

#### Access Control Lists (ACL)
```
GET    /access/acl                 - Get ACL list
PUT    /access/acl                 - Update ACL
```

**ACL Parameters:**
- `path` - Resource path
- `users` - User list
- `groups` - Group list
- `tokens` - Token list
- `roles` - Role to assign
- `propagate` - Propagate to child paths (0|1)
- `delete` - Remove ACL (0|1)

**Path Examples:**
- `/` - Root (entire cluster)
- `/nodes/{node}` - Specific node
- `/vms/{vmid}` - Specific VM/CT
- `/storage/{storage}` - Specific storage
- `/pool/{pool}` - Resource pool

#### Domains (Realms)
```
GET    /access/domains             - List authentication domains
GET    /access/domains/{realm}     - Get realm config
POST   /access/domains             - Add realm
PUT    /access/domains/{realm}     - Update realm
DELETE /access/domains/{realm}     - Delete realm
POST   /access/domains/{realm}/sync - Sync realm users
```

**Supported Realm Types:**
- `pve` - Proxmox VE authentication
- `pam` - Linux PAM
- `ldap` - LDAP server
- `ad` - Active Directory
- `openid` - OpenID Connect

#### Two-Factor Authentication
```
GET    /access/tfa                 - List user TFA configuration
POST   /access/tfa                 - Add TFA entry
GET    /access/tfa/{userid}        - Get user TFA
PUT    /access/tfa/{userid}        - Update TFA
DELETE /access/tfa/{userid}        - Delete TFA
```

---

### Cluster Operations

#### Cluster Status & Configuration
```
GET    /cluster/status             - Get cluster status
GET    /cluster/config             - Get cluster configuration
POST   /cluster/config             - Create cluster
PUT    /cluster/config             - Update cluster
DELETE /cluster/config             - Delete cluster

GET    /cluster/options            - Get cluster options
PUT    /cluster/options            - Set cluster options
```

**Cluster Options:**
- `max_workers` - Max concurrent workers
- `migration` - Migration settings
- `console` - Console settings
- `http_proxy` - HTTP proxy
- `keyboard` - Keyboard layout
- `email_from` - Email sender address
- `notify` - Notification settings

#### Cluster Resources
```
GET    /cluster/resources          - List all cluster resources
```

**Parameters:**
- `type` - Resource type filter (vm, storage, node, sdn)

**Response includes:**
- VMs (status, memory, CPU, uptime)
- Storage (size, usage, type)
- Nodes (status, CPU, memory, uptime)

#### Cluster Nodes
```
GET    /cluster/config/nodes       - List cluster nodes
POST   /cluster/config/nodes       - Add node to cluster
DELETE /cluster/config/nodes/{node} - Remove node from cluster
```

#### High Availability (HA)
```
GET    /cluster/ha/status          - HA status
GET    /cluster/ha/groups          - HA groups
POST   /cluster/ha/groups          - Create HA group
PUT    /cluster/ha/groups/{group}  - Update HA group
DELETE /cluster/ha/groups/{group}  - Delete HA group

GET    /cluster/ha/resources       - HA resources
POST   /cluster/ha/resources       - Add HA resource
GET    /cluster/ha/resources/{sid} - Get HA resource
PUT    /cluster/ha/resources/{sid} - Update HA resource
DELETE /cluster/ha/resources/{sid} - Remove HA resource

POST   /cluster/ha/resources/{sid}/migrate   - Migrate HA resource
POST   /cluster/ha/resources/{sid}/relocate  - Relocate HA resource
```

#### Backup Jobs
```
GET    /cluster/backup             - List backup jobs
POST   /cluster/backup             - Create backup job
GET    /cluster/backup/{id}        - Get backup job
PUT    /cluster/backup/{id}        - Update backup job
DELETE /cluster/backup/{id}        - Delete backup job
```

**Backup Job Parameters:**
- `schedule` - Cron schedule
- `storage` - Target storage
- `vmid` - VM/CT list
- `mode` - Backup mode (snapshot, suspend, stop)
- `compress` - Compression (0, 1, gzip, lzo, zstd)
- `mailto` - Email notification
- `prune-backups` - Retention settings

#### Firewall
```
GET    /cluster/firewall/options   - Firewall options
PUT    /cluster/firewall/options   - Update firewall options
GET    /cluster/firewall/rules     - List firewall rules
POST   /cluster/firewall/rules     - Create rule
GET    /cluster/firewall/rules/{pos} - Get rule
PUT    /cluster/firewall/rules/{pos} - Update rule
DELETE /cluster/firewall/rules/{pos} - Delete rule

GET    /cluster/firewall/groups    - List security groups
POST   /cluster/firewall/groups    - Create security group
GET    /cluster/firewall/groups/{group} - Get group rules
POST   /cluster/firewall/groups/{group}/{pos} - Create group rule
PUT    /cluster/firewall/groups/{group}/{pos} - Update group rule
DELETE /cluster/firewall/groups/{group}/{pos} - Delete group rule
```

#### Replication Jobs
```
GET    /cluster/replication        - List replication jobs
POST   /cluster/replication        - Create replication job
GET    /cluster/replication/{id}   - Get job
PUT    /cluster/replication/{id}   - Update job
DELETE /cluster/replication/{id}   - Delete job
```

---

### Node Management

#### Node Information
```
GET    /nodes                      - List all nodes
GET    /nodes/{node}               - Node index
GET    /nodes/{node}/status        - Node status
POST   /nodes/{node}/status        - Shutdown/reboot node

GET    /nodes/{node}/version       - Node version info
GET    /nodes/{node}/time          - Get server time
PUT    /nodes/{node}/time          - Set server time

GET    /nodes/{node}/dns           - DNS settings
PUT    /nodes/{node}/dns           - Update DNS

GET    /nodes/{node}/hosts         - Get /etc/hosts
POST   /nodes/{node}/hosts         - Update /etc/hosts

GET    /nodes/{node}/netstat       - Network statistics
GET    /nodes/{node}/syslog        - System log
```

**Node Status Parameters (POST):**
- `command` - reboot, shutdown

#### Network Configuration
```
GET    /nodes/{node}/network       - List network interfaces
POST   /nodes/{node}/network       - Create interface
GET    /nodes/{node}/network/{iface} - Get interface
PUT    /nodes/{node}/network/{iface} - Update interface
DELETE /nodes/{node}/network/{iface} - Delete interface
POST   /nodes/{node}/network       - Reload network config
```

**Interface Types:**
- `bridge` - Linux bridge
- `bond` - Network bond
- `vlan` - VLAN interface
- `OVSBridge` - Open vSwitch bridge
- `OVSPort` - OVS port
- `OVSBond` - OVS bond
- `OVSIntPort` - OVS internal port

#### Services
```
GET    /nodes/{node}/services      - List services
GET    /nodes/{node}/services/{service} - Get service state
POST   /nodes/{node}/services/{service}/start - Start service
POST   /nodes/{node}/services/{service}/stop - Stop service
POST   /nodes/{node}/services/{service}/restart - Restart service
POST   /nodes/{node}/services/{service}/reload - Reload service
```

**Common Services:**
- `pve-cluster`
- `pveproxy`
- `pvedaemon`
- `pvestatd`
- `pve-firewall`
- `corosync`

#### Tasks
```
GET    /nodes/{node}/tasks         - List node tasks
GET    /nodes/{node}/tasks/{upid}  - Get task status
DELETE /nodes/{node}/tasks/{upid}  - Stop task
GET    /nodes/{node}/tasks/{upid}/log - Get task log
GET    /nodes/{node}/tasks/{upid}/status - Get task status
```

#### APT (Package Management)
```
GET    /nodes/{node}/apt/update    - List available updates
POST   /nodes/{node}/apt/update    - Update package database
GET    /nodes/{node}/apt/versions  - Get package versions
POST   /nodes/{node}/apt/changelog - Get package changelog
```

#### Certificates
```
GET    /nodes/{node}/certificates/info - Certificate info
POST   /nodes/{node}/certificates/acme/certificate - Order ACME cert
PUT    /nodes/{node}/certificates/acme/certificate - Renew ACME cert
DELETE /nodes/{node}/certificates/acme/certificate - Revoke ACME cert
POST   /nodes/{node}/certificates/custom - Upload custom cert
DELETE /nodes/{node}/certificates/custom - Delete custom cert
```

#### Storage
```
GET    /nodes/{node}/storage       - List storage
GET    /nodes/{node}/storage/{storage} - Get storage status
GET    /nodes/{node}/storage/{storage}/content - List storage content
POST   /nodes/{node}/storage/{storage}/content - Allocate disk image
GET    /nodes/{node}/storage/{storage}/content/{volume} - Get volume
PUT    /nodes/{node}/storage/{storage}/content/{volume} - Update attrs
DELETE /nodes/{node}/storage/{storage}/content/{volume} - Delete volume
POST   /nodes/{node}/storage/{storage}/upload - Upload file
GET    /nodes/{node}/storage/{storage}/rrd - Storage RRD data
GET    /nodes/{node}/storage/{storage}/rrddata - Storage RRD data (array)
```

**Content Types:**
- `images` - VM disk images
- `iso` - ISO images
- `vztmpl` - Container templates
- `backup` - Backup files
- `rootdir` - Container root directories
- `snippets` - Snippet files

---

### Virtual Machine (QEMU) Management

#### VM Listing & Creation
```
GET    /nodes/{node}/qemu          - List VMs
POST   /nodes/{node}/qemu          - Create VM
```

**VM Creation Parameters:**
- `vmid` (required) - VM ID (100-999999999)
- `name` - VM name
- `ostype` - OS type (l26, l24, win10, win11, etc.)
- `memory` - RAM in MB
- `cores` - CPU cores
- `sockets` - CPU sockets
- `cpu` - CPU type (host, kvm64, etc.)
- `boot` - Boot order (order=scsi0;ide2;net0)
- `scsihw` - SCSI controller (virtio-scsi-pci, lsi, etc.)
- `storage` - Default storage
- `net[n]` - Network device (model=virtio,bridge=vmbr0)
- `scsi[n]` - SCSI disk
- `ide[n]` - IDE disk
- `sata[n]` - SATA disk
- `virtio[n]` - VirtIO disk
- `cdrom` - CD-ROM (ISO)
- `agent` - QEMU agent (0|1)
- `tablet` - Enable tablet device (0|1)
- `kvm` - Enable KVM (0|1)
- `acpi` - Enable ACPI (0|1)
- `balloon` - Balloon device memory
- `bios` - BIOS (seabios, ovmf)
- `machine` - Machine type
- `numa` - Enable NUMA
- `hotplug` - Hotplug devices
- `pool` - Add to pool
- `protection` - Protection flag

#### VM Configuration
```
GET    /nodes/{node}/qemu/{vmid}/config - Get config
POST   /nodes/{node}/qemu/{vmid}/config - Update config (async)
PUT    /nodes/{node}/qemu/{vmid}/config - Update config (sync)
```

**Config Parameters (extensive list):**
- `name` - VM name
- `description` - VM description
- `memory` - RAM (MB)
- `balloon` - Balloon memory
- `shares` - CPU shares
- `cores` - CPU cores
- `sockets` - CPU sockets
- `numa` - NUMA (0|1)
- `vcpus` - Virtual CPUs
- `cpu` - CPU type
- `cpulimit` - CPU limit
- `cpuunits` - CPU weight
- `boot` - Boot order
- `bootdisk` - Boot disk
- `agent` - QEMU guest agent
- `machine` - Machine type
- `args` - Arbitrary arguments
- `bios` - BIOS type
- `tablet` - Pointer device
- `vga` - VGA device
- `serial[n]` - Serial port
- `parallel[n]` - Parallel port
- `audio[n]` - Audio device
- `usb[n]` - USB device
- `hostpci[n]` - PCI passthrough
- `net[n]` - Network device
- `scsi[n]`, `ide[n]`, `sata[n]`, `virtio[n]` - Disk devices
- `efidisk0` - EFI disk
- `tpmstate0` - TPM state
- `protection` - Protection
- `tags` - Tags
- `startup` - Startup/shutdown order
- `onboot` - Start on boot
- `autostart` - Deprecated (use onboot)

#### VM Status & Power Management
```
GET    /nodes/{node}/qemu/{vmid}/status/current - Current status
POST   /nodes/{node}/qemu/{vmid}/status/start - Start VM
POST   /nodes/{node}/qemu/{vmid}/status/stop - Stop VM
POST   /nodes/{node}/qemu/{vmid}/status/shutdown - Shutdown VM
POST   /nodes/{node}/qemu/{vmid}/status/reset - Reset VM
POST   /nodes/{node}/qemu/{vmid}/status/suspend - Suspend VM
POST   /nodes/{node}/qemu/{vmid}/status/resume - Resume VM
POST   /nodes/{node}/qemu/{vmid}/status/reboot - Reboot VM
```

**Start Parameters:**
- `skiplock` - Skip lock check
- `machine` - Override machine type
- `migratedfrom` - Migration source
- `migration_network` - Migration network
- `migration_type` - Migration type
- `stateuri` - State URI
- `targetstorage` - Target storage

**Stop/Shutdown Parameters:**
- `skiplock` - Skip lock check
- `timeout` - Wait timeout
- `keepActive` - Keep active
- `forceStop` - Force stop (stop only)

#### VM Operations
```
POST   /nodes/{node}/qemu/{vmid}/clone - Clone VM
POST   /nodes/{node}/qemu/{vmid}/migrate - Migrate VM
POST   /nodes/{node}/qemu/{vmid}/move_disk - Move disk
POST   /nodes/{node}/qemu/{vmid}/resize - Resize disk
POST   /nodes/{node}/qemu/{vmid}/template - Convert to template
DELETE /nodes/{node}/qemu/{vmid} - Delete VM
POST   /nodes/{node}/qemu/{vmid}/unlink - Unlink disks
```

**Clone Parameters:**
- `newid` (required) - New VM ID
- `name` - New VM name
- `description` - Description
- `pool` - Pool
- `snapname` - Snapshot name
- `storage` - Target storage
- `format` - Format (qcow2, raw, vmdk)
- `full` - Full copy (0|1)
- `target` - Target node

**Migrate Parameters:**
- `target` (required) - Target node
- `online` - Online migration (0|1)
- `force` - Force migration
- `targetstorage` - Target storage
- `with-local-disks` - Migrate local disks

**Resize Parameters:**
- `disk` (required) - Disk to resize
- `size` (required) - New size (+5G, -2G, 100G)
- `skiplock` - Skip lock

#### Snapshots
```
GET    /nodes/{node}/qemu/{vmid}/snapshot - List snapshots
POST   /nodes/{node}/qemu/{vmid}/snapshot - Create snapshot
GET    /nodes/{node}/qemu/{vmid}/snapshot/{snapname} - Get snapshot
DELETE /nodes/{node}/qemu/{vmid}/snapshot/{snapname} - Delete snapshot
POST   /nodes/{node}/qemu/{vmid}/snapshot/{snapname}/rollback - Rollback
GET    /nodes/{node}/qemu/{vmid}/snapshot/{snapname}/config - Get config
PUT    /nodes/{node}/qemu/{vmid}/snapshot/{snapname}/config - Update config
```

**Snapshot Parameters:**
- `snapname` (required) - Snapshot name
- `description` - Description
- `vmstate` - Include VM state (0|1)

#### Backup & Restore
```
POST   /nodes/{node}/qemu/{vmid}/backup - Create backup
POST   /nodes/{node}/qemu/{vmid}/vncproxy - Create VNC proxy
POST   /nodes/{node}/qemu/{vmid}/termproxy - Create terminal proxy
POST   /nodes/{node}/qemu/{vmid}/vncwebsocket - VNC websocket
POST   /nodes/{node}/qemu/{vmid}/spiceproxy - SPICE proxy
```

**Backup Parameters:**
- `storage` (required) - Target storage
- `mode` - Mode (snapshot, suspend, stop)
- `compress` - Compression (0, 1, gzip, lzo, zstd)
- `notes-template` - Notes template
- `protected` - Protected backup
- `remove` - Remove after backup

#### Firewall
```
GET    /nodes/{node}/qemu/{vmid}/firewall/options - Firewall options
PUT    /nodes/{node}/qemu/{vmid}/firewall/options - Update options
GET    /nodes/{node}/qemu/{vmid}/firewall/rules - List rules
POST   /nodes/{node}/qemu/{vmid}/firewall/rules - Create rule
GET    /nodes/{node}/qemu/{vmid}/firewall/rules/{pos} - Get rule
PUT    /nodes/{node}/qemu/{vmid}/firewall/rules/{pos} - Update rule
DELETE /nodes/{node}/qemu/{vmid}/firewall/rules/{pos} - Delete rule
```

#### Agent Operations (requires QEMU guest agent)
```
POST   /nodes/{node}/qemu/{vmid}/agent/exec - Execute command
POST   /nodes/{node}/qemu/{vmid}/agent/exec-status - Get exec status
POST   /nodes/{node}/qemu/{vmid}/agent/file-read - Read file
POST   /nodes/{node}/qemu/{vmid}/agent/file-write - Write file
GET    /nodes/{node}/qemu/{vmid}/agent/get-fsinfo - Filesystem info
GET    /nodes/{node}/qemu/{vmid}/agent/get-host-name - Hostname
GET    /nodes/{node}/qemu/{vmid}/agent/get-memory-blocks - Memory info
GET    /nodes/{node}/qemu/{vmid}/agent/get-memory-block-info - Memory block
GET    /nodes/{node}/qemu/{vmid}/agent/get-osinfo - OS info
GET    /nodes/{node}/qemu/{vmid}/agent/get-time - Guest time
GET    /nodes/{node}/qemu/{vmid}/agent/get-timezone - Timezone
GET    /nodes/{node}/qemu/{vmid}/agent/get-users - Logged in users
GET    /nodes/{node}/qemu/{vmid}/agent/get-vcpus - VCPU info
GET    /nodes/{node}/qemu/{vmid}/agent/info - Agent info
GET    /nodes/{node}/qemu/{vmid}/agent/network-get-interfaces - Network
POST   /nodes/{node}/qemu/{vmid}/agent/ping - Ping agent
POST   /nodes/{node}/qemu/{vmid}/agent/shutdown - Shutdown via agent
POST   /nodes/{node}/qemu/{vmid}/agent/suspend-disk - Suspend to disk
POST   /nodes/{node}/qemu/{vmid}/agent/suspend-hybrid - Hybrid suspend
POST   /nodes/{node}/qemu/{vmid}/agent/suspend-ram - Suspend to RAM
POST   /nodes/{node}/qemu/{vmid}/agent/set-user-password - Set password
```

#### Monitoring
```
GET    /nodes/{node}/qemu/{vmid}/rrd - RRD data
GET    /nodes/{node}/qemu/{vmid}/rrddata - RRD data (array)
```

---

### Container (LXC) Management

#### Container Listing & Creation
```
GET    /nodes/{node}/lxc           - List containers
POST   /nodes/{node}/lxc           - Create container
```

**Container Creation Parameters:**
- `vmid` (required) - Container ID
- `ostemplate` (required) - OS template
- `storage` (required) - Storage for rootfs
- `hostname` - Container hostname
- `description` - Description
- `memory` - RAM (MB)
- `swap` - Swap (MB)
- `cores` - CPU cores
- `cpulimit` - CPU limit
- `cpuunits` - CPU weight
- `net[n]` - Network interface
- `mp[n]` - Mount point
- `rootfs` - Root filesystem
- `password` - Root password
- `ssh-public-keys` - SSH keys
- `unprivileged` - Unprivileged container (0|1)
- `features` - Features (nesting, keyctl, fuse, etc.)
- `nameserver` - DNS server
- `searchdomain` - DNS search domain
- `onboot` - Start on boot
- `startup` - Startup order
- `protection` - Protection
- `pool` - Pool
- `tags` - Tags

#### Container Configuration
```
GET    /nodes/{node}/lxc/{vmid}/config - Get config
PUT    /nodes/{node}/lxc/{vmid}/config - Update config
```

**Config Parameters:**
- `hostname` - Hostname
- `description` - Description
- `memory` - RAM
- `swap` - Swap
- `cores` - CPU cores
- `cpulimit` - CPU limit
- `cpuunits` - CPU weight
- `net[n]` - Network device
- `mp[n]` - Mount point
- `rootfs` - Root filesystem
- `console` - Console mode
- `tty` - TTY count
- `cmode` - Console mode
- `onboot` - Start on boot
- `startup` - Startup order
- `protection` - Protection
- `features` - Features
- `tags` - Tags
- `template` - Template flag
- `unprivileged` - Unprivileged
- `nameserver` - DNS
- `searchdomain` - Search domain

#### Container Status & Power
```
GET    /nodes/{node}/lxc/{vmid}/status/current - Current status
POST   /nodes/{node}/lxc/{vmid}/status/start - Start CT
POST   /nodes/{node}/lxc/{vmid}/status/stop - Stop CT
POST   /nodes/{node}/lxc/{vmid}/status/shutdown - Shutdown CT
POST   /nodes/{node}/lxc/{vmid}/status/suspend - Suspend CT
POST   /nodes/{node}/lxc/{vmid}/status/resume - Resume CT
POST   /nodes/{node}/lxc/{vmid}/status/reboot - Reboot CT
```

#### Container Operations
```
POST   /nodes/{node}/lxc/{vmid}/clone - Clone CT
POST   /nodes/{node}/lxc/{vmid}/migrate - Migrate CT
POST   /nodes/{node}/lxc/{vmid}/resize - Resize CT
POST   /nodes/{node}/lxc/{vmid}/template - Convert to template
DELETE /nodes/{node}/lxc/{vmid} - Delete CT
```

#### Snapshots
```
GET    /nodes/{node}/lxc/{vmid}/snapshot - List snapshots
POST   /nodes/{node}/lxc/{vmid}/snapshot - Create snapshot
GET    /nodes/{node}/lxc/{vmid}/snapshot/{snapname} - Get snapshot
DELETE /nodes/{node}/lxc/{vmid}/snapshot/{snapname} - Delete snapshot
POST   /nodes/{node}/lxc/{vmid}/snapshot/{snapname}/rollback - Rollback
GET    /nodes/{node}/lxc/{vmid}/snapshot/{snapname}/config - Get config
PUT    /nodes/{node}/lxc/{vmid}/snapshot/{snapname}/config - Update config
```

#### Console & Terminal
```
POST   /nodes/{node}/lxc/{vmid}/vncproxy - VNC proxy
POST   /nodes/{node}/lxc/{vmid}/termproxy - Terminal proxy
POST   /nodes/{node}/lxc/{vmid}/vncwebsocket - VNC websocket
```

#### Firewall
```
GET    /nodes/{node}/lxc/{vmid}/firewall/options - Firewall options
PUT    /nodes/{node}/lxc/{vmid}/firewall/options - Update options
GET    /nodes/{node}/lxc/{vmid}/firewall/rules - List rules
POST   /nodes/{node}/lxc/{vmid}/firewall/rules - Create rule
```

---

### Storage Management

#### Storage Configuration
```
GET    /storage                    - List storage
POST   /storage                    - Create storage
GET    /storage/{storage}          - Get storage config
PUT    /storage/{storage}          - Update storage
DELETE /storage/{storage}          - Delete storage
```

**Storage Types:**
- `dir` - Directory
- `lvm` - LVM volume group
- `lvmthin` - LVM thin pool
- `nfs` - NFS
- `cifs` - CIFS/SMB
- `glusterfs` - GlusterFS
- `iscsi` - iSCSI
- `iscsidirect` - iSCSI (kernel)
- `cephfs` - CephFS
- `rbd` - Ceph RBD
- `zfs` - ZFS pool
- `zfspool` - ZFS over iSCSI
- `drbd` - DRBD

**Common Parameters:**
- `storage` (required) - Storage ID
- `type` (required) - Storage type
- `content` - Content types
- `nodes` - Nodes
- `disable` - Disable storage
- `shared` - Shared storage flag
- `maxfiles` - Max backup files

**Type-Specific Parameters:**

NFS:
- `server` - NFS server
- `export` - Export path
- `options` - Mount options

CIFS:
- `server` - CIFS server
- `share` - Share name
- `username` - Username
- `password` - Password
- `domain` - Domain

LVM:
- `vgname` - Volume group

iSCSI:
- `portal` - iSCSI portal
- `target` - iSCSI target

Ceph RBD:
- `monhost` - Monitor hosts
- `pool` - Pool name
- `username` - Username
- `krbd` - Use krbd

---

### Pools (Resource Pools)

```
GET    /pools                      - List pools
POST   /pools                      - Create pool
GET    /pools/{poolid}             - Get pool
PUT    /pools/{poolid}             - Update pool
DELETE /pools/{poolid}             - Delete pool
```

**Pool Parameters:**
- `poolid` (required) - Pool ID
- `comment` - Comment
- `vms` - VM/CT list
- `storage` - Storage list

---

### Complete Examples with Session Management

#### Example 1: Complete Session Flow
```bash
#!/bin/bash

# 1. Authenticate and get ticket
AUTH=$(curl -k -s -X POST https://proxmox:8006/api2/json/access/ticket \
  -d "username=root@pam" \
  --data-urlencode "password=YourPassword")

TICKET=$(echo $AUTH | jq -r '.data.ticket')
CSRF=$(echo $AUTH | jq -r '.data.CSRFPreventionToken')

# 2. List all VMs (GET - no CSRF needed)
curl -k -s -b "PVEAuthCookie=$TICKET" \
  https://proxmox:8006/api2/json/cluster/resources?type=vm \
  | jq '.data[] | {vmid, name, status, node}'

# 3. Start a VM (POST - CSRF required)
curl -k -s -b "PVEAuthCookie=$TICKET" \
  -H "CSRFPreventionToken: $CSRF" \
  -X POST https://proxmox:8006/api2/json/nodes/pve/qemu/100/status/start

# 4. Monitor task
UPID=$(curl -k -s -b "PVEAuthCookie=$TICKET" \
  https://proxmox:8006/api2/json/nodes/pve/tasks \
  | jq -r '.data[0].upid')

curl -k -s -b "PVEAuthCookie=$TICKET" \
  https://proxmox:8006/api2/json/nodes/pve/tasks/$UPID/status \
  | jq '.data.status'
```

#### Example 2: API Token Usage
```bash
#!/bin/bash

TOKEN="root@pam!automation=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# List all nodes
curl -k -s -H "Authorization: PVEAPIToken=$TOKEN" \
  https://proxmox:8006/api2/json/nodes \
  | jq '.data[] | {node, status, cpu, memory}'

# Create VM
curl -k -s -H "Authorization: PVEAPIToken=$TOKEN" \
  -X POST https://proxmox:8006/api2/json/nodes/pve/qemu \
  -d "vmid=200" \
  -d "name=automated-vm" \
  -d "memory=2048" \
  -d "cores=2" \
  -d "net0=virtio,bridge=vmbr0"
```

#### Example 3: Python with Session Management
```python
import requests
import json
from urllib3 import disable_warnings
from urllib3.exceptions import InsecureRequestWarning

disable_warnings(InsecureRequestWarning)

class ProxmoxAPI:
    def __init__(self, host, user, password):
        self.host = host
        self.base_url = f"https://{host}:8006/api2/json"
        self.session = requests.Session()
        self.session.verify = False
        
        # Authenticate
        auth_data = {
            'username': user,
            'password': password
        }
        response = self.session.post(
            f"{self.base_url}/access/ticket",
            data=auth_data
        )
        result = response.json()['data']
        
        # Store ticket and CSRF token
        self.ticket = result['ticket']
        self.csrf = result['CSRFPreventionToken']
        
        # Set cookie for all requests
        self.session.cookies.set('PVEAuthCookie', self.ticket)
        
    def get(self, endpoint):
        """GET request - no CSRF needed"""
        response = self.session.get(f"{self.base_url}{endpoint}")
        return response.json()
    
    def post(self, endpoint, data=None):
        """POST request - CSRF required"""
        headers = {'CSRFPreventionToken': self.csrf}
        response = self.session.post(
            f"{self.base_url}{endpoint}",
            headers=headers,
            data=data
        )
        return response.json()
    
    def put(self, endpoint, data=None):
        """PUT request - CSRF required"""
        headers = {'CSRFPreventionToken': self.csrf}
        response = self.session.put(
            f"{self.base_url}{endpoint}",
            headers=headers,
            data=data
        )
        return response.json()
    
    def delete(self, endpoint):
        """DELETE request - CSRF required"""
        headers = {'CSRFPreventionToken': self.csrf}
        response = self.session.delete(
            f"{self.base_url}{endpoint}",
            headers=headers
        )
        return response.json()

# Usage
pve = ProxmoxAPI('192.168.1.10', 'root@pam', 'password')

# List VMs
vms = pve.get('/cluster/resources?type=vm')
for vm in vms['data']:
    print(f"VM {vm['vmid']}: {vm['name']} - {vm['status']}")

# Create VM
vm_config = {
    'vmid': 300,
    'name': 'python-vm',
    'memory': 4096,
    'cores': 4,
    'net0': 'virtio,bridge=vmbr0'
}
result = pve.post('/nodes/pve/qemu', vm_config)
print(f"Task: {result['data']}")

# Start VM
pve.post('/nodes/pve/qemu/300/status/start')
```

---

# Apache Guacamole API Complete Reference

## Base Information

**Base URL:** `https://guacamole-host/guacamole/api/`  
**Authentication:** Token-based (obtained via login)  
**Token Parameter:** Can be passed as:
- Query parameter: `?token=xxx`
- Header: `Guacamole-Token: xxx`

---

## Authentication

### Obtain Authentication Token
```
POST /api/tokens
```

**Parameters:**
- `username` (required) - Username
- `password` (required) - Password

**Request:**
```bash
curl -s -X POST \
  -d 'username=guacadmin' \
  -d 'password=guacadmin' \
  https://guacamole/guacamole/api/tokens
```

**Response:**
```json
{
  "authToken": "ABCD1234567890FEDCBA",
  "username": "guacadmin",
  "dataSource": "mysql",
  "availableDataSources": ["mysql"]
}
```

### Invalidate Token (Logout)
```
DELETE /api/tokens/{token}
```

**Example:**
```bash
curl -s -X DELETE \
  https://guacamole/guacamole/api/tokens/ABCD1234567890FEDCBA
```

---

## Session Data Sources

Most Guacamole API endpoints require a data source identifier in the path:
```
/api/session/data/{dataSource}/...
```

Common data sources:
- `mysql` - MySQL database authentication
- `postgresql` - PostgreSQL database authentication
- `ldap` - LDAP authentication
- `openid` - OpenID Connect

Get available data sources from the authentication response.

---

## User Management

### List Users
```
GET /api/session/data/{dataSource}/users
```

**Parameters:**
- `token` - Authentication token

**Example:**
```bash
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/mysql/users \
  | jq
```

**Response:**
```json
{
  "guacadmin": {
    "username": "guacadmin",
    "attributes": {
      "disabled": "",
      "expired": "",
      "access-window-start": "",
      "access-window-end": "",
      "valid-from": "",
      "valid-until": "",
      "timezone": null,
      "guac-full-name": "",
      "guac-organization": "",
      "guac-organizational-role": ""
    }
  }
}
```

### Get User Details
```
GET /api/session/data/{dataSource}/users/{username}
```

### Create User
```
POST /api/session/data/{dataSource}/users
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "newpassword",
  "attributes": {
    "disabled": "",
    "expired": "",
    "access-window-start": "",
    "access-window-end": "",
    "valid-from": "",
    "valid-until": "",
    "timezone": null,
    "guac-full-name": "New User",
    "guac-organization": "Company",
    "guac-organizational-role": "Developer"
  }
}
```

**Example:**
```bash
curl -s -H "Guacamole-Token: $TOKEN" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "username": "john",
    "password": "SecurePass123",
    "attributes": {
      "guac-full-name": "John Doe",
      "guac-organization": "IT Department"
    }
  }' \
  https://guacamole/guacamole/api/session/data/mysql/users
```

### Update User
```
PUT /api/session/data/{dataSource}/users/{username}
```

**Request Body:** Same as create

### Delete User
```
DELETE /api/session/data/{dataSource}/users/{username}
```

### Change Password
```
PUT /api/session/data/{dataSource}/users/{username}/password
```

**Request Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

---

## User Permissions

### Get User Permissions
```
GET /api/session/data/{dataSource}/users/{username}/permissions
```

**Response:**
```json
{
  "connectionPermissions": {
    "1": ["READ"],
    "2": ["READ", "UPDATE", "DELETE"]
  },
  "connectionGroupPermissions": {
    "ROOT": ["READ"]
  },
  "userPermissions": {
    "guacadmin": ["READ", "UPDATE"]
  },
  "systemPermissions": [
    "ADMINISTER",
    "CREATE_CONNECTION",
    "CREATE_CONNECTION_GROUP",
    "CREATE_SHARING_PROFILE",
    "CREATE_USER",
    "CREATE_USER_GROUP"
  ]
}
```

### Update User Permissions
```
PATCH /api/session/data/{dataSource}/users/{username}/permissions
```

**Request Body:**
```json
[
  {
    "op": "add",
    "path": "/connectionPermissions/5",
    "value": ["READ"]
  },
  {
    "op": "add",
    "path": "/systemPermissions",
    "value": "CREATE_CONNECTION"
  }
]
```

**Permission Types:**
- `READ` - View connection/user
- `UPDATE` - Modify connection/user
- `DELETE` - Delete connection/user
- `ADMINISTER` - Full administrative access

**System Permissions:**
- `ADMINISTER` - System administration
- `CREATE_CONNECTION` - Create connections
- `CREATE_CONNECTION_GROUP` - Create connection groups
- `CREATE_SHARING_PROFILE` - Create sharing profiles
- `CREATE_USER` - Create users
- `CREATE_USER_GROUP` - Create user groups

---

## Connection Management

### List Connections
```
GET /api/session/data/{dataSource}/connections
```

**Example:**
```bash
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/mysql/connections \
  | jq
```

**Response:**
```json
{
  "1": {
    "name": "Windows Server",
    "identifier": "1",
    "parentIdentifier": "ROOT",
    "protocol": "rdp",
    "attributes": {
      "max-connections": "",
      "max-connections-per-user": "",
      "weight": "",
      "failover-only": "",
      "guacd-hostname": "",
      "guacd-port": "",
      "guacd-encryption": ""
    },
    "activeConnections": 0
  }
}
```

### Get Connection Details
```
GET /api/session/data/{dataSource}/connections/{identifier}
```

### Create Connection
```
POST /api/session/data/{dataSource}/connections
```

**VNC Connection Example:**
```json
{
  "name": "Ubuntu Desktop",
  "parentIdentifier": "ROOT",
  "protocol": "vnc",
  "parameters": {
    "hostname": "192.168.1.100",
    "port": "5901",
    "password": "vncpassword",
    "color-depth": "24",
    "swap-red-blue": "false",
    "cursor": "remote",
    "read-only": "false",
    "enable-audio": "true",
    "audio-servername": "",
    "enable-recording": "false"
  },
  "attributes": {
    "max-connections": "",
    "max-connections-per-user": "1",
    "weight": "",
    "failover-only": "false",
    "guacd-hostname": "",
    "guacd-port": "",
    "guacd-encryption": "none"
  }
}
```

**RDP Connection Example:**
```json
{
  "name": "Windows 10 Pro",
  "parentIdentifier": "ROOT",
  "protocol": "rdp",
  "parameters": {
    "hostname": "192.168.1.101",
    "port": "3389",
    "username": "administrator",
    "password": "AdminPass123",
    "domain": "WORKGROUP",
    "security": "any",
    "ignore-cert": "true",
    "enable-wallpaper": "false",
    "enable-theming": "false",
    "enable-font-smoothing": "false",
    "enable-full-window-drag": "false",
    "enable-desktop-composition": "false",
    "enable-menu-animations": "false",
    "disable-bitmap-caching": "false",
    "disable-offscreen-caching": "false",
    "color-depth": "16",
    "console": "false",
    "initial-program": "",
    "server-layout": "en-us-qwerty",
    "timezone": "",
    "enable-printing": "true",
    "printer-name": "",
    "enable-drive": "true",
    "drive-name": "Shared",
    "drive-path": "/shared",
    "create-drive-path": "true",
    "enable-audio": "true",
    "enable-audio-input": "false",
    "recording-path": "",
    "recording-name": "",
    "create-recording-path": "false"
  },
  "attributes": {
    "max-connections": "",
    "max-connections-per-user": "2"
  }
}
```

**SSH Connection Example:**
```json
{
  "name": "Linux Server",
  "parentIdentifier": "ROOT",
  "protocol": "ssh",
  "parameters": {
    "hostname": "192.168.1.102",
    "port": "22",
    "username": "root",
    "password": "RootPass123",
    "private-key": "",
    "passphrase": "",
    "command": "",
    "font-name": "monospace",
    "font-size": "12",
    "color-scheme": "gray-black",
    "scrollback": "1000",
    "readonly": "false",
    "backspace": "127",
    "terminal-type": "xterm-256color",
    "create-typescript-path": "true",
    "typescript-path": "",
    "typescript-name": "",
    "recording-path": "",
    "recording-name": "",
    "recording-exclude-output": "false",
    "recording-exclude-mouse": "false",
    "recording-include-keys": "false",
    "enable-sftp": "true",
    "sftp-root-directory": "/"
  },
  "attributes": {}
}
```

**Telnet Connection Example:**
```json
{
  "name": "Legacy System",
  "parentIdentifier": "ROOT",
  "protocol": "telnet",
  "parameters": {
    "hostname": "192.168.1.103",
    "port": "23",
    "username": "admin",
    "password": "admin",
    "username-regex": "login:",
    "password-regex": "Password:",
    "font-name": "monospace",
    "font-size": "12",
    "color-scheme": "gray-black",
    "scrollback": "1000",
    "backspace": "127",
    "terminal-type": "ansi"
  },
  "attributes": {}
}
```

**Kubernetes Connection Example:**
```json
{
  "name": "K8s Pod",
  "parentIdentifier": "ROOT",
  "protocol": "kubernetes",
  "parameters": {
    "hostname": "kubernetes.default.svc",
    "port": "443",
    "namespace": "default",
    "pod": "nginx-deployment-66b6c48dd5-abcde",
    "container": "nginx",
    "use-ssl": "true",
    "ignore-cert": "false",
    "ca-cert": "",
    "client-cert": "",
    "client-key": "",
    "font-name": "monospace",
    "font-size": "12",
    "color-scheme": "gray-black",
    "scrollback": "1000",
    "backspace": "127",
    "readonly": "false"
  },
  "attributes": {}
}
```

### Update Connection
```
PUT /api/session/data/{dataSource}/connections/{identifier}
```

**Request Body:** Same structure as create

### Delete Connection
```
DELETE /api/session/data/{dataSource}/connections/{identifier}
```

### Get Connection Parameters (Full Details)
```
GET /api/session/data/{dataSource}/connections/{identifier}/parameters
```

---

## Connection Protocol Parameters

### VNC Parameters
- `hostname` - VNC server hostname/IP
- `port` - Port (default 5900)
- `password` - VNC password
- `username` - VNC username (if supported)
- `color-depth` - Color depth (8, 16, 24, 32)
- `swap-red-blue` - Swap red/blue (true/false)
- `cursor` - Cursor mode (local, remote)
- `autoretry` - Auto-retry connection
- `read-only` - Read-only mode
- `force-lossless` - Force lossless compression
- `encodings` - Encoding list
- `dest-host` - Destination host (for repeater)
- `dest-port` - Destination port
- `enable-audio` - Enable audio
- `audio-servername` - Audio server
- `enable-recording` - Enable session recording
- `recording-path` - Recording path
- `recording-name` - Recording filename
- `recording-exclude-output` - Exclude output from recording
- `recording-exclude-mouse` - Exclude mouse from recording
- `recording-include-keys` - Include keystrokes
- `create-recording-path` - Create recording path

### RDP Parameters
- `hostname` - RDP server hostname/IP
- `port` - Port (default 3389)
- `username` - Username
- `password` - Password
- `domain` - Windows domain
- `security` - Security mode (any, nla, tls, rdp, vmconnect)
- `disable-auth` - Disable authentication
- `ignore-cert` - Ignore certificate errors
- `gateway-hostname` - RD Gateway hostname
- `gateway-port` - RD Gateway port
- `gateway-username` - RD Gateway username
- `gateway-password` - RD Gateway password
- `gateway-domain` - RD Gateway domain
- `initial-program` - Initial program
- `client-name` - Client name
- `console` - Console session
- `server-layout` - Keyboard layout
- `timezone` - Timezone
- `administrator-console` - Admin console (Windows 2003)
- `width` - Screen width
- `height` - Screen height
- `dpi` - Screen DPI
- `color-depth` - Color depth (8, 16, 24, 32)
- `resize-method` - Resize method (display-update, reconnect)
- `force-lossless` - Force lossless compression
- `enable-wallpaper` - Enable wallpaper
- `enable-theming` - Enable theming
- `enable-font-smoothing` - Font smoothing
- `enable-full-window-drag` - Full window drag
- `enable-desktop-composition` - Desktop composition
- `enable-menu-animations` - Menu animations
- `disable-bitmap-caching` - Disable bitmap cache
- `disable-offscreen-caching` - Disable offscreen cache
- `disable-glyph-caching` - Disable glyph cache
- `preconnection-id` - Pre-connection ID
- `preconnection-blob` - Pre-connection BLOB
- `enable-printing` - Enable printing
- `printer-name` - Printer name
- `enable-drive` - Enable drive redirection
- `drive-name` - Drive name
- `drive-path` - Local drive path
- `create-drive-path` - Create drive path
- `console-audio` - Console audio
- `disable-audio` - Disable audio
- `enable-audio-input` - Enable audio input
- `enable-touch` - Enable touch
- `read-only` - Read-only mode
- `normalize-clipboard` - Normalize clipboard
- `disable-copy` - Disable copy
- `disable-paste` - Disable paste
- `wol-send-packet` - Send Wake-on-LAN
- `wol-mac-addr` - MAC address for WoL
- `wol-broadcast-addr` - Broadcast address
- `wol-udp-port` - UDP port for WoL
- `wol-wait-time` - Wait time after WoL
- `recording-path` - Recording path
- `recording-name` - Recording name
- `recording-exclude-output` - Exclude output
- `recording-exclude-mouse` - Exclude mouse
- `recording-include-keys` - Include keys
- `create-recording-path` - Create recording path
- `sftp-enable` - Enable SFTP
- `sftp-hostname` - SFTP hostname
- `sftp-port` - SFTP port
- `sftp-username` - SFTP username
- `sftp-password` - SFTP password
- `sftp-private-key` - SFTP private key
- `sftp-passphrase` - SFTP passphrase
- `sftp-directory` - SFTP directory
- `sftp-root-directory` - SFTP root
- `sftp-server-alive-interval` - Keep-alive interval
- `sftp-disable-download` - Disable download
- `sftp-disable-upload` - Disable upload

### SSH Parameters
- `hostname` - SSH server hostname/IP
- `port` - Port (default 22)
- `host-key` - Host key (known_hosts format)
- `username` - Username
- `password` - Password
- `private-key` - Private key (PEM)
- `passphrase` - Private key passphrase
- `command` - Execute command
- `locale` - Locale
- `timezone` - Timezone
- `font-name` - Font name
- `font-size` - Font size
- `max-scrollback` - Scrollback buffer size
- `readonly` - Read-only mode
- `scrollback` - Scrollback lines
- `backspace` - Backspace key code
- `terminal-type` - Terminal type (xterm, linux, etc.)
- `color-scheme` - Color scheme
- `create-typescript-path` - Create typescript path
- `typescript-path` - Typescript path
- `typescript-name` - Typescript filename
- `typescript-auto-create-path` - Auto-create typescript path
- `recording-path` - Recording path
- `recording-name` - Recording name
- `recording-exclude-output` - Exclude output
- `recording-exclude-mouse` - Exclude mouse
- `recording-include-keys` - Include keys
- `create-recording-path` - Create recording path
- `enable-sftp` - Enable SFTP
- `sftp-root-directory` - SFTP root
- `sftp-disable-download` - Disable download
- `sftp-disable-upload` - Disable upload
- `server-alive-interval` - Keep-alive interval

### Telnet Parameters
- `hostname` - Telnet server hostname/IP
- `port` - Port (default 23)
- `username` - Username
- `password` - Password
- `username-regex` - Username prompt regex
- `password-regex` - Password prompt regex
- `login-success-regex` - Login success regex
- `login-failure-regex` - Login failure regex
- `font-name` - Font name
- `font-size` - Font size
- `max-scrollback` - Scrollback buffer
- `color-scheme` - Color scheme
- `scrollback` - Scrollback lines
- `backspace` - Backspace key
- `terminal-type` - Terminal type
- `create-typescript-path` - Create typescript path
- `typescript-path` - Typescript path
- `typescript-name` - Typescript filename
- `recording-path` - Recording path
- `recording-name` - Recording name
- `recording-exclude-output` - Exclude output
- `recording-exclude-mouse` - Exclude mouse
- `recording-include-keys` - Include keys
- `create-recording-path` - Create recording path
- `readonly` - Read-only mode

### Kubernetes Parameters
- `hostname` - Kubernetes API hostname
- `port` - API port (default 443)
- `namespace` - Pod namespace
- `pod` - Pod name
- `container` - Container name
- `use-ssl` - Use SSL/TLS
- `ignore-cert` - Ignore cert errors
- `ca-cert` - CA certificate
- `client-cert` - Client certificate
- `client-key` - Client key
- `font-name` - Font name
- `font-size` - Font size
- `max-scrollback` - Scrollback buffer
- `color-scheme` - Color scheme
- `scrollback` - Scrollback lines
- `backspace` - Backspace key
- `readonly` - Read-only mode
- `create-typescript-path` - Create typescript path
- `typescript-path` - Typescript path
- `typescript-name` - Typescript filename
- `recording-path` - Recording path
- `recording-name` - Recording name
- `recording-exclude-output` - Exclude output
- `recording-exclude-mouse` - Exclude mouse
- `recording-include-keys` - Include keys
- `create-recording-path` - Create recording path

---

## Connection Groups

### List Connection Groups
```
GET /api/session/data/{dataSource}/connectionGroups
```

### Get Connection Tree (Hierarchical)
```
GET /api/session/data/{dataSource}/connectionGroups/ROOT/tree
```

**Response:**
```json
{
  "name": "ROOT",
  "identifier": "ROOT",
  "type": "ORGANIZATIONAL",
  "activeConnections": 0,
  "childConnections": [
    {
      "name": "Ubuntu Desktop",
      "identifier": "1",
      "parentIdentifier": "ROOT",
      "protocol": "vnc",
      "activeConnections": 0
    }
  ],
  "childConnectionGroups": [
    {
      "name": "Production Servers",
      "identifier": "2",
      "type": "ORGANIZATIONAL",
      "activeConnections": 0,
      "childConnections": [],
      "childConnectionGroups": []
    }
  ],
  "attributes": {}
}
```

### Create Connection Group
```
POST /api/session/data/{dataSource}/connectionGroups
```

**Request Body:**
```json
{
  "name": "Web Servers",
  "parentIdentifier": "ROOT",
  "type": "ORGANIZATIONAL",
  "attributes": {
    "max-connections": "",
    "max-connections-per-user": "",
    "enable-session-affinity": ""
  }
}
```

**Group Types:**
- `ORGANIZATIONAL` - Organizational folder
- `BALANCING` - Load balancing group

### Update Connection Group
```
PUT /api/session/data/{dataSource}/connectionGroups/{identifier}
```

### Delete Connection Group
```
DELETE /api/session/data/{dataSource}/connectionGroups/{identifier}
```

---

## Active Connections & Sessions

### List Active Connections
```
GET /api/session/data/{dataSource}/activeConnections
```

**Response:**
```json
{
  "12345": {
    "identifier": "12345",
    "connectionIdentifier": "1",
    "startDate": "2025-02-11T10:30:00.000Z",
    "remoteHost": "192.168.1.50",
    "username": "guacadmin",
    "connectable": {
      "name": "Ubuntu Desktop",
      "identifier": "1",
      "parentIdentifier": "ROOT",
      "protocol": "vnc"
    }
  }
}
```

### Get Active Connection Details
```
GET /api/session/data/{dataSource}/activeConnections/{identifier}
```

### Disconnect Active Connection
```
DELETE /api/session/data/{dataSource}/activeConnections/{identifier}
```

---

## Sharing Profiles

### List Sharing Profiles
```
GET /api/session/data/{dataSource}/sharingProfiles
```

### Create Sharing Profile
```
POST /api/session/data/{dataSource}/sharingProfiles
```

**Request Body:**
```json
{
  "name": "View Only Access",
  "primaryConnectionIdentifier": "1",
  "parameters": {
    "read-only": "true"
  },
  "attributes": {
    "max-connections": "",
    "max-connections-per-user": "1"
  }
}
```

### Update Sharing Profile
```
PUT /api/session/data/{dataSource}/sharingProfiles/{identifier}
```

### Delete Sharing Profile
```
DELETE /api/session/data/{dataSource}/sharingProfiles/{identifier}
```

---

## User Groups

### List User Groups
```
GET /api/session/data/{dataSource}/userGroups
```

### Create User Group
```
POST /api/session/data/{dataSource}/userGroups
```

**Request Body:**
```json
{
  "identifier": "developers",
  "attributes": {
    "disabled": ""
  }
}
```

### Get User Group
```
GET /api/session/data/{dataSource}/userGroups/{identifier}
```

### Update User Group
```
PUT /api/session/data/{dataSource}/userGroups/{identifier}
```

### Delete User Group
```
DELETE /api/session/data/{dataSource}/userGroups/{identifier}
```

### Get User Group Members
```
GET /api/session/data/{dataSource}/userGroups/{identifier}/memberUsers
```

### Add User to Group
```
PATCH /api/session/data/{dataSource}/userGroups/{identifier}/memberUsers
```

**Request Body:**
```json
[
  {
    "op": "add",
    "path": "/",
    "value": "username"
  }
]
```

---

## History & Monitoring

### Get Connection History
```
GET /api/session/data/{dataSource}/history/connections
```

**Parameters:**
- `contains` - Filter by connection name
- `limit` - Limit results
- `offset` - Pagination offset

**Response:**
```json
[
  {
    "connectionIdentifier": "1",
    "connectionName": "Ubuntu Desktop",
    "startDate": "2025-02-11T10:00:00.000Z",
    "endDate": "2025-02-11T11:30:00.000Z",
    "username": "guacadmin",
    "remoteHost": "192.168.1.50",
    "active": false
  }
]
```

### Get User History
```
GET /api/session/data/{dataSource}/history/users/{username}
```

---

## System Information & Settings

### Get System Permissions
```
GET /api/session/data/{dataSource}/schema/userPermissions
```

### Get Connection Permissions Schema
```
GET /api/session/data/{dataSource}/schema/connectionPermissions
```

### Get Protocols
```
GET /api/session/data/{dataSource}/schema/protocols
```

**Response:**
```json
{
  "vnc": {
    "name": "VNC",
    "connectionForms": [...],
    "sharingProfileForms": [...]
  },
  "rdp": {
    "name": "RDP",
    "connectionForms": [...],
    "sharingProfileForms": [...]
  },
  "ssh": {...},
  "telnet": {...},
  "kubernetes": {...}
}
```

---

## Complete Session Management Examples

### Example 1: Complete Guacamole Session
```bash
#!/bin/bash

# 1. Login and get token
TOKEN=$(curl -s -X POST \
  -d 'username=guacadmin' \
  -d 'password=guacadmin' \
  https://guacamole/guacamole/api/tokens \
  | jq -r '.authToken')

DATASOURCE="mysql"

# 2. List all connections
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/$DATASOURCE/connections \
  | jq 'to_entries[] | {id: .key, name: .value.name, protocol: .value.protocol}'

# 3. Create new VNC connection
CONNECTION_ID=$(curl -s -H "Guacamole-Token: $TOKEN" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "name": "New VM",
    "parentIdentifier": "ROOT",
    "protocol": "vnc",
    "parameters": {
      "hostname": "192.168.1.200",
      "port": "5901",
      "password": "vncpass"
    },
    "attributes": {}
  }' \
  https://guacamole/guacamole/api/session/data/$DATASOURCE/connections \
  | jq -r '.identifier')

echo "Created connection ID: $CONNECTION_ID"

# 4. Create user
curl -s -H "Guacamole-Token: $TOKEN" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "username": "testuser",
    "password": "TestPass123",
    "attributes": {
      "guac-full-name": "Test User"
    }
  }' \
  https://guacamole/guacamole/api/session/data/$DATASOURCE/users

# 5. Grant user access to connection
curl -s -H "Guacamole-Token: $TOKEN" \
  -H 'Content-Type: application/json' \
  -X PATCH \
  -d '[
    {
      "op": "add",
      "path": "/connectionPermissions/'$CONNECTION_ID'",
      "value": ["READ"]
    }
  ]' \
  https://guacamole/guacamole/api/session/data/$DATASOURCE/users/testuser/permissions

# 6. List active connections
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/$DATASOURCE/activeConnections \
  | jq

# 7. Logout
curl -s -X DELETE \
  https://guacamole/guacamole/api/tokens/$TOKEN
```

### Example 2: Python Guacamole API Client
```python
import requests
import json

class GuacamoleAPI:
    def __init__(self, url, username, password):
        self.url = url.rstrip('/')
        self.api_url = f"{self.url}/api"
        self.session = requests.Session()
        
        # Authenticate
        auth_response = self.session.post(
            f"{self.api_url}/tokens",
            data={'username': username, 'password': password}
        )
        auth_data = auth_response.json()
        
        self.token = auth_data['authToken']
        self.datasource = auth_data['dataSource']
        
        # Set token header for all requests
        self.session.headers.update({
            'Guacamole-Token': self.token
        })
    
    def get(self, endpoint):
        """GET request"""
        url = f"{self.api_url}/session/data/{self.datasource}{endpoint}"
        response = self.session.get(url)
        return response.json()
    
    def post(self, endpoint, data):
        """POST request"""
        url = f"{self.api_url}/session/data/{self.datasource}{endpoint}"
        response = self.session.post(
            url,
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        return response.json()
    
    def put(self, endpoint, data):
        """PUT request"""
        url = f"{self.api_url}/session/data/{self.datasource}{endpoint}"
        response = self.session.put(
            url,
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        return response.json()
    
    def patch(self, endpoint, data):
        """PATCH request"""
        url = f"{self.api_url}/session/data/{self.datasource}{endpoint}"
        response = self.session.patch(
            url,
            json=data,
            headers={'Content-Type': 'application/json'}
        )
        return response.json()
    
    def delete(self, endpoint):
        """DELETE request"""
        url = f"{self.api_url}/session/data/{self.datasource}{endpoint}"
        response = self.session.delete(url)
        return response.json() if response.text else {}
    
    def logout(self):
        """Logout and invalidate token"""
        self.session.delete(f"{self.api_url}/tokens/{self.token}")
    
    # Convenience methods
    def list_connections(self):
        return self.get('/connections')
    
    def create_connection(self, name, protocol, parameters, parent="ROOT"):
        data = {
            'name': name,
            'parentIdentifier': parent,
            'protocol': protocol,
            'parameters': parameters,
            'attributes': {}
        }
        return self.post('/connections', data)
    
    def list_users(self):
        return self.get('/users')
    
    def create_user(self, username, password, full_name=''):
        data = {
            'username': username,
            'password': password,
            'attributes': {
                'guac-full-name': full_name
            }
        }
        return self.post('/users', data)
    
    def grant_connection_permission(self, username, connection_id, permissions=['READ']):
        patch_data = [{
            'op': 'add',
            'path': f'/connectionPermissions/{connection_id}',
            'value': permissions
        }]
        return self.patch(f'/users/{username}/permissions', patch_data)
    
    def get_connection_tree(self):
        return self.get('/connectionGroups/ROOT/tree')
    
    def get_active_connections(self):
        return self.get('/activeConnections')

# Usage
guac = GuacamoleAPI(
    'https://guacamole.example.com/guacamole',
    'guacadmin',
    'guacadmin'
)

# List all connections
connections = guac.list_connections()
for conn_id, conn in connections.items():
    print(f"{conn_id}: {conn['name']} ({conn['protocol']})")

# Create RDP connection
rdp_params = {
    'hostname': '192.168.1.100',
    'port': '3389',
    'username': 'administrator',
    'password': 'AdminPass',
    'security': 'any',
    'ignore-cert': 'true'
}
new_conn = guac.create_connection('Windows Server', 'rdp', rdp_params)
print(f"Created connection: {new_conn}")

# Create user and grant access
guac.create_user('bob', 'BobPass123', 'Bob Smith')
guac.grant_connection_permission('bob', new_conn['identifier'], ['READ'])

# Check active connections
active = guac.get_active_connections()
print(f"Active connections: {len(active)}")

# Logout
guac.logout()
```

---

## Authentication Modes Explained

### Mode 1: Database (MySQL/PostgreSQL)
- User credentials stored in database
- Full web-based management interface
- Supports connection sharing and permissions
- Best for: Small to medium deployments

### Mode 2: LDAP
- Authenticates against LDAP directory
- Connections can be in LDAP or database
- Users managed in LDAP
- Best for: Organizations with existing LDAP

### Mode 3: OpenID Connect (SSO)
- Delegates authentication to IdP (Google, Azure AD, etc.)
- Requires database extension for connections
- Users auto-created on first login
- Best for: Cloud-integrated environments

### Mode 4: TOTP (Multi-Factor)
- Adds 2FA to any authentication method
- Requires database backend
- Users enroll via web interface
- Best for: High-security requirements

### Mode 5: Header Authentication
- Trusts external proxy/gateway
- Reads username from HTTP header
- Must secure against header injection
- Best for: Reverse proxy deployments

### Mode 6: JSON (Token-based)
- External apps generate signed tokens
- Tokens contain user and connection info
- No Guacamole user database needed
- Best for: Embedded Guacamole

---

## Session Control & Appearance

### Session Recording
All protocols support session recording configured per-connection:
- `recording-path` - Directory for recordings
- `recording-name` - Filename pattern
- `recording-exclude-output` - Don't record screen
- `recording-exclude-mouse` - Don't record mouse
- `recording-include-keys` - Record keystrokes

### Session Sharing
Connections can be shared in real-time:
1. Create sharing profile for connection
2. Share connection link
3. Multiple users can view/control session

### Connection Load Balancing
Connection groups can balance between multiple servers:
1. Create BALANCING group
2. Add connections to group
3. Guacamole distributes connections

### Session Affinity
Ensures users reconnect to same server:
- `enable-session-affinity` in connection group attributes

---

## Security Best Practices

### API Token Security
- Store tokens securely
- Implement token rotation
- Use HTTPS only
- Set short token timeouts
- Never log tokens

### Connection Security
- Use TLS for all protocols when possible
- Enable NLA for RDP
- Use SSH key authentication over passwords
- Implement read-only connections where appropriate
- Enable session recording for audit trails

### User Management
- Implement principle of least privilege
- Use groups for permission management
- Enable MFA (TOTP)
- Regular permission audits
- Disable unused accounts

### Network Security
- Run Guacamole behind reverse proxy
- Use firewall rules
- Implement IP whitelisting
- Use VPN for remote access
- Separate management network

---

## Troubleshooting & Debugging

### Check Connection Status
```bash
# Get connection details
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/mysql/connections/1 \
  | jq

# Check active connections
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/mysql/activeConnections \
  | jq

# View connection history
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/mysql/history/connections \
  | jq
```

### Debug Authentication
```bash
# Verify token is valid
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/mysql/self \
  | jq

# Check user permissions
curl -s -H "Guacamole-Token: $TOKEN" \
  https://guacamole/guacamole/api/session/data/mysql/users/username/permissions \
  | jq
```

### Common Error Codes
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server-side issue

---

This comprehensive guide covers all major API endpoints, authentication methods, session management, and practical examples for both Proxmox VE and Apache Guacamole.

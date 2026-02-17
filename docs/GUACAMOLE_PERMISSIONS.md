# Guacamole Permission Fix Guide

## The Problem

When trying to create connections via the Guacamole REST API, you get a `403 Forbidden` error:

```
Permission denied.
```

This happens because the `guacadmin` user doesn't have the "Administer system" permission required to create, modify, or delete connections via the API.

## The Solution

### Option 1: Grant Admin Permissions (Recommended)

1. **Log in to Guacamole web interface** as `guacadmin`:
   - URL: `http://192.168.1.175:8080/guacamole/`
   - Username: `guacadmin`
   - Password: `guacadmin`

2. **Go to Settings** (click on your username → Settings)

3. **Go to Users tab**

4. **Click on `guacadmin` user**

5. **Under "Permissions", check these boxes:**
   - ✅ Administer system
   - ✅ Create new connections
   - ✅ Create new connection groups  
   - ✅ Create new sharing profiles
   - ✅ Create new users
   - ✅ Create new user groups

6. **Save the changes**

7. **Test the API:**
   ```bash
   php test-session-lifecycle.php
   ```

### Option 2: Create a Dedicated API User

1. **Create a new user** in Guacamole (e.g., `api-user`)
2. **Grant full permissions** to this user
3. **Update `.env`**:
   ```
   GUACAMOLE_USERNAME=api-user
   GUACAMOLE_PASSWORD=your-secure-password
   ```

### Option 3: Pre-Create Connections

If you can't modify Guacamole permissions, pre-create connections for each VM:

1. **In Guacamole web UI**, create a connection for each VM:
   - Name: `vm-100` (match the VM ID)
   - Protocol: RDP or VNC
   - Hostname: VM's IP address
   - Port: 3389 (RDP) or 5900 (VNC)

2. **Update the code** to use existing connections instead of creating new ones.

## Verification

After granting permissions, run:

```bash
php test-session-lifecycle.php
```

Expected output:
```
║  create_connection    ✓ PASS
```

## MySQL Backend Note

If you're using MySQL as the Guacamole backend, you can also grant permissions via SQL:

```sql
-- Get the guacadmin user_id
SELECT user_id FROM guacamole_user WHERE username = 'guacadmin';

-- Grant system permission (assuming user_id = 1)
INSERT INTO guacamole_system_permission (user_id, permission)
VALUES (1, 'ADMINISTER');

INSERT INTO guacamole_system_permission (user_id, permission)
VALUES (1, 'CREATE_CONNECTION');

INSERT INTO guacamole_system_permission (user_id, permission)
VALUES (1, 'CREATE_CONNECTION_GROUP');

INSERT INTO guacamole_system_permission (user_id, permission)
VALUES (1, 'CREATE_USER');
```

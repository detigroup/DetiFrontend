# Dev Domain Setup & Troubleshooting Guide

## Overview

This guide explains how to set up and troubleshoot `https://dev.detidex.yeuthich.net:3000` for local development. The domain requires proper DNS configuration and network setup to work correctly.

**Key Point:** DNS must resolve to your **LAN IP address** (e.g., `192.168.2.42`), NOT to `127.0.0.1`, for proper local dev access.

## Prerequisites

- Node.js 18+
- macOS or Linux
- mkcert installed (`brew install mkcert nss`)
- Admin/sudo access (for DNS and firewall configuration)

## Part A: DNS & /etc/hosts Configuration

### Why /etc/hosts?

`/etc/hosts` is your local DNS resolution file. It maps domain names to IP addresses on your machine. For local dev:

```
127.0.0.1       localhost
192.168.2.42    dev.detidex.yeuthich.net
```

**Important:** Use your **LAN IP address** (not 127.0.0.1) so other machines on the network can access the dev server.

### Step 1: Find Your LAN IP Address

```bash
# macOS - get your local network IP (en0, en1, etc.)
ifconfig | grep -E "inet " | grep -v 127.0.0.1

# Output should show something like:
#   inet 192.168.2.42 netmask 0xffffff00 broadcast 192.168.2.255
```

Save this IP - you'll need it in the next step.

### Step 2: Add Entry to /etc/hosts

```bash
# Open /etc/hosts in nano editor
sudo nano /etc/hosts
```

Add this line (replace `192.168.2.42` with your actual LAN IP):

```
127.0.0.1       localhost
192.168.2.42    dev.detidex.yeuthich.net
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`.

### Step 3: Flush DNS Cache

After editing `/etc/hosts`, flush your system DNS cache so changes take effect:

```bash
# macOS:
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux:
sudo systemctl restart systemd-resolved
# or
sudo resolvectl flush-caches
```

### Step 4: Verify DNS Resolution

Verify the domain now resolves correctly:

```bash
# Method 1: nslookup
nslookup dev.detidex.yeuthich.net

# Expected output:
#   Server:    127.0.0.1
#   Address:   127.0.0.1#53
#
#   Name:   dev.detidex.yeuthich.net
#   Address: 192.168.2.42

# Method 2: dig (if installed)
dig +short dev.detidex.yeuthich.net

# Expected output: 192.168.2.42

# Method 3: ping
ping -c 1 dev.detidex.yeuthich.net

# Expected output should show 192.168.2.42 being pinged
```

## Part B: Port & Firewall Configuration

### Step 1: Ensure Port 3000 is Open

Vite uses port 3000 by default. Ensure nothing is blocking it:

```bash
# Check if port 3000 is in use
lsof -i :3000

# You should see the npm/vite process:
#   COMMAND     PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
#   node      12345 user   18u  IPv6 0x1234567890ab      0t0  TCP *:3000 (LISTEN)
```

### Step 2: macOS Firewall Configuration

If you have macOS firewall enabled and can't access from other machines:

```bash
# Check if firewall is on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# If ON, allow Node.js (your npm process)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockall
```

Or use System Preferences:
1. **System Preferences** → **Security & Privacy** → **Firewall Options**
2. Add Node.js to the allowed apps list
3. Or disable firewall for local dev (if in a trusted network)

### Step 3: Test Port Accessibility

```bash
# From the same machine (localhost)
curl -I http://localhost:3000

# Expected: HTTP response (even if 200 or connection refused is OK)
```

## Part C: Verification & Testing

### Method 1: Quick Diagnostic Script

Run our automated diagnostic script:

```bash
bash ./scripts/check-dev-domain.sh
```

This will check:
- ✓ DNS resolution
- ✓ Port listening
- ✓ Network connectivity
- ✓ IP resolution

### Method 2: Manual Verification

```bash
# 1. Start the dev server
npm run dev
# or for HTTPS: npm run dev:domain

# 2. In another terminal, verify each endpoint

# Test localhost
curl -I http://localhost:3000
# Expected: HTTP response

# Test by LAN IP (replace 192.168.2.42 with your IP)
curl -I http://192.168.2.42:3000
# Expected: HTTP response

# Test by domain name
curl -I http://dev.detidex.yeuthich.net:3000
# Expected: HTTP response
```

### Method 3: Browser Testing

1. Open browser on **this machine**:
   - http://localhost:3000 ✓ (should work)
   - http://dev.detidex.yeuthich.net:3000 ✓ (should work with /etc/hosts entry)

2. From **another machine on the same LAN**:
   - http://192.168.2.42:3000 ✓ (should work)
   - http://dev.detidex.yeuthich.net:3000 ✗ (won't work without /etc/hosts on that machine)

## Part D: HTTPS & Self-Signed Certificates

### Generate Certificates

```bash
# Generate self-signed certs for the dev domain
npm run dev:domain

# This will:
# 1. Run mkcert to create .pem files in .cert/
# 2. Start Vite with HTTPS enabled
```

### Browser Warning

When accessing `https://dev.detidex.yeuthich.net:3000`, your browser will warn about self-signed certificate:

- **Chrome/Edge:** Click "Advanced" → "Proceed to dev.detidex.yeuthich.net (unsafe)"
- **Firefox:** Click "Advanced..." → "Accept the Risk and Continue"
- **Safari:** Click "Show Details" → "Visit this website"

This is **normal and safe** for local development with mkcert.

### Verify HTTPS

```bash
# This will show certificate warning (expected), but proves HTTPS is working
curl -k -I https://dev.detidex.yeuthich.net:3000
# (-k flag ignores self-signed cert warning)
```

## Part E: Troubleshooting

### Issue: ERR_CONNECTION_TIMED_OUT

**Symptom:** Browser times out when accessing `https://dev.detidex.yeuthich.net:3000`

**Checklist:**

1. ✓ Dev server is running
   ```bash
   lsof -i :3000
   ```
   If not running, start with: `npm run dev`

2. ✓ DNS resolves correctly
   ```bash
   nslookup dev.detidex.yeuthich.net
   ```
   Should show your LAN IP, NOT 127.0.0.1

3. ✓ /etc/hosts entry exists
   ```bash
   grep dev.detidex.yeuthich.net /etc/hosts
   ```
   Should show: `192.168.2.42 dev.detidex.yeuthich.net`

4. ✓ DNS cache flushed
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

5. ✓ Try direct IP
   ```bash
   curl -I http://192.168.2.42:3000
   ```
   If this works, issue is DNS-related

6. ✓ Check firewall
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   ```
   If ON, check allowed apps include Node.js

### Issue: Browser Works, But Other LAN Machines Can't Connect

**Cause:** Other machines don't have `/etc/hosts` entry

**Solution:**

Option A: Add entry to every machine's `/etc/hosts`:
```
192.168.2.42 dev.detidex.yeuthich.net
```

Option B: Access by IP directly:
```
http://192.168.2.42:3000
```

Option C: Configure corporate DNS (if available)

### Issue: DNS Resolves But Still Times Out

**Possible causes:**

1. **Router/LAN issue:**
   ```bash
   # Ping your machine to verify network reachability
   ping 192.168.2.42
   ```

2. **VPN interference:**
   - Temporarily disconnect VPN
   - Some VPNs block local network access

3. **IP Address Changed:**
   ```bash
   # Your LAN IP might have changed
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Update `/etc/hosts` with new IP if needed

4. **Domain resolves to wrong/public IP:**
   ```bash
   nslookup dev.detidex.yeuthich.net
   ```
   If it shows a public IP instead of 192.168.2.42, you have a DNS conflict. Edit `/etc/hosts` directly.

### Issue: HTTPS Certificate Errors After Updating macOS

mkcert root CA might need reinstallation:

```bash
mkcert -install
```

Then regenerate certificates:

```bash
npm run dev:domain
```

## Part F: Accessing From Other Machines

### Same LAN Network

1. Find dev machine IP:
   ```bash
   # On dev machine:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # e.g., 192.168.2.42
   ```

2. From other machine, access:
   ```
   http://192.168.2.42:3000
   ```

3. To use domain name from other machine, add to its `/etc/hosts`:
   ```
   192.168.2.42 dev.detidex.yeuthich.net
   ```

### Remote Network / VPN

For production-like testing from remote:
- Not recommended (defeats local dev purpose)
- Use `ngrok` or similar if needed
- Configure firewall/port forwarding carefully

## Part G: vite.config.ts Reference

Current configuration ensures proper network access:

```typescript
server: {
  port: 3000,                           // Accessible on port 3000
  host: '0.0.0.0',                      // Listen on all interfaces
  allowedHosts: ['dev.detidex.yeuthich.net'],
  https: httpsOptions,                  // HTTPS if certs exist
  hmr: {
    host: 'dev.detidex.yeuthich.net',   // HMR uses domain
    protocol: httpsEnabled ? 'wss' : 'ws',
    clientPort: 3000,
  },
}
```

This allows:
- ✓ Local access via `localhost:3000`
- ✓ LAN access via `192.168.2.42:3000`
- ✓ Domain access via `dev.detidex.yeuthich.net:3000`

## Quick Reference Commands

```bash
# Start dev server (HTTP + HMR over ws)
npm run dev

# Start with HTTPS (need certs) + HMR over wss
npm run dev:domain

# Run diagnostic check
bash ./scripts/check-dev-domain.sh

# Verify DNS
nslookup dev.detidex.yeuthich.net

# Check port
lsof -i :3000

# Check IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Flush DNS cache (macOS)
sudo dscacheutil -flushcache

# Edit /etc/hosts
sudo nano /etc/hosts

# Generate HTTPS certs
mkcert -key-file .cert/dev.detidex.yeuthich.net-key.pem -cert-file .cert/dev.detidex.yeuthich.net.pem dev.detidex.yeuthich.net
```

## Summary

| Component | Configuration | Status |
| --- | --- | --- |
| **Server Binding** | `0.0.0.0:3000` | ✓ All interfaces |
| **DNS (local)** | `/etc/hosts` → LAN IP | ⚠️ Manual setup required |
| **DNS (remote LAN)** | Firewall port 3000 open | ⚠️ May need firewall config |
| **HTTPS** | mkcert self-signed | ✓ Optional |
| **HMR** | WebSocket/WSS to domain | ✓ Configured |

## Next Steps

1. Add `/etc/hosts` entry (Part A)
2. Flush DNS cache (Part A, Step 3)
3. Start dev server: `npm run dev`
4. Run diagnostic: `bash ./scripts/check-dev-domain.sh`
5. Open browser: `https://dev.detidex.yeuthich.net:3000`

For questions, see the diagnostic script output or refer to the troubleshooting section.

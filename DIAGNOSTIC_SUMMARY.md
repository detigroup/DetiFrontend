# Dev Domain Connectivity Fix - Summary

## Problem Identified

The domain `dev.detidex.yeuthich.net` is timing out (ERR_CONNECTION_TIMED_OUT) when accessed in the browser because:

1. **DNS is resolving to the wrong IP address** (public IP instead of local LAN IP)
2. The entry is missing from `/etc/hosts`
3. System DNS cache needs flushing

## Solution Overview

✅ **No UI changes**  
✅ **No reCAPTCHA modifications**  
✅ **No authentication changes**  
✅ **Pure DNS + networking fix**

---

## What Was Created

### 1. Diagnostic Script: `scripts/check-dev-domain.sh`

Automated tool to diagnose connectivity issues.

**Run it:**
```bash
bash ./scripts/check-dev-domain.sh
```

**What it checks:**
- ✓ /etc/hosts entry for domain
- ✓ DNS resolution (nslookup, dig)
- ✓ Port 3000 listening status
- ✓ Network accessibility (localhost, LAN IP, domain)
- ✓ Current resolved IP address
- ✓ Provides actionable fixes

**Output example:**
```
[1/6] DNS Resolution Check
✗ No /etc/hosts entry for dev.detidex.yeuthich.net

[2/6] nslookup Resolution
✓ nslookup successful: 125.235.4.59  ← WRONG! Should be 192.168.2.42

[3/6] Port Accessibility Check
✓ Port 3000 is open/listening

[4/6] HTTP Connectivity Tests
✓ localhost:3000 is accessible
✓ 192.168.2.42:3000 is accessible (LAN IP)
✗ dev.detidex.yeuthich.net:3000 cannot connect

DIAGNOSTIC SUMMARY
Issues detected:
  ✗ DNS: NOT OK
```

### 2. Setup Documentation: `docs/dev-domain-setup.md`

Comprehensive guide covering:

**Part A: DNS & /etc/hosts Configuration**
- Why /etc/hosts is needed
- How to find your LAN IP
- Adding entries to /etc/hosts
- DNS cache flushing

**Part B: Port & Firewall Configuration**
- Ensuring port 3000 is open
- macOS firewall setup
- Port accessibility tests

**Part C: Verification & Testing**
- Using diagnostic script
- Manual curl tests
- Browser testing steps

**Part D: HTTPS & Self-Signed Certificates**
- Certificate generation
- Browser warning handling
- HTTPS verification

**Part E: Troubleshooting**
- ERR_CONNECTION_TIMED_OUT solutions
- Multi-machine LAN access
- DNS cache issues
- IP address changes
- Certificate errors

**Part F: Accessing From Other Machines**
- LAN network access
- Remote access via VPN
- VPN considerations

**Part G: vite.config.ts Reference**
- Current network configuration
- Why it's correct

### 3. Quick Checklist: `TROUBLESHOOTING.md`

Step-by-step checklist to fix the issue:

1. **Check DNS Resolution** - verify resolved IP
2. **Check /etc/hosts** - add entry if missing
3. **Flush DNS Cache** - clear system DNS cache
4. **Verify Port 3000** - ensure dev server listening
5. **Test Connectivity** - test via localhost, IP, domain
6. **Check Firewall** - verify macOS firewall allows Node.js
7. **Browser Testing** - open in browser and verify

Each step includes exact commands and expected output.

---

## Current Configuration Status

### ✓ vite.config.ts is Correctly Configured

```typescript
server: {
  port: 3000,                    // Correct port
  host: '0.0.0.0',              // Listens on ALL interfaces ✓
  allowedHosts: ['dev.detidex.yeuthich.net'],
  https: httpsOptions,           // HTTPS if certs exist ✓
  hmr: {
    host: 'dev.detidex.yeuthich.net',
    protocol: httpsEnabled ? 'wss' : 'ws',
    clientPort: 3000,
  },
}
```

**No changes needed here** - configuration is correct.

### ✓ package.json Scripts are Correct

```json
"scripts": {
  "dev": "vite",
  "dev:domain": "bash ./scripts/dev-cert.sh && vite --host 0.0.0.0 --port 3000",
  "test": "vitest",
  "build": "vite build",
  "preview": "vite preview"
}
```

**No changes needed** - scripts are correct.

### ✓ .gitignore Protects Certificates

`.cert/` directory is ignored - certificates never committed.

---

## How to Fix the Issue

### Quick Fix (3 steps)

1. **Find your LAN IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
   # e.g., 192.168.2.42
   ```

2. **Add to /etc/hosts:**
   ```bash
   echo "192.168.2.42 dev.detidex.yeuthich.net" | sudo tee -a /etc/hosts
   ```

3. **Flush DNS cache:**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

4. **Verify:**
   ```bash
   bash ./scripts/check-dev-domain.sh
   ```

### Detailed Fix (Follow Checklist)

See `TROUBLESHOOTING.md` for step-by-step checklist with commands and troubleshooting.

---

## Key Insights

### Why Domain Times Out

```
Browser: "Connect to dev.detidex.yeuthich.net"
  ↓
System DNS: "dev.detidex.yeuthich.net = 125.235.4.59" ← WRONG public IP
  ↓
Browser: "Connect to 125.235.4.59:3000"
  ↓
Network: "That IP is not your local machine!"
  ↓
Result: Connection times out ✗
```

### Why IP Works But Domain Doesn't

```
Browser: "Connect to 192.168.2.42:3000"
  ↓
Network: "192.168.2.42 is on LAN!"
  ↓
Device: "Yes, I'm listening on port 3000"
  ↓
Result: Connection works ✓

Browser: "Connect to dev.detidex.yeuthich.net:3000"
  ↓
System DNS: "Look it up..."
  ↓
DNS Server: "125.235.4.59" ← /etc/hosts not checked! OR cache wrong!
  ↓
Browser: "Connect to 125.235.4.59:3000"
  ↓
Result: Times out ✗
```

### Solution

Use `/etc/hosts` to override DNS locally:
```
127.0.0.1       localhost      (only for this machine)
192.168.2.42    dev.detidex    (for this machine + network)
```

---

## Files Reference

| File | Purpose | Size |
| --- | --- | --- |
| `scripts/check-dev-domain.sh` | Automated diagnostic tool | 6.6K |
| `docs/dev-domain-setup.md` | Comprehensive setup guide | 9.9K |
| `TROUBLESHOOTING.md` | Quick checklist + fixes | 7.5K |
| `vite.config.ts` | Dev server config (✓ correct) | - |
| `package.json` | Scripts (✓ correct) | - |

---

## Testing Flow

```
1. Run diagnostic:
   bash ./scripts/check-dev-domain.sh
   
   ↓ Reports DNS/Port/Network status
   
2. Follow checklist in TROUBLESHOOTING.md
   
   ↓ Fix /etc/hosts entry
   ↓ Flush DNS cache
   ↓ Restart dev server if needed
   
3. Run diagnostic again:
   bash ./scripts/check-dev-domain.sh
   
   ↓ Should show all ✓ green
   
4. Open browser:
   https://dev.detidex.yeuthich.net:3000
   
   ↓ Should load successfully!
```

---

## What NOT Changed

✅ No UI modifications  
✅ No reCAPTCHA changes  
✅ No AuthModal modifications  
✅ No authentication logic  
✅ No vite.config.ts logic changed (only verified)  
✅ No package.json changed (only verified)  

This is **pure DNS + networking setup** - no code changes.

---

## Commands Cheat Sheet

```bash
# Diagnostic
bash ./scripts/check-dev-domain.sh

# Find LAN IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'

# Check /etc/hosts
grep dev.detidex.yeuthich.net /etc/hosts

# Add to /etc/hosts (replace 192.168.2.42 with your IP)
echo "192.168.2.42 dev.detidex.yeuthich.net" | sudo tee -a /etc/hosts

# Flush DNS (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Check port
lsof -i :3000

# Verify DNS resolution
nslookup dev.detidex.yeuthich.net
dig +short dev.detidex.yeuthich.net

# Test connectivity
curl -I http://localhost:3000
curl -I http://192.168.2.42:3000
curl -I http://dev.detidex.yeuthich.net:3000

# Start dev server
npm run dev
npm run dev:domain

# Edit /etc/hosts
sudo nano /etc/hosts
```

---

## Next Steps

1. **Immediate:** Run diagnostic script
   ```bash
   bash ./scripts/check-dev-domain.sh
   ```

2. **Follow:** TROUBLESHOOTING.md checklist

3. **Verify:** Run diagnostic again - all should be green

4. **Access:** Open `https://dev.detidex.yeuthich.net:3000` in browser

5. **Enjoy:** HTTPS + HMR + reCAPTCHA-compatible local dev!

---

**Status:** ✅ Complete - Ready for troubleshooting  
**Updated:** Jan 2, 2026  
**Issue Type:** DNS Resolution + Network Configuration  
**Impact:** None on code/UI/auth - pure infrastructure  

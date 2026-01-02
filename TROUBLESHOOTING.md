# Dev Domain Access Troubleshooting Checklist

## Problem Analysis

You're getting `ERR_CONNECTION_TIMED_OUT` or the browser hangs when accessing `https://dev.detidex.yeuthich.net:3000`.

**Root Cause:** The domain `dev.detidex.yeuthich.net` is likely resolving to the **wrong IP address** (public IP or different LAN IP instead of your local machine).

---

## Quick Diagnosis

Run this command to see what's happening:

```bash
bash ./scripts/check-dev-domain.sh
```

This will show:
- ✓/✗ DNS resolution status
- ✓/✗ Port 3000 listening
- ✓/✗ Network connectivity
- Current IP your domain resolves to

---

## Checklist: Fix the Issue

### ☐ Step 1: Check DNS Resolution

**What DNS is your domain resolving to?**

```bash
nslookup dev.detidex.yeuthich.net
```

**What should it resolve to?**

Your local machine's **LAN IP address** (e.g., `192.168.2.42`).

**What is your LAN IP?**

```bash
ifconfig | grep -E "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
```

**If it doesn't match:** → Go to **Step 2**

### ☐ Step 2: Check /etc/hosts

Your local `/etc/hosts` file should have an entry for the domain.

```bash
grep dev.detidex.yeuthich.net /etc/hosts
```

**Expected output:**
```
192.168.2.42 dev.detidex.yeuthich.net
```

**Not there or wrong IP?**

1. Edit `/etc/hosts`:
   ```bash
   sudo nano /etc/hosts
   ```

2. Find or add this line (use your actual LAN IP from Step 1):
   ```
   192.168.2.42 dev.detidex.yeuthich.net
   ```

3. Save: `Ctrl+X` → `Y` → `Enter`

### ☐ Step 3: Flush DNS Cache

After editing `/etc/hosts`, clear the system DNS cache:

```bash
# macOS:
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux:
sudo systemctl restart systemd-resolved
```

Wait 5-10 seconds, then verify:

```bash
nslookup dev.detidex.yeuthich.net
```

Should now show your **LAN IP** (e.g., `192.168.2.42`).

### ☐ Step 4: Verify Port 3000 is Open

Check if the dev server is listening:

```bash
lsof -i :3000
```

**Should show:**
```
node     12345  user  18u  IPv6  0x123...  0t0  TCP *:3000 (LISTEN)
```

**If NOT showing?** Start the dev server:

```bash
npm run dev
# or with HTTPS:
npm run dev:domain
```

### ☐ Step 5: Test Connectivity

Try different ways to access the server:

```bash
# Method 1: Localhost
curl -I http://localhost:3000
# Expected: HTTP response ✓

# Method 2: By LAN IP (your actual IP)
curl -I http://192.168.2.42:3000
# Expected: HTTP response ✓

# Method 3: By domain name
curl -I http://dev.detidex.yeuthich.net:3000
# Expected: HTTP response ✓
```

If **Method 2 (IP) works but Method 3 (domain) fails**, DNS is still wrong.

### ☐ Step 6: Check System Firewall (macOS)

If accessing by IP works but domain still times out, check firewall:

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
```

**If firewall is ON:**

1. Check if Node.js is allowed:
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --listapps
   ```

2. If not listed, add it:
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   ```

3. Allow all:
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockall
   ```

Or use System Preferences:
- **System Preferences** → **Security & Privacy** → **Firewall Options**
- Add `/usr/local/bin/node` to allowed apps

### ☐ Step 7: Browser Testing

1. **Open your browser** on this machine
2. **Go to:** `http://dev.detidex.yeuthich.net:3000`
   - Should load (HTTP, not HTTPS initially)
   - If it works, all DNS/network is OK

3. **Try HTTPS:** `https://dev.detidex.yeuthich.net:3000`
   - Browser will warn about self-signed certificate
   - Click "Proceed" or "Advanced" → "Visit anyway"
   - Should load if HTTPS certs are generated

---

## Advanced Troubleshooting

### DNS Still Wrong After Flushing?

Sometimes DNS cache is more persistent. Try:

```bash
# Restart DNS service
sudo killall -HUP mDNSResponder

# Wait and check again
sleep 5
nslookup dev.detidex.yeuthich.net

# Still wrong? Edit /etc/hosts again and verify the IP is correct
cat /etc/hosts | grep dev.detidex
```

### Domain Works Locally But Not From Other LAN Machines?

**This is expected.** Other machines don't have your `/etc/hosts` entry.

**Solution A:** Add entry to every machine:
```bash
# On the other machine, add to its /etc/hosts:
192.168.2.42 dev.detidex.yeuthich.net
```

**Solution B:** Access by IP directly:
```bash
# No need for /etc/hosts, just use:
http://192.168.2.42:3000
```

### VPN Disconnects Local Network?

If you're on VPN, it might block local LAN access:
1. Temporarily disconnect VPN
2. Test access
3. If works, VPN is the issue - configure split tunneling or exemptions

### IP Address Changed?

Your DHCP-assigned LAN IP might change. If access stops working:

```bash
# Find current IP:
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'

# Update /etc/hosts with new IP:
sudo nano /etc/hosts
# Change the old IP to the new one

# Flush DNS cache:
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## Verification Flow

```
Run diagnostic:
bash ./scripts/check-dev-domain.sh
    ↓
All green? ✓ You're done!
    ↓
DNS not OK? → Fix /etc/hosts + flush DNS
    ↓
Port not OK? → Start dev server (npm run dev)
    ↓
Both OK but still times out?
    ↓
Check firewall
Check VPN
Check IP address hasn't changed
    ↓
Still stuck? → See docs/dev-domain-setup.md Part E
```

---

## Key Points to Remember

1. **DNS must point to LAN IP, not 127.0.0.1**
   - `127.0.0.1` is localhost - only works on this machine
   - Your LAN IP (`192.168.2.42`) works everywhere on the network

2. **/etc/hosts is local only**
   - Each machine needs its own entry
   - Or just use IP address (works everywhere without entry)

3. **DNS cache needs flushing**
   - After editing `/etc/hosts`, MUST flush cache
   - Or browser might use old cached DNS

4. **Port 3000 must be listening**
   - Check with: `lsof -i :3000`
   - Start with: `npm run dev`

5. **Firewall might block access**
   - Check with: `sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate`
   - Allow Node.js if needed

---

## Still Not Working?

1. **Run the diagnostic script:**
   ```bash
   bash ./scripts/check-dev-domain.sh
   ```
   Share the output - it tells us exactly what's wrong

2. **Check the detailed guide:**
   ```bash
   cat docs/dev-domain-setup.md
   ```

3. **Verify step by step:**
   - Can you access `http://localhost:3000`? (Step 5, Method 1)
   - Can you access `http://192.168.2.42:3000`? (Step 5, Method 2)
   - What's your actual LAN IP? (Step 1)
   - What does `nslookup dev.detidex.yeuthich.net` show?

---

## Reference: vite.config.ts Configuration

Current Vite is correctly configured to listen on all interfaces:

```typescript
server: {
  port: 3000,                    // Port 3000
  host: '0.0.0.0',              // ALL interfaces (localhost, LAN IP, domain)
  allowedHosts: ['dev.detidex.yeuthich.net'],
}
```

✓ This is correct - no changes needed here.

The issue is **always DNS or firewall**, never Vite configuration.

---

## Next: After Access is Working

1. **Add mkcert root CA** (one-time):
   ```bash
   mkcert -install
   ```

2. **Generate HTTPS certs:**
   ```bash
   npm run dev:domain
   ```

3. **Open browser** to `https://dev.detidex.yeuthich.net:3000`

4. **Accept self-signed cert warning** (expected for local dev)

5. **Enjoy HTTPS + HMR + reCAPTCHA compatibility!**

---

**Last updated:** Jan 2, 2026
**For issues:** See `docs/dev-domain-setup.md` or run `bash ./scripts/check-dev-domain.sh`

# Quick Setup: Dev Domain Mapping

## Problem
`http://dev.detidex.yeuthich.net:3000` → `ERR_CONNECTION_REFUSED`  
`http://192.168.2.42:3000` → ✓ Works

**Fix:** Add domain to `/etc/hosts` pointing to your local IP.

---

## Setup (3 Commands)

### 1. Edit /etc/hosts
```bash
sudo nano /etc/hosts
```

Add this line at the end:
```
192.168.2.42 dev.detidex.yeuthich.net
```

**Save:** `Ctrl+X` → `Y` → `Enter`

### 2. Flush DNS Cache
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### 3. Verify
```bash
bash ./scripts/verify-dev-domain.sh
```

Should show all ✓ PASS

---

## Test URLs
- ✓ `http://localhost:3000`
- ✓ `http://192.168.2.42:3000`
- ✓ `http://dev.detidex.yeuthich.net:3000` (after setup)
- ✓ `https://dev.detidex.yeuthich.net:3000` (with `npm run dev:domain`)

---

## If Still Not Working

1. Check `/etc/hosts` entry:
   ```bash
   grep dev.detidex /etc/hosts
   ```
   Should show: `192.168.2.42 dev.detidex.yeuthich.net`

2. Verify DNS resolution:
   ```bash
   dig +short dev.detidex.yeuthich.net
   ```
   Should show: `192.168.2.42`

3. Verify dev server is running:
   ```bash
   npm run dev
   ```

4. Run verification again:
   ```bash
   bash ./scripts/verify-dev-domain.sh
   ```

---

## Reference
- Full guide: `docs/dev-domain.md`
- Verification tool: `scripts/verify-dev-domain.sh`

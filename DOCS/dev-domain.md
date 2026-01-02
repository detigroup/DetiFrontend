# Local HTTPS Development with Dev Domain

This guide shows how to set up local HTTPS development at `https://dev.detidex.yeuthich.net:3000` using mkcert.

## Why HTTPS?

- **reCAPTCHA v2** requires a proper domain (localhost fails)
- **Cookie security** works better with HTTPS in local dev
- **Production parity** - test with same protocol as production

## Prerequisites

- macOS with `brew` installed
- Node.js 18+ (already installed)

## Setup Steps

### 1. Install mkcert (One-time)

```bash
brew install mkcert nss
```

### 2. Add Domain to /etc/hosts

Edit your hosts file:

```bash
sudo nano /etc/hosts
```

Add this line:

```
127.0.0.1 dev.detidex.yeuthich.net
```

Save (Ctrl+X, Y, Enter in nano).

### 3. Flush DNS Cache

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### 4. Generate Certificates

Run the certificate generation script:

```bash
npm run dev:domain
```

This will:
- Install the mkcert root CA (may prompt for password)
- Create `.cert/` directory
- Generate certificates for `dev.detidex.yeuthich.net`
- Display next steps

### 5. Start Development Server

```bash
npm run dev:domain
```

Output should show:
```
✜  Local:   https://dev.detidex.yeuthich.net:3000/
```

### 6. Open in Browser

Open **https://dev.detidex.yeuthich.net:3000** in your browser.

**Note**: You may see a browser warning on first visit - this is normal for self-signed certs. Click "Advanced" → "Proceed Anyway" or similar (varies by browser).

## Troubleshooting

### Certificate not found
- Make sure you ran `npm run dev:domain` successfully
- Check that `.cert/` directory exists with two files

### Browser warning about cert
- This is expected for local self-signed certs
- The certificate is valid and trusted via mkcert root CA
- Proceed anyway - it's safe for local development

### mkcert not found
- Install with: `brew install mkcert nss`

### DNS still resolves to old IP
- Wait a few seconds after flushing cache
- Try opening in an incognito/private window
- Restart your browser

### Port 3000 already in use
- Kill existing process: `lsof -ti:3000 | xargs kill -9`
- Then run `npm run dev:domain` again

## Environment Configuration

Optional: Set custom API domain in `.env.local`:

```env
VITE_API_DOMAIN=https://detidex.yeuthich.net
VITE_DEBUG=true
```

## Regular Development

For standard `localhost:3000` development (without HTTPS):

```bash
npm run dev
```

## Switching Between Modes

- **HTTPS domain dev**: `npm run dev:domain`
- **HTTP localhost dev**: `npm run dev`
- **Production build**: `npm run build`

## Git Ignore

The `.cert/` directory is automatically in `.gitignore` - certificates are never committed.

## Security Notes

- Certificates are generated locally only via mkcert
- Root CA is installed locally only on your machine
- This setup is for **local development only**
- Production uses proper certificates from a CA

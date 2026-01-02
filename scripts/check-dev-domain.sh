#!/bin/bash

# Diagnostic script for dev.detidex.yeuthich.net connectivity issues
# Checks DNS resolution, port accessibility, and network connectivity

set +e  # Continue on errors

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Dev Domain Connectivity Diagnostic Tool                      ║"
echo "║  Domain: dev.detidex.yeuthich.net:3000                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DOMAIN="dev.detidex.yeuthich.net"
LOCAL_IP=$(ifconfig | grep -E "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
PORT=3000

echo -e "${BLUE}[1/6] DNS Resolution Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check /etc/hosts entry
HOSTS_ENTRY=$(grep -E "dev\.detidex\.yeuthich\.net" /etc/hosts 2>/dev/null)
if [ -n "$HOSTS_ENTRY" ]; then
    echo -e "${GREEN}✓ /etc/hosts entry found:${NC}"
    echo "  $HOSTS_ENTRY"
    DNS_OK=1
else
    echo -e "${RED}✗ No /etc/hosts entry for $DOMAIN${NC}"
    DNS_OK=0
fi

echo ""
echo -e "${BLUE}[2/6] nslookup Resolution${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
NSLOOKUP_RESULT=$(nslookup $DOMAIN 2>&1)
if echo "$NSLOOKUP_RESULT" | grep -q "Address:"; then
    echo -e "${GREEN}✓ nslookup successful:${NC}"
    echo "$NSLOOKUP_RESULT" | grep -A 1 "Name:"
    DNS_OK=1
else
    echo -e "${YELLOW}⚠ nslookup result:${NC}"
    echo "$NSLOOKUP_RESULT"
fi

echo ""
echo -e "${BLUE}[3/6] dig Query${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v dig &> /dev/null; then
    DIG_RESULT=$(dig +short $DOMAIN)
    if [ -n "$DIG_RESULT" ]; then
        echo -e "${GREEN}✓ dig query result:${NC}"
        echo "$DIG_RESULT"
    else
        echo -e "${YELLOW}⚠ dig returned no results${NC}"
    fi
else
    echo -e "${YELLOW}⚠ dig not installed (optional)${NC}"
fi

echo ""
echo -e "${BLUE}[4/6] Port Accessibility Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if port 3000 is listening
if lsof -i :$PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Port $PORT is open/listening${NC}"
    echo "Process using port $PORT:"
    lsof -i :$PORT | grep -v COMMAND
    PORT_OK=1
else
    echo -e "${RED}✗ Port $PORT is NOT listening${NC}"
    echo "  Make sure 'npm run dev' or 'npm run dev:domain' is running"
    PORT_OK=0
fi

echo ""
echo -e "${BLUE}[5/6] HTTP Connectivity Tests${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Testing http://localhost:3000 ..."
if curl -s -m 5 -I http://localhost:3000 | head -1; then
    echo -e "${GREEN}✓ localhost:3000 is accessible${NC}"
else
    echo -e "${RED}✗ localhost:3000 not accessible${NC}"
fi

echo ""
echo "Testing http://${LOCAL_IP}:3000 ..."
if curl -s -m 5 -I http://${LOCAL_IP}:3000 | head -1; then
    echo -e "${GREEN}✓ ${LOCAL_IP}:3000 is accessible (LAN IP)${NC}"
else
    echo -e "${RED}✗ ${LOCAL_IP}:3000 not accessible${NC}"
fi

echo ""
echo -e "${BLUE}[6/6] DNS Resolution Target${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESOLVED_IP=$(nslookup $DOMAIN 2>&1 | grep "Address:" | tail -1 | awk '{print $2}')
if [ -n "$RESOLVED_IP" ]; then
    echo -e "Resolved IP: ${BLUE}${RESOLVED_IP}${NC}"
    
    if [ "$RESOLVED_IP" = "127.0.0.1" ]; then
        echo -e "${YELLOW}⚠ WARNING: DNS resolves to 127.0.0.1 (localhost)${NC}"
        echo "  This is correct for local dev on THIS machine only!"
        echo "  For LAN access from other machines, use IP address directly:"
        echo "  → http://${LOCAL_IP}:3000"
    elif [ "$RESOLVED_IP" = "${LOCAL_IP}" ]; then
        echo -e "${GREEN}✓ DNS resolves to LAN IP (${LOCAL_IP})${NC}"
        echo "  This is correct for both local and LAN access!"
    else
        echo -e "${YELLOW}⚠ DNS resolves to: $RESOLVED_IP${NC}"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  DIAGNOSTIC SUMMARY                                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $DNS_OK -eq 1 ] && [ $PORT_OK -eq 1 ]; then
    echo -e "${GREEN}✓ DNS: OK${NC}"
    echo -e "${GREEN}✓ Port: OK${NC}"
    echo ""
    echo -e "${GREEN}All checks passed! You should be able to access:${NC}"
    echo -e "  • ${GREEN}https://localhost:3000${NC} (from this machine)"
    echo -e "  • ${GREEN}https://${RESOLVED_IP}:3000${NC} (IP address)"
    if [ "$RESOLVED_IP" != "127.0.0.1" ]; then
        echo -e "  • ${GREEN}https://dev.detidex.yeuthich.net:3000${NC} (domain from this machine or LAN)"
    fi
else
    echo -e "${RED}Issues detected:${NC}"
    if [ $DNS_OK -eq 0 ]; then
        echo -e "  ${RED}✗ DNS: NOT OK${NC}"
        echo "    → Check /etc/hosts entry"
        echo "    → Run: echo '127.0.0.1 dev.detidex.yeuthich.net' | sudo tee -a /etc/hosts"
        echo "    → Then flush DNS: sudo dscacheutil -flushcache"
    fi
    if [ $PORT_OK -eq 0 ]; then
        echo -e "  ${RED}✗ Port: NOT OK${NC}"
        echo "    → Start dev server: npm run dev"
        echo "    → Or with domain: npm run dev:domain"
    fi
fi

echo ""
echo "ℹ️  For more info, see: docs/dev-domain-setup.md"
echo ""

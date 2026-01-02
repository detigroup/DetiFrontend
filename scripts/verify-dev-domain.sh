#!/bin/bash

# Verification script for dev.detidex.yeuthich.net domain setup
# Checks DNS resolution and HTTP connectivity

set +e  # Continue on errors

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Dev Domain Verification Script                              ║"
echo "║  Domain: dev.detidex.yeuthich.net                            ║"
echo "║  Expected IP: 192.168.2.42                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

DOMAIN="dev.detidex.yeuthich.net"
EXPECTED_IP="192.168.2.42"
ALL_PASS=1

# Test 1: DNS Resolution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: DNS Resolution"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESOLVED_IP=$(dig +short $DOMAIN 2>/dev/null)

if [ -z "$RESOLVED_IP" ]; then
    echo -e "${RED}✗ FAIL${NC}: DNS query returned no result"
    echo "  Run: sudo nano /etc/hosts"
    echo "  Add: $EXPECTED_IP $DOMAIN"
    echo "  Then: sudo dscacheutil -flushcache"
    ALL_PASS=0
elif [ "$RESOLVED_IP" = "$EXPECTED_IP" ]; then
    echo -e "${GREEN}✓ PASS${NC}: $DOMAIN resolves to $RESOLVED_IP"
else
    echo -e "${RED}✗ FAIL${NC}: $DOMAIN resolves to $RESOLVED_IP (expected $EXPECTED_IP)"
    echo "  Your /etc/hosts entry may be incorrect"
    echo "  Run: grep dev.detidex /etc/hosts"
    echo "  Should show: $EXPECTED_IP $DOMAIN"
    ALL_PASS=0
fi

echo ""

# Test 2: Ping Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Ping Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ping -c 1 -W 2 $DOMAIN &>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}: Host is reachable"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Ping failed (may be due to ICMP firewall rules)"
    echo "  This is often normal - DNS may still work even if ping fails"
fi

echo ""

# Test 3: HTTP Connectivity by IP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: HTTP Connectivity by IP (192.168.2.42:3000)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s -m 3 -I "http://$EXPECTED_IP:3000" | head -1 | grep -q "HTTP"; then
    echo -e "${GREEN}✓ PASS${NC}: Server accessible by IP (http://$EXPECTED_IP:3000)"
else
    echo -e "${RED}✗ FAIL${NC}: Server NOT accessible by IP"
    echo "  Make sure 'npm run dev' is running"
    echo "  Check: lsof -i :3000"
    ALL_PASS=0
fi

echo ""

# Test 4: HTTP Connectivity by Domain
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: HTTP Connectivity by Domain (dev.detidex.yeuthich.net:3000)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s -m 3 -I "http://$DOMAIN:3000" | head -1 | grep -q "HTTP"; then
    echo -e "${GREEN}✓ PASS${NC}: Server accessible by domain (http://$DOMAIN:3000)"
else
    echo -e "${RED}✗ FAIL${NC}: Server NOT accessible by domain name"
    if [ "$RESOLVED_IP" != "$EXPECTED_IP" ]; then
        echo "  Likely cause: DNS not resolving correctly"
        echo "  Run: dig +short $DOMAIN (should show $EXPECTED_IP)"
    else
        echo "  Check if dev server is running: npm run dev"
    fi
    ALL_PASS=0
fi

echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  VERIFICATION SUMMARY                                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $ALL_PASS -eq 1 ] && [ "$RESOLVED_IP" = "$EXPECTED_IP" ]; then
    echo -e "${GREEN}✓✓✓ ALL TESTS PASSED ✓✓✓${NC}"
    echo ""
    echo "You can now access:"
    echo -e "  • ${GREEN}http://localhost:3000${NC}"
    echo -e "  • ${GREEN}http://$EXPECTED_IP:3000${NC}"
    echo -e "  • ${GREEN}http://$DOMAIN:3000${NC}"
    echo -e "  • ${GREEN}https://$DOMAIN:3000${NC} (if using dev:domain)"
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Quick fix:"
    echo "1. Edit /etc/hosts:"
    echo "   sudo nano /etc/hosts"
    echo "   Add: $EXPECTED_IP $DOMAIN"
    echo ""
    echo "2. Flush DNS:"
    echo "   sudo dscacheutil -flushcache"
    echo "   sudo killall -HUP mDNSResponder"
    echo ""
    echo "3. Start dev server:"
    echo "   npm run dev"
    echo ""
    echo "4. Run this script again:"
    echo "   bash ./scripts/verify-dev-domain.sh"
fi

echo ""
echo "For detailed setup: cat docs/dev-domain.md"
echo ""

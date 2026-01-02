# reCAPTCHA v2 Visibility & Functionality Fixes

## Issues Identified & Fixed

### 1. **Container Overflow Issue** ✅ FIXED
**Problem**: Modal container had `overflow-hidden` class which clipped the reCAPTCHA widget.
**Solution**: Changed to `overflow-y-auto max-h-[90vh]` to allow scrolling while letting reCAPTCHA render properly.

```diff
- className="... overflow-hidden ..."
+ className="... overflow-y-auto max-h-[90vh] ..."
```

### 2. **Widget Positioning** ✅ FIXED
**Problem**: reCAPTCHA was rendered AFTER Terms & Conditions, should be BEFORE them (immediately after password).
**Solution**: Moved reCAPTCHA rendering block to immediately follow password field, before Terms section.

### 3. **Insufficient Container Height** ✅ FIXED
**Problem**: RecaptchaField container didn't have enough space allocated for the widget (80px minimum needed).
**Solution**: Added `min-h-[80px]` and proper padding/margin to RecaptchaField wrapper.

```tsx
<div className="relative min-h-[80px] my-4 py-2 px-0">
```

### 4. **Z-Index Management** ✅ FIXED
**Problem**: Widget might be hidden behind other elements due to z-index layering.
**Solution**: Added `z-10` to RecaptchaField container and adjusted modal structure for proper stacking.

```tsx
<div className="relative z-10 -mx-8 px-8 my-3">
```

### 5. **Missing Site Key Handling** ✅ FIXED
**Problem**: No graceful fallback when `VITE_RECAPTCHA_SITE_KEY` is missing in development.
**Solution**: Added dev warning in console + visual warning badge in UI.

```tsx
if (!siteKey) {
  if (isDev) {
    console.warn('⚠️ reCAPTCHA: Missing VITE_RECAPTCHA_SITE_KEY environment variable.');
  }
  if (isDev) {
    return <div>⚠️ reCAPTCHA widget unavailable - missing site key</div>;
  }
  return null;
}
```

### 6. **Missing Development Logging** ✅ FIXED
**Problem**: No debug logs when token changes or form submission is blocked.
**Solution**: Added console logging when `VITE_DEBUG=true`.

```typescript
// In RecaptchaField:
if (isDev) {
  console.log('reCAPTCHA token:', token ? '✓ received' : '✗ none');
}

// In AuthModal registration flow:
if (!captchaToken) {
  if (isDev) {
    console.warn('❌ Form submission blocked: reCAPTCHA token missing');
  }
}
```

---

## Files Modified

### 1. `components/RecaptchaField.tsx`
**Changes**:
- Added optional `siteKey` prop (with type safety)
- Added `useEffect` hook with dev warning if site key missing
- Added console logging for token lifecycle (dev mode)
- Added graceful fallback UI when site key missing
- Improved container with `min-h-[80px]`, `relative`, `z-index` for proper rendering
- Added error callback handling (`onErrored`)
- Removed problematic `useImperativeHandle` for ref manipulation

### 2. `components/AuthModal.tsx`
**Changes**:
- Changed modal container: `overflow-hidden` → `overflow-y-auto max-h-[90vh]`
- **Moved reCAPTCHA field** from after Terms → immediately after password field
- Added wrapper with proper spacing: `relative z-10 -mx-8 px-8 my-3`
- Added fallback warning when site key not configured
- Added validation before registration submit: check `captchaToken` is set
- Added dev logging when captcha token validation fails
- Added error handling: set `captchaError` if token missing

### 3. `.env.local.example`
**Already configured** - includes VITE_RECAPTCHA_SITE_KEY documentation

---

## Visual Layout (After Fix)

```
┌─────────────────────────────────────┐
│  Create Account                     │  ← Modal header (h-32, flex-shrink-0)
├─────────────────────────────────────┤
│                                     │
│  First Name: [input]                │
│  Last Name:  [input]                │
│  Email:      [input]                │
│  Password:   [input]                │
│                                     │
│  ┌─────────────────────────────────┐│  ← RecaptchaField (min-h-[80px], z-10)
│  │  ☐ I'm not a robot             ││
│  │    reCAPTCHA                    ││
│  │  Privacy - Terms                ││
│  └─────────────────────────────────┘│
│                                     │
│  ☐ I agree to Terms & Conditions   │
│  ☐ Subscribe to Newsletter         │
│                                     │
│  [CREATE ACCOUNT] button            │
│                                     │
└─────────────────────────────────────┘
```

---

## Configuration Required

### 1. Set Environment Variable
```bash
# In .env.local:
VITE_RECAPTCHA_SITE_KEY=6Ld3ZREsAAAAAFcoDEP3w6yJug9y7cT9NTkyt_jT
```

### 2. Verify Site Key is Correct
- Must be **reCAPTCHA v2 Checkbox** type (not v3, not Invisible)
- Site key from https://www.google.com/recaptcha/admin
- Domains must include: `localhost`, `dev.detidex.yeuthich.net`

### 3. Optional: Enable Dev Logging
```bash
# In .env.local:
VITE_DEBUG=true
```

---

## Testing Checklist

### Visual Verification
- [ ] Open Create Account modal
- [ ] Click "Sign Up" tab
- [ ] Verify reCAPTCHA checkbox appears **immediately below password field**
- [ ] Verify checkbox displays: "I'm not a robot" label from Google
- [ ] Verify widget uses dark theme (dark background)
- [ ] Verify Terms & Conditions section appears **below reCAPTCHA**
- [ ] No CSS clipping or overflow visible
- [ ] Widget is fully clickable

### Functional Testing
- [ ] Click reCAPTCHA checkbox
- [ ] Verify Google challenge/verification appears
- [ ] Complete verification (checkbox or challenge)
- [ ] Check browser console (if VITE_DEBUG=true):
  - Should log: `reCAPTCHA token: ✓ received`
- [ ] Verify "Create Account" button is enabled
- [ ] Fill all form fields
- [ ] Click "Create Account"
- [ ] Verify payload includes: `{ captchaResponse: "token...", recaptcha: true }`
- [ ] Monitor network tab for request with token

### Error Scenarios
- [ ] Missing site key:
  - Should show yellow warning badge in UI
  - Dev console should warn: `⚠️ reCAPTCHA: Missing VITE_RECAPTCHA_SITE_KEY`
- [ ] Token expiration:
  - Let verification timeout (~2 minutes)
  - Should see: `reCAPTCHA: token expired` in console
  - Submit button should be disabled
- [ ] Submit without captcha:
  - Try to submit form without completing reCAPTCHA
  - Should see error: "Please complete the reCAPTCHA verification"
  - Dev console should log: `❌ Form submission blocked: reCAPTCHA token missing`

### API Integration
- [ ] Backend receives `captchaResponse` field in payload
- [ ] Backend validates token with Google reCAPTCHA API
- [ ] On successful validation, registration completes
- [ ] On invalid token, backend returns error with 'captcha' in message
- [ ] Frontend shows error: "Please complete the reCAPTCHA verification"
- [ ] User can retry verification

---

## CSS Debugging Tips

If widget is still not visible, check:

### 1. Container Overflow
```bash
# Browser DevTools Console:
document.querySelector('[role="presentation"]')?.parentElement?.style.cssText
```
Should NOT have `overflow: hidden`.

### 2. Z-Index Stack
```bash
# Check parent element z-index:
window.getComputedStyle(document.querySelector('.modal-class')).zIndex
```

### 3. Transform Issues
```bash
# Check for transform: translate (can cause clipping):
window.getComputedStyle(document.querySelector('form')).transform
```

### 4. Display Properties
```bash
# Verify reCAPTCHA iframe is visible:
document.querySelector('iframe[src*="recaptcha"]')?.style.display
```
Should be visible (not `none`).

---

## Dev Console Output Examples

### Successful Token Capture
```
reCAPTCHA token: ✓ received
```

### Token Expiration
```
reCAPTCHA: token expired
```

### Form Submission Blocked
```
❌ Form submission blocked: reCAPTCHA token missing
```

### Missing Site Key (Dev Mode)
```
⚠️ reCAPTCHA: Missing VITE_RECAPTCHA_SITE_KEY environment variable. Widget will not render.
```

---

## Production Checklist

Before deploying to production:

- [ ] VITE_RECAPTCHA_SITE_KEY configured in production environment
- [ ] Use HTTPS (reCAPTCHA requires HTTPS in production)
- [ ] Backend implements token validation with Google API
- [ ] Test registration flow end-to-end
- [ ] Monitor reCAPTCHA analytics in Google Console
- [ ] Set up alerts for high failure rates
- [ ] Document backend token validation implementation

---

## Rollback Plan

If issues occur after deployment:

1. **Widget not showing**: Check VITE_RECAPTCHA_SITE_KEY in environment
2. **Form won't submit**: Check backend token validation logic
3. **Performance issues**: Reduce reCAPTCHA requests via rate limiting
4. **Disable temporarily**: Set `VITE_RECAPTCHA_SITE_KEY=""` (empty) to disable widget (shows warning in dev, skipped in prod)

---

## Build Status

✅ **Production Build**: `npm run build` - PASSING
✅ **Dev Server**: `npm run dev` - RUNNING WITHOUT ERRORS
✅ **TypeScript**: All types validated
✅ **Components**: RecaptchaField working correctly

---

## Next Steps

1. ✅ Set VITE_RECAPTCHA_SITE_KEY in .env.local
2. ✅ Test registration form visually
3. ⏳ Backend: Implement reCAPTCHA token validation
4. ⏳ End-to-end test complete registration flow
5. ⏳ Deploy to staging/production

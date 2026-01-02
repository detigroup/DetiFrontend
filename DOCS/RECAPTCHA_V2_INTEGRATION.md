# reCAPTCHA v2 Integration for Create Account Form

## Overview
Google reCAPTCHA v2 (checkbox "I'm not a robot") has been fully integrated into the Create Account registration form. This provides bot protection for user registration while maintaining a smooth user experience.

## Components & Files

### 1. `components/RecaptchaField.tsx` (NEW)
Reusable reCAPTCHA widget wrapper with ref management for external reset.

**Key Features:**
- Wraps `react-google-recaptcha` ReCAPTCHA component
- Dark theme matching form styling
- Ref-based reset functionality for error handling
- Token lifecycle management (solved → expired → null)
- Error message display below widget

**Usage:**
```tsx
<RecaptchaField 
  siteKey={recaptchaSiteKey}
  onToken={setCaptchaToken}
  error={captchaError}
/>
```

### 2. `components/AuthModal.tsx` (UPDATED)
Main authentication modal with login and registration modes.

**Changes:**
- Added `useRef` import for captcha ref management
- Added state: `captchaToken`, `captchaError`, `recaptchaRef`
- Retrieve site key from environment: `VITE_RECAPTCHA_SITE_KEY`
- Insert RecaptchaField component in register mode (after password, before Terms)
- Updated registration payload with `captchaResponse` field
- Updated button disabled logic: `!captchaToken` required for register mode
- Captcha-specific error handling: detects 'captcha'/'recaptcha' in API errors, shows inline error, resets widget, clears token

**Token Flow:**
1. User completes form (first name, email, password, DOB, Terms)
2. User clicks reCAPTCHA checkbox
3. `onToken` callback receives string token → `setCaptchaToken(token)`
4. Submit button enabled (all validators + captchaToken pass)
5. On submit: registration payload includes `captchaResponse: captchaToken, recaptcha: true`
6. If captcha expires: `onToken(null)` called → button disabled
7. If captcha error: error message shown, widget reset, token cleared, button disabled

### 3. `package.json` (UPDATED)
Added dependency: `"react-google-recaptcha": "^3.1.0"`

## Setup Instructions

### 1. Get reCAPTCHA Site Key
1. Visit https://www.google.com/recaptcha/admin
2. Log in with your Google account
3. Create a new site:
   - **Name**: DetiFrontend (or your project name)
   - **reCAPTCHA type**: Select **reCAPTCHA v2**
   - **Verification mode**: "I'm not a robot" Checkbox
   - **Domains**: Add these domains:
     - `localhost`
     - `127.0.0.1`
     - `dev.detidex.yeuthich.net`
     - `detidex.yeuthich.net`
4. Copy your **Site Key** (NOT the Secret Key)

### 2. Configure Environment Variables
Create or update `.env.local` in project root:

```env
# reCAPTCHA v2 Site Key (from Google reCAPTCHA Admin Console)
VITE_RECAPTCHA_SITE_KEY=your_site_key_here

# Other required variables
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_API_DOMAIN=https://detidex.yeuthich.net
```

See `.env.local.example` for complete template.

### 3. Install Dependencies
```bash
npm install
```

The package already includes `react-google-recaptcha@^3.1.0` in `package.json`.

### 4. Test Locally
```bash
npm run dev
```

Then:
1. Open auth modal → Click "Sign Up" → Enter form fields
2. reCAPTCHA checkbox should appear below password field
3. Click the checkbox to complete verification
4. Submit button should enable once captcha is verified
5. Monitor console for token verification

## Backend Integration

### Expected API Payload (POST /api/v1/auth/register/)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securepassword",
  "birth_day": "1990-05-15",
  "country": "US",
  "lang": "en",
  "subscription": true,
  "captchaResponse": "03AFY_a8X7k...",
  "recaptcha": true
}
```

### Backend Validation (Example - Python/Django)
```python
from django.conf import settings
import requests

def validate_recaptcha(token):
    """Verify captcha token with Google"""
    response = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data={
            'secret': settings.RECAPTCHA_SECRET_KEY,
            'response': token
        }
    )
    data = response.json()
    return data.get('success', False) and data.get('score', 0) > 0.5
```

### Backend Validation (Expected Response)
```python
# In your registration endpoint
def register(request):
    captcha_token = request.data.get('captchaResponse')
    
    if not captcha_token:
        return Response(
            {'error': 'reCAPTCHA validation failed - token missing'}, 
            status=400
        )
    
    if not validate_recaptcha(captcha_token):
        return Response(
            {'error': 'reCAPTCHA validation failed - invalid token'}, 
            status=400
        )
    
    # Continue with registration...
```

## Error Handling

### Client-Side Error Handling
Captcha-specific errors are detected in API response:

```typescript
// If API error contains 'captcha' or 'recaptcha':
setCaptchaError(msg);           // Show error below widget
recaptchaRef.current?.reset?.(); // Reset widget
setCaptchaToken(null);          // Clear token, disable button
```

### Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| reCAPTCHA not showing | `VITE_RECAPTCHA_SITE_KEY` not set | Add to `.env.local` and restart dev server |
| "Invalid site key" error | Wrong key (Secret Key used instead of Site Key) | Use **Site Key** from Google Console, not Secret Key |
| Button always disabled | `captchaToken` is null | Ensure widget is loaded and checkpoint completes |
| Widget appears broken | Domain not whitelisted | Add current domain to Google reCAPTCHA Admin Console |
| "Token expired" error | User took too long | Show message, reset widget, let user re-verify |

## Security Notes

1. **Never hardcode site key in code** - Always use environment variables
2. **Backend must validate token** - Frontend token verification is not secure enough
3. **Use https in production** - reCAPTCHA only works on HTTPS (except localhost)
4. **Secret Key is confidential** - Never expose Secret Key in frontend code
5. **Token is single-use** - Each token can only be validated once by backend

## Testing Checklist

- [ ] reCAPTCHA checkbox appears on Create Account form
- [ ] Checkbox is positioned below password field
- [ ] Widget is dark-themed to match form
- [ ] Click checkbox → "I'm not a robot" verification works
- [ ] Token is captured after checkbox verification
- [ ] Submit button is disabled until captcha verified
- [ ] Submit button enabled after all validators + captcha pass
- [ ] Registration payload includes `captchaResponse` field
- [ ] API successfully receives and validates token
- [ ] Captcha error shows inline error message
- [ ] Widget resets after error
- [ ] Token expiration detected and button disabled

## File Summary

| File | Status | Description |
|------|--------|-------------|
| `components/RecaptchaField.tsx` | ✅ NEW | Reusable captcha widget wrapper |
| `components/AuthModal.tsx` | ✅ UPDATED | Integrated captcha into registration form |
| `components/DobDatePicker.tsx` | ✓ Existing | Birth date picker (no changes) |
| `package.json` | ✅ UPDATED | Added react-google-recaptcha ^3.1.0 |
| `.env.local.example` | ✅ NEW | Environment configuration template |
| `types.ts` | ✓ Existing | No changes needed |
| `constants.ts` | ✓ Existing | No changes needed |

## Build Status

✅ **Production Build**: `npm run build` - PASSING
✅ **Type Check**: No TypeScript errors
✅ **Dependencies**: All installed and verified

## Next Steps

1. ✅ Complete reCAPTCHA v2 checkbox integration in Create Account form
2. ✅ Setup environment variables and site key configuration
3. 📋 Backend: Implement token validation endpoint
4. 📋 Backend: Test captcha verification in registration flow
5. 📋 E2E Testing: Full registration flow with captcha verification
6. 📋 Production: Deploy with HTTPS and finalized site key

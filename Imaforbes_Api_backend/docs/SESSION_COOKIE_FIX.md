# Session Cookie Fix for 401 Error

## Problem
Getting `401 Unauthorized` error when trying to use the like button on Hostinger.

## Root Cause
The session cookie settings were hardcoded for localhost development:
- `secure => false` (should be `true` for HTTPS)
- `samesite => 'Lax'` (doesn't work for cross-origin requests)
- `domain => ''` (empty, doesn't work for www <-> non-www)

When the frontend at `https://imaforbes.com` tries to access the API at `https://www.imaforbes.com/api_db`, the session cookies weren't being sent/received properly because:
1. Cross-origin requests require `SameSite=None`
2. `SameSite=None` requires `Secure=true` (HTTPS)
3. Cookies need to be set for `.imaforbes.com` domain to work for both www and non-www

## Solution
Updated `auth/session.php` to:
1. **Detect environment** (production vs development)
2. **Use proper cookie settings for production**:
   - `secure => true` (HTTPS required)
   - `samesite => 'None'` (allows cross-origin)
   - `domain => '.imaforbes.com'` (works for both www and non-www)
3. **Keep localhost settings for development**:
   - `secure => false` (HTTP for localhost)
   - `samesite => 'Lax'` (works for localhost)
   - `domain => ''` (empty for localhost)

## Changes Made

### File: `auth/session.php`

**Before:**
```php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '', // Empty for localhost
    'secure' => false, // HTTP for localhost
    'httponly' => true,
    'samesite' => 'Lax' // Lax works for localhost
]);
```

**After:**
```php
if ($isProduction && $isHttps) {
    // PRODUCTION HTTPS: Use SameSite=None for cross-origin
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '.imaforbes.com', // Allow cookies for both www and non-www
        'secure' => true, // HTTPS required
        'httponly' => true,
        'samesite' => 'None' // Required for cross-origin (www <-> non-www)
    ]);
} else {
    // DEVELOPMENT: Use Lax for localhost
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '', // Empty for localhost
        'secure' => false, // HTTP for localhost
        'httponly' => true,
        'samesite' => 'Lax' // Lax works for localhost
    ]);
}
```

## Deployment Instructions

1. **Upload Updated File**:
   - Upload `auth/session.php` to `public_html/api_db/auth/session.php`

2. **Clear Existing Sessions** (Important!):
   - Users may need to clear their browser cookies or use incognito mode
   - Old session cookies with wrong settings won't work
   - New requests will create new sessions with correct settings

3. **Test**:
   - Visit `https://imaforbes.com` (without www)
   - Open browser console (F12)
   - Click the like button
   - Should work without 401 errors
   - Check Network tab to verify session cookie is being sent

## How It Works

### Production (HTTPS):
- **Domain**: `.imaforbes.com` - Works for both `www.imaforbes.com` and `imaforbes.com`
- **Secure**: `true` - Required for HTTPS
- **SameSite**: `None` - Allows cross-origin requests (www <-> non-www)
- **HttpOnly**: `true` - Prevents JavaScript access (security)

### Development (HTTP):
- **Domain**: `` (empty) - Works for localhost
- **Secure**: `false` - HTTP doesn't require secure flag
- **SameSite**: `Lax` - Works for same-site requests (localhost)
- **HttpOnly**: `true` - Prevents JavaScript access (security)

## Testing Checklist

- [ ] Like button works on `https://imaforbes.com` (without www)
- [ ] Like button works on `https://www.imaforbes.com` (with www)
- [ ] No 401 errors in browser console
- [ ] Session cookie is being sent in requests (check Network tab)
- [ ] CSRF token endpoint returns token successfully
- [ ] Like/unlike actions work correctly

## Troubleshooting

### If 401 errors persist:

1. **Clear Browser Cookies**:
   - Go to browser settings
   - Clear cookies for `imaforbes.com`
   - Try again

2. **Check Session Cookie in Network Tab**:
   - Open Developer Tools → Network tab
   - Click the like button
   - Check the request to `csrf-token.php`
   - Look for `Set-Cookie` header in response
   - Verify cookie has `SameSite=None; Secure`

3. **Check PHP Version**:
   - `session_set_cookie_params()` with array syntax requires PHP 7.3+
   - If using older PHP, may need to use individual parameters

4. **Verify File Upload**:
   - Ensure `auth/session.php` was uploaded correctly
   - Check file permissions (should be 644)

## Important Notes

- **SameSite=None requires Secure=true**: This is a browser security requirement
- **Domain must start with dot**: `.imaforbes.com` allows cookies for both `www.imaforbes.com` and `imaforbes.com`
- **Old cookies won't work**: Users with old session cookies may need to clear cookies
- **HTTPS required**: Production must use HTTPS for `SameSite=None` to work


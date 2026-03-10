# 🔧 CORS Fix for Production

## Problem
The API was returning `http://localhost:5173` in CORS headers when accessed from production domain `https://imaforbes.com`, causing CORS errors.

## Solution
Updated all API endpoints to properly detect production environment and allow both `https://imaforbes.com` and `https://www.imaforbes.com` origins.

## Files Fixed

### Main API Files:
- ✅ `api/settings.php`
- ✅ `api/blog.php`
- ✅ `api/contact.php`
- ✅ `api/messages.php`
- ✅ `api/projects.php`

### Auth API Files:
- ✅ `api/auth/login.php`
- ✅ `api/auth/logout.php`
- ✅ `api/auth/verify.php`
- ✅ `api/auth/csrf-token.php` (already had production detection)

## How It Works

The CORS detection now:

1. **Detects Environment**: Checks if host contains `imaforbes.com` or if HTTPS is enabled and not localhost
2. **Production Mode**: 
   - Allows any origin containing `imaforbes.com` (both www and non-www)
   - Defaults to `https://www.imaforbes.com` if origin not provided
3. **Development Mode**:
   - Allows localhost origins (any port)
   - Defaults to `http://localhost:5173`

## Code Pattern Used

```php
// Get origin and detect environment
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';

// Detect environment: LOCAL or PRODUCTION
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && 
     strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
);

if ($isProduction) {
    // PRODUCTION: Allow imaforbes.com origins (both www and non-www)
    if (!empty($origin) && strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    } else {
        // Default to www version if origin not provided
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    // DEVELOPMENT: Allow localhost origins (any port)
    $corsOrigin = 'http://localhost:5173';
    if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
        $corsOrigin = $origin;
    }
}
```

## Next Steps

1. **Upload fixed files** to Hostinger:
   - Upload all modified API files to `public_html/api_db/api/`
   - Upload auth files to `public_html/api_db/api/auth/`

2. **Test the fix**:
   - Visit `https://imaforbes.com` (without www)
   - Visit `https://www.imaforbes.com` (with www)
   - Both should work without CORS errors

3. **Verify**:
   - Check browser console for CORS errors
   - Test API endpoints directly
   - Test contact form
   - Test blog page
   - Test admin login

## Important Notes

- The fix maintains backward compatibility with local development
- Both `https://imaforbes.com` and `https://www.imaforbes.com` are now supported
- CORS headers are set before any output to prevent issues
- Preflight OPTIONS requests are handled correctly

---

**Status**: ✅ All API endpoints fixed and ready for production deployment


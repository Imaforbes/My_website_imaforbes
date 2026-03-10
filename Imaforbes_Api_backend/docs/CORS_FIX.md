# CORS Fix for Like Button on Hostinger

## Problem
The like button was failing with CORS errors:
```
Access to fetch at 'https://www.imaforbes.com/api_db/api/blog/like.php' 
from origin 'https://imaforbes.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
1. **Origin Mismatch**: The site is accessed at `https://imaforbes.com` (without www), but the backend was only allowing `https://www.imaforbes.com`
2. **Preflight OPTIONS Request**: The OPTIONS preflight request wasn't being handled correctly before any output
3. **Output Buffering**: PHP output buffering was interfering with header setting

## Solution
Updated the following files to fix CORS handling:

### Files Updated:
1. `/api/blog/like.php`
2. `/api/blog/view.php`
3. `/api/auth/csrf-token.php`

### Changes Made:

1. **Improved Origin Detection**:
   - Now checks both `HTTP_ORIGIN` and `HTTP_REFERER` headers
   - Extracts origin from referer if origin header is missing
   - Handles both `https://imaforbes.com` and `https://www.imaforbes.com`

2. **Fixed Output Buffering**:
   - Clears any existing output buffers before setting headers
   - Ensures headers are set before any output

3. **Improved OPTIONS Handling**:
   - OPTIONS requests are handled immediately after CORS headers are set
   - Uses `exit(0)` instead of just `exit` for clarity
   - Returns 200 status code for preflight requests

4. **Enhanced CORS Headers**:
   - Includes `X-CSRF-Token` in allowed headers
   - Sets all headers with `true` flag to replace existing headers
   - Properly handles credentials

## Code Changes

### Before:
```php
ob_start();
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
// ... CORS logic ...
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}
ob_end_clean();
```

### After:
```php
// Turn off output buffering to prevent any output before headers
if (ob_get_level()) {
    ob_end_clean();
}

// Get origin from both ORIGIN and REFERER headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';

// Extract origin from referer if needed
if (empty($origin) && !empty($_SERVER['HTTP_REFERER'])) {
    $parsed = parse_url($_SERVER['HTTP_REFERER']);
    if ($parsed && isset($parsed['scheme']) && isset($parsed['host'])) {
        $origin = $parsed['scheme'] . '://' . $parsed['host'];
    }
}

// ... improved CORS logic that handles both www and non-www ...

// Handle preflight OPTIONS requests - MUST be handled before any other code
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}
```

## Deployment Instructions

1. **Upload Updated Files to Hostinger**:
   - Upload `api/blog/like.php` to `public_html/api_db/api/blog/like.php`
   - Upload `api/blog/view.php` to `public_html/api_db/api/blog/view.php`
   - Upload `api/auth/csrf-token.php` to `public_html/api_db/api/auth/csrf-token.php`

2. **Verify File Permissions**:
   - Files should be `644`
   - Folders should be `755`

3. **Test the Fix**:
   - Visit `https://imaforbes.com` (without www)
   - Open browser console (F12)
   - Click the like button
   - Should see no CORS errors
   - Like button should work correctly

## Testing Checklist

- [ ] Like button works on `https://imaforbes.com` (without www)
- [ ] Like button works on `https://www.imaforbes.com` (with www)
- [ ] No CORS errors in browser console
- [ ] CSRF token endpoint works
- [ ] View tracking endpoint works
- [ ] Like status check works (GET request)
- [ ] Like/unlike action works (POST request)

## Additional Notes

- The fix handles both www and non-www versions of the domain
- CORS headers are set before any output to prevent header issues
- OPTIONS preflight requests are handled immediately
- All API endpoints now use consistent CORS handling

## If Issues Persist

1. **Check Browser Console**: Look for any remaining CORS errors
2. **Check Network Tab**: Verify OPTIONS request returns 200 status
3. **Check Server Logs**: Look for PHP errors in Hostinger error logs
4. **Verify File Upload**: Ensure files were uploaded correctly
5. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R) to clear cached responses


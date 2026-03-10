# 🔧 Like Button Troubleshooting Guide

## Issue: Like Button Not Working on Hostinger

If the like button works locally but not on Hostinger, follow these steps to diagnose and fix the issue.

## 🔍 Step 1: Check Browser Console

1. Open your website on Hostinger: `https://www.imaforbes.com`
2. Open browser Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Click the like button
5. Look for error messages starting with `[Like Button]` or `[API Error]`

### Common Errors:

- **Network Error**: `Failed to fetch` or `Network error`
  - **Cause**: API URL is incorrect or API endpoint is not accessible
  - **Solution**: See Step 2

- **CSRF Token Error**: `Failed to get CSRF token`
  - **Cause**: CSRF token endpoint is not accessible
  - **Solution**: See Step 3

- **CORS Error**: `Access-Control-Allow-Origin` error
  - **Cause**: CORS headers not properly configured
  - **Solution**: See Step 4

## 🔍 Step 2: Verify API URL Configuration

The like button uses the API endpoint: `https://www.imaforbes.com/api_db/api/blog/like.php`

### Check API URL in Console:

1. Open browser console
2. Click the like button
3. Look for log message: `[Like Button] API Base URL: ...`
4. Verify it shows: `https://www.imaforbes.com/api_db`

### If URL is incorrect:

**Option A: Use Environment Variable (Recommended)**

1. Create a `.env` file in the project root (if it doesn't exist)
2. Add this line:
   ```env
   VITE_API_BASE_URL=https://www.imaforbes.com/api_db
   ```
3. Rebuild the project:
   ```bash
   npm run build
   ```
4. Upload the new `dist/` folder to Hostinger

**Option B: Check Build Configuration**

1. Verify `src/config/api.js` has the correct production URL:
   ```javascript
   production: 'https://www.imaforbes.com/api_db'
   ```
2. Rebuild and redeploy

## 🔍 Step 3: Test CSRF Token Endpoint

The like button requires a CSRF token. Test if the endpoint is accessible:

1. Open browser console
2. Run this command:
   ```javascript
   fetch('https://www.imaforbes.com/api_db/api/auth/csrf-token.php', {
     method: 'GET',
     credentials: 'include'
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "csrf_token": "...",
    "expires_in": 3600
  }
}
```

### If it fails:
- Check if the file exists: `public_html/api_db/api/auth/csrf-token.php`
- Check file permissions (should be 644)
- Check server error logs in Hostinger

## 🔍 Step 4: Test Like Endpoint Directly

Test the like endpoint directly:

1. First, get a CSRF token (see Step 3)
2. Then test the like endpoint:
   ```javascript
   fetch('https://www.imaforbes.com/api_db/api/blog/like.php', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': 'YOUR_CSRF_TOKEN_HERE'
     },
     credentials: 'include',
     body: JSON.stringify({ post_id: 1 })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likes_count": 1
  }
}
```

## 🔍 Step 5: Check Backend Files

Verify these files exist on Hostinger:

- ✅ `public_html/api_db/api/blog/like.php`
- ✅ `public_html/api_db/api/auth/csrf-token.php`
- ✅ `public_html/api_db/config/database.php`
- ✅ `public_html/api_db/config/response.php`
- ✅ `public_html/api_db/utils/CsrfProtection.php`

## 🔍 Step 6: Check Database

The like button requires these database tables:

1. **blog_posts** table with `likes_count` column
2. **blog_likes** table

### Verify tables exist:

1. Log into phpMyAdmin on Hostinger
2. Select your database
3. Check if `blog_likes` table exists
4. Check if `blog_posts` has `likes_count` column

### If tables are missing:

Run the migration:
```sql
-- Check migrations/add_blog_likes_views.sql in your backend project
```

## 🔍 Step 7: Check CORS Configuration

The backend should allow requests from `https://www.imaforbes.com`.

Check `api_db/api/blog/like.php` - it should have:
```php
header("Access-Control-Allow-Origin: https://www.imaforbes.com");
header('Access-Control-Allow-Credentials: true');
```

## 🔍 Step 8: Check File Permissions

On Hostinger, verify file permissions:

- Files: `644`
- Folders: `755`
- `api_db/` folder: `755`

## ✅ Quick Fix Checklist

If the like button still doesn't work:

1. [ ] Rebuild the project: `npm run build`
2. [ ] Upload fresh `dist/` folder to `public_html/`
3. [ ] Clear browser cache (Ctrl+Shift+Delete)
4. [ ] Test in incognito/private window
5. [ ] Check browser console for errors
6. [ ] Verify API URL in console logs
7. [ ] Test CSRF token endpoint manually
8. [ ] Test like endpoint manually
9. [ ] Check backend file permissions
10. [ ] Check database tables exist

## 🆘 Still Not Working?

If you've tried all the above:

1. **Check Hostinger Error Logs**:
   - Log into Hostinger hPanel
   - Go to **Advanced** → **Error Log**
   - Look for PHP errors related to `/api_db/api/blog/like.php`

2. **Enable Detailed Logging**:
   - The like button now logs detailed information in production
   - Check browser console for `[Like Button]` messages
   - Share these logs for debugging

3. **Test Network Tab**:
   - Open Developer Tools → **Network** tab
   - Click the like button
   - Look for the request to `like.php`
   - Check the request/response details
   - Look for status codes (should be 200)

## 📝 Recent Changes

The like button has been updated with:
- ✅ Better error handling with user feedback
- ✅ Loading states (button shows "..." while processing)
- ✅ Enhanced error logging for production debugging
- ✅ Support for environment variable API URL override
- ✅ Prevention of duplicate simultaneous requests

## 🔗 Related Files

- Frontend: `src/pages/BlogPage.jsx`
- API Service: `src/services/api.js`
- API Config: `src/config/api.js`
- Backend: `api_db_portfolio/api/blog/like.php`
- CSRF Token: `api_db_portfolio/api/auth/csrf-token.php`


# 🔒 CSRF Protection & Rate Limiting Implementation

## ✅ Features Implemented

### 1. **CSRF Protection** ✅
- Token generation and validation
- Automatic token expiration (1 hour)
- Protection on all state-changing requests (POST, PUT, DELETE, PATCH)
- GET requests excluded (read-only operations)

### 2. **Rate Limiting** ✅
- Login attempts: 5 per 15 minutes
- Contact form: 3 per 10 minutes
- File uploads: 10 per 5 minutes
- IP-based tracking
- Automatic cleanup of old records

## 📍 Files Created

1. **`utils/CsrfProtection.php`** - CSRF token management
2. **`utils/RateLimiter.php`** - Rate limiting utility
3. **`api/auth/csrf-token.php`** - Endpoint to get CSRF token
4. **`storage/rate_limits/`** - Directory for rate limit data

## 🔧 How It Works

### CSRF Protection

1. **Get Token**: Frontend calls `/api/auth/csrf-token.php` to get a token
2. **Include Token**: Send token in `X-CSRF-Token` header or `csrf_token` in request body
3. **Validation**: Backend validates token on state-changing requests
4. **Expiration**: Tokens expire after 1 hour

### Rate Limiting

1. **Track Attempts**: Each IP's attempts are tracked per endpoint
2. **Check Limit**: Before processing, check if limit exceeded
3. **Block if Exceeded**: Return 429 status with `Retry-After` header
4. **Reset on Success**: Successful operations reset the counter

## 📝 Endpoints Protected

### CSRF Protection Applied To:
- ✅ `POST /api/blog.php` - Create blog post
- ✅ `PUT/PATCH /api/blog.php` - Update blog post
- ✅ `DELETE /api/blog.php` - Delete blog post
- ✅ `POST /api/projects.php` - Create project
- ✅ `PUT /api/projects.php` - Update project
- ✅ `DELETE /api/projects.php` - Delete project
- ✅ `PATCH /api/messages.php` - Update message
- ✅ `DELETE /api/messages.php` - Delete message
- ✅ `POST /api/upload/image.php` - Upload image

### Rate Limiting Applied To:
- ✅ `POST /api/auth/login.php` - 5 attempts per 15 minutes
- ✅ `POST /api/contact.php` - 3 submissions per 10 minutes
- ✅ `POST /api/upload/image.php` - 10 uploads per 5 minutes

## 🚀 Frontend Integration

### Getting CSRF Token

```javascript
// Get CSRF token
const response = await fetch('/api_db_portfolio/api/auth/csrf-token.php', {
  credentials: 'include'
});
const data = await response.json();
const csrfToken = data.data.csrf_token;
```

### Sending Requests with CSRF Token

**Option 1: Header (Recommended)**
```javascript
fetch('/api_db_portfolio/api/blog.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify({ title: '...', content: '...' })
});
```

**Option 2: Request Body**
```javascript
fetch('/api_db_portfolio/api/blog.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({ 
    title: '...', 
    content: '...',
    csrf_token: csrfToken
  })
});
```

## ⚙️ Configuration

### CSRF Token Expiration
**File**: `utils/CsrfProtection.php`
- Default: 1 hour (3600 seconds)
- Change: Modify `3600` in `validateToken()` and `getToken()`

### Rate Limits
**File**: `utils/RateLimiter.php` (called in endpoints)

**Login** (5 attempts per 15 minutes):
```php
RateLimiter::requireLimit('login', 5, 900);
```

**Contact Form** (3 per 10 minutes):
```php
RateLimiter::requireLimit('contact', 3, 600);
```

**File Upload** (10 per 5 minutes):
```php
RateLimiter::requireLimit('upload', 10, 300);
```

## 🔍 Testing

### Test CSRF Protection
1. Make a request without CSRF token → Should fail with 403
2. Make a request with invalid token → Should fail with 403
3. Make a request with valid token → Should succeed

### Test Rate Limiting
1. Make 6 login attempts quickly → 6th should fail with 429
2. Wait 15 minutes → Should be able to login again
3. Submit contact form 4 times quickly → 4th should fail with 429

## 📊 Rate Limit Response

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "status": 429,
  "data": {
    "retry_after": 450,
    "reset_at": 1234567890
  }
}
```

HTTP Headers:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 450
```

## 🧹 Cleanup

Rate limit files are automatically cleaned up:
- Files older than 1 hour are deleted
- Run `RateLimiter::cleanup()` periodically (optional)

## ⚠️ Important Notes

1. **CSRF tokens require sessions** - Make sure sessions are enabled
2. **Rate limiting uses file storage** - Ensure `storage/rate_limits/` is writable
3. **IP-based tracking** - Uses hashed IP addresses for privacy
4. **GET requests don't need CSRF** - Only state-changing methods are protected
5. **CORS headers updated** - Added `X-CSRF-Token` to allowed headers

## 🔄 Next Steps for Frontend

1. **Update API service** to fetch CSRF token on app load
2. **Include CSRF token** in all POST/PUT/DELETE requests
3. **Handle 403 errors** (invalid CSRF token) by refreshing token
4. **Handle 429 errors** (rate limit) by showing retry message

## ✅ Security Benefits

- ✅ **CSRF Protection**: Prevents cross-site request forgery attacks
- ✅ **Rate Limiting**: Prevents brute force and DoS attacks
- ✅ **IP Tracking**: Tracks attempts per IP address
- ✅ **Automatic Cleanup**: Prevents storage bloat
- ✅ **Token Expiration**: Tokens expire after 1 hour

## 📝 Summary

Your API now has:
- ✅ CSRF protection on all state-changing endpoints
- ✅ Rate limiting on login, contact form, and file uploads
- ✅ Token endpoint for frontend integration
- ✅ Proper error handling and responses

The frontend needs to be updated to:
1. Fetch CSRF tokens
2. Include tokens in requests
3. Handle 403/429 errors appropriately


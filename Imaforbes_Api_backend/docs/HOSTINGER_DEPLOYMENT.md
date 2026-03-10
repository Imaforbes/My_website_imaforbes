# 🚀 Hostinger Production Deployment Guide

## Files Changed for Production

### ✅ 1. Database Configuration

**File:** `api_db/config/database.php`

- ✅ Updated to use Hostinger database credentials
- ✅ Host: `localhost`
- ✅ Username: `u179926833_imanol`
- ✅ Database: `u179926833_portfolio`

### ✅ 2. API Configuration

**File:** `my-portfolio-react/src/services/api.js`

- ✅ Already configured for production
- ✅ Uses `https://www.imaforbes.com/api_db` in production

### ✅ 3. CORS Configuration

**File:** `api_db/config/response.php`

- ✅ Added your production domain to allowed origins
- ✅ Supports both `https://www.imaforbes.com` and `https://imaforbes.com`

### ✅ 4. Email Configuration

**File:** `api_db/config/email.php`

- ✅ Already configured for Hostinger SMTP
- ✅ Uses `imanol@imaforbes.com` with your password

## 📋 Deployment Checklist

### Step 1: Prepare Files

- [ ] Build React app: `npm run build` (or use `node build-production.js`)
- [ ] Ensure all files are ready in `dist/` folder
- [ ] Ensure `api_db/` folder is ready

### Step 2: Upload to Hostinger

- [ ] Upload `dist/*` files to `public_html/`
- [ ] Upload `api_db/` folder to `public_html/api_db/`
- [ ] Set correct file permissions (755 for folders, 644 for files)

### Step 3: Database Setup

- [ ] Create database in Hostinger control panel
- [ ] Import your `portfolio.sql` file to the database
- [ ] Verify database connection works

### Step 4: Test Production Site

- [ ] Visit `https://www.imaforbes.com`
- [ ] Test contact form submission
- [ ] Test admin login (`/login`)
- [ ] Test admin messages panel (`/admin/mensajes`)
- [ ] **Test blog page (`/blog`)** ⭐ NEW
- [ ] **Test admin blog management (`/admin/blog`)** ⭐ NEW

### Step 5: Email Testing

- [ ] Test contact form sends emails
- [ ] Verify you receive notifications at `imanol@imaforbes.com`
- [ ] Test auto-reply functionality

## 🔧 Important Notes

### Database

- Your local database will be imported to Hostinger
- All existing messages will be preserved
- Admin users will be maintained
- **Blog table (`blog_posts`) will be created** ⭐ NEW
  - If missing, run: `https://www.imaforbes.com/api_db/create_blog_table_now.php`

### Email System

- Uses Hostinger SMTP server
- Sends from `imanol@imaforbes.com`
- Recipients get notifications at `imanol@imaforbes.com`

### Security

- CORS is properly configured
- API endpoints are secured
- Admin authentication is working

## 🐛 Troubleshooting

### If Contact Form Doesn't Work:

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check database connection
4. Verify CORS headers

### If Emails Don't Send:

1. Check Hostinger email settings
2. Verify SMTP credentials
3. Check spam folder
4. Test with simple email first

### If Admin Panel Doesn't Load:

1. Verify database connection
2. Check if admin user exists
3. Clear browser cache
4. Check session configuration

### If Blog Page Shows 500 Error:

1. Check if `blog_posts` table exists in database
2. Run: `https://www.imaforbes.com/api_db/create_blog_table_now.php`
3. Or import: `api_db_portfolio/add_blog_table.sql` via phpMyAdmin
4. Check error logs in Hostinger control panel

## 📞 Support

If you encounter issues:

1. Check Hostinger error logs
2. Verify file permissions
3. Test API endpoints individually
4. Contact Hostinger support if needed

---

**Ready for deployment!** 🎉

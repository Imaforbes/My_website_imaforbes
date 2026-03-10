# 🚀 Complete Hostinger Deployment Guide

## Overview

This guide will help you deploy your portfolio to Hostinger hosting. The project consists of:
- **Frontend**: React app (Vite) → `public_html/`
- **Backend**: PHP API → `public_html/api_db/`
- **Database**: MySQL → Import via phpMyAdmin

---

## 📋 Pre-Deployment Checklist

### 1. Prepare Local Environment

- [ ] All code changes are committed
- [ ] Dependencies are installed (`npm install`)
- [ ] Project builds successfully locally
- [ ] API works correctly in local environment

### 2. Build Production Files

Run the preparation script:

```bash
cd /Applications/MAMP/htdocs/my-portfolio-react
npm run prepare:hostinger
```

Or manually:

```bash
npm run build
```

This creates the `dist/` folder with production-ready files.

### 3. Configure Environment Variables

Create `.env` file in `api_db_portfolio/`:

```bash
cd /Applications/MAMP/htdocs/api_db_portfolio
cp .env.example .env
```

Edit `.env` with your Hostinger credentials:

```env
# Database
DB_HOST=127.0.0.1:3306
DB_PORT=3306
DB_USER=u179926833_imanol
DB_PASS=your_actual_password
DB_NAME=u179926833_portfolio

# Email
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=tls
SMTP_USERNAME=imanol@imaforbes.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=imanol@imaforbes.com
FROM_NAME=IMAFORBES Portfolio
CONTACT_EMAIL=imanol@imaforbes.com
```

---

## 📤 Upload Files to Hostinger

### Method 1: File Manager (Easiest)

1. **Login to Hostinger**
   - Go to https://hpanel.hostinger.com
   - Navigate to **File Manager**

2. **Upload Frontend**
   - Go to `public_html/`
   - Upload files from `dist/` folder:
     - `index.html` → `public_html/index.html`
     - `assets/` folder → `public_html/assets/`
     - `img/` folder → `public_html/img/`
     - `resources/` folder → `public_html/resources/`
   - Upload `.htaccess` from project root → `public_html/.htaccess`

3. **Upload Backend**
   - Create folder `public_html/api_db/` if it doesn't exist
   - Upload from `api_db_portfolio/`:
     - `api/` → `public_html/api_db/api/`
     - `auth/` → `public_html/api_db/auth/`
     - `config/` → `public_html/api_db/config/`
     - `utils/` → `public_html/api_db/utils/`
     - `.env` → `public_html/api_db/.env`
     - Any `.htaccess` files

### Method 2: FTP/SFTP

Use FileZilla or similar:
- Host: `ftp.yourdomain.com` or server IP
- Username: Your Hostinger FTP username
- Password: Your Hostinger FTP password
- Port: 21 (FTP) or 22 (SFTP)

Upload following the same structure as Method 1.

---

## 🗄️ Database Setup

1. **Access phpMyAdmin**
   - Go to Hostinger Control Panel
   - Click **phpMyAdmin**

2. **Create/Select Database**
   - Select database: `u179926833_portfolio`
   - Or create new database if needed

3. **Import Database**
   - Click **Import** tab
   - Choose file: `api_db_portfolio/database_schema.sql`
   - Click **Go**
   - Wait for import to complete

4. **Verify Tables**
   - Check that these tables exist:
     - `messages`
     - `projects`
     - `blog_posts`
     - `admin_users`
     - `settings`

---

## 🔧 File Permissions

Set correct permissions via File Manager or SSH:

**Folders:**
```bash
chmod 755 public_html
chmod 755 public_html/api_db
chmod 755 public_html/api_db/api
chmod 755 public_html/api_db/uploads
```

**Files:**
```bash
chmod 644 public_html/index.html
chmod 644 public_html/.htaccess
chmod 644 public_html/api_db/**/*.php
```

**Writable Folders:**
```bash
chmod 777 public_html/api_db/uploads
chmod 777 public_html/api_db/storage
```

**Secure Files:**
```bash
chmod 600 public_html/api_db/.env
```

---

## ✅ Post-Deployment Testing

### 1. Basic Functionality

- [ ] Visit `https://www.imaforbes.com`
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] All pages are accessible
- [ ] Images load correctly
- [ ] No console errors

### 2. Contact Form

- [ ] Fill out contact form
- [ ] Submit form
- [ ] Receive success message
- [ ] Check email inbox for notification
- [ ] Verify auto-reply email (if enabled)

### 3. Admin Panel

- [ ] Visit `/login`
- [ ] Login with admin credentials
- [ ] Access dashboard
- [ ] View messages
- [ ] Test blog management
- [ ] Test statistics page

### 4. Blog Features

- [ ] Visit `/blog`
- [ ] Blog posts display correctly
- [ ] Can view individual posts
- [ ] Admin can create/edit posts
- [ ] Images upload correctly

### 5. API Endpoints

Test these endpoints directly:
- `https://www.imaforbes.com/api_db/api/projects.php`
- `https://www.imaforbes.com/api_db/api/blog.php`
- `https://www.imaforbes.com/api_db/api/contact.php` (POST)

---

## 🐛 Troubleshooting

### Issue: 404 Errors on Routes

**Solution:**
- Verify `.htaccess` is uploaded to `public_html/`
- Check that mod_rewrite is enabled on Hostinger
- Ensure `.htaccess` has correct RewriteRule

### Issue: API Returns 500 Error

**Solution:**
1. Check `.env` file exists and has correct credentials
2. Verify database connection in `config/database.php`
3. Check Hostinger error logs
4. Verify file permissions

### Issue: CORS Errors

**Solution:**
- Check `config/response.php` has your domain in allowed origins
- Verify API base URL in `src/config/api.js` is correct
- Check browser console for specific CORS error

### Issue: Database Connection Failed

**Solution:**
1. Verify database credentials in `.env`
2. Check database exists in Hostinger
3. Verify database user has correct permissions
4. Test connection via phpMyAdmin

### Issue: Emails Not Sending

**Solution:**
1. Verify SMTP credentials in `.env`
2. Check Hostinger email settings
3. Test SMTP connection
4. Check spam folder
5. Verify `FROM_EMAIL` matches Hostinger email account

### Issue: Images Not Loading

**Solution:**
1. Verify `img/` folder is uploaded
2. Check file paths in code
3. Verify file permissions (644)
4. Check browser console for 404 errors

### Issue: Admin Login Not Working

**Solution:**
1. Verify admin user exists in database
2. Check session configuration
3. Verify CSRF token is working
4. Check browser cookies are enabled
5. Clear browser cache

---

## 🔒 Security Checklist

- [ ] `.env` file has correct permissions (600)
- [ ] Database credentials are secure
- [ ] Email passwords are not exposed
- [ ] `.htaccess` protects sensitive files
- [ ] API endpoints have proper authentication
- [ ] CORS is properly configured
- [ ] File uploads are restricted
- [ ] SQL injection protection is in place

---

## 📊 Monitoring

After deployment, monitor:

1. **Error Logs**
   - Check Hostinger error logs regularly
   - Monitor for PHP errors
   - Check for database connection issues

2. **Performance**
   - Page load times
   - API response times
   - Database query performance

3. **Security**
   - Failed login attempts
   - Unusual API requests
   - File upload attempts

---

## 🔄 Updates and Maintenance

### Updating Frontend

1. Make changes locally
2. Run `npm run build`
3. Upload new `dist/` files to `public_html/`
4. Clear browser cache

### Updating Backend

1. Make changes locally
2. Test thoroughly
3. Upload changed PHP files
4. Test on production

### Database Updates

1. Export local database
2. Import to production (backup first!)
3. Or run SQL migrations manually

---

## 📞 Support Resources

- **Hostinger Support**: https://www.hostinger.com/contact
- **Hostinger Knowledge Base**: https://support.hostinger.com
- **Project Documentation**: Check project README files

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] All files uploaded correctly
- [ ] Database imported successfully
- [ ] `.env` file configured with production credentials
- [ ] File permissions set correctly
- [ ] Website loads without errors
- [ ] Contact form works
- [ ] Admin panel accessible
- [ ] Emails sending correctly
- [ ] All pages functional
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance is acceptable

---

**🎉 Congratulations! Your portfolio is now live on Hostinger!**

For questions or issues, refer to the troubleshooting section or contact support.


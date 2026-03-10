# 🚀 Complete Deployment Guide for Hostinger

## Quick Start (3 Steps)

1. **Build:** `npm run build` or `node deploy.js`
2. **Upload:** Follow `QUICK_DEPLOY.md`
3. **Configure:** Update database and email credentials

## 📚 Documentation Files

All deployment documentation is ready:

| File | Purpose |
|-----|---------|
| **`QUICK_DEPLOY.md`** | ⭐ Start here! Quick step-by-step guide |
| **`DEPLOYMENT_CHECKLIST.md`** | Complete checklist with all steps |
| **`FILES_TO_UPLOAD.md`** | Detailed list of files to upload |
| **`EXCLUDE_FROM_PRODUCTION.md`** | Files NOT to upload |
| **`DEPLOYMENT_README.md`** | Overview and summary |
| **`deploy.js`** | Automated deployment script |

## ✨ What's Included in This Deployment

### New Features:
- ✅ **Blog Feature** - Public blog page and admin management
- ✅ **Full Internationalization** - English and Spanish
- ✅ **Responsive Design** - Mobile-friendly
- ✅ **Performance Optimized** - Fast loading

### Files Ready:
- ✅ React app built and optimized
- ✅ PHP API with blog endpoint
- ✅ Database schema with blog table
- ✅ Production `.htaccess` configured
- ✅ CORS properly configured
- ✅ Security headers set

## 🔧 Pre-Deployment Checklist

- [x] Blog feature implemented
- [x] Translations updated
- [x] API endpoints tested
- [x] Database schema updated
- [x] Build scripts ready
- [x] Documentation complete

## 📦 What to Upload

### Frontend:
- `dist/` folder contents → `public_html/`
- `.htaccess` → `public_html/.htaccess`

### Backend:
- `api_db_portfolio/` → `public_html/api_db/`

### Database:
- `database_schema.sql` → Import via phpMyAdmin

## ⚙️ Configuration Required

### 1. Database (`api_db/config/database.php`)
```php
$this->host = 'localhost';
$this->username = 'u179926833_imanol';
$this->password = 'your_password';
$this->database = 'u179926833_portfolio';
```

### 2. Email (`api_db/config/email.php`)
```php
const SMTP_HOST = 'smtp.hostinger.com';
const SMTP_USER = 'imanol@imaforbes.com';
const SMTP_PASS = 'your_email_password';
```

## 🧪 Testing After Deployment

Test these pages:
- ✅ Homepage
- ✅ About
- ✅ Projects
- ✅ **Blog** ⭐ NEW
- ✅ Contact
- ✅ Admin Login
- ✅ Admin Dashboard
- ✅ **Admin Blog** ⭐ NEW
- ✅ Admin Messages
- ✅ Admin Statistics

## 🐛 Troubleshooting

### Blog Page 500 Error?
Run: `https://www.imaforbes.com/api_db/create_blog_table_now.php`

### CORS Errors?
Check: `api_db/config/response.php` has correct origins

### Routes Not Working?
Verify: `.htaccess` is in `public_html/` root

### Database Connection Failed?
Check: `api_db/config/database.php` credentials

## 📞 Need Help?

1. Check `QUICK_DEPLOY.md` for step-by-step instructions
2. Check `DEPLOYMENT_CHECKLIST.md` for complete checklist
3. Check `HOSTINGER_DEPLOYMENT.md` in `api_db_portfolio/` for backend details

---

## 🎯 Deployment Command

```bash
# Build and prepare for deployment
npm run build

# OR use the automated script
node deploy.js
```

Then follow `QUICK_DEPLOY.md` for upload instructions.

---

**Ready to deploy!** 🎉

Your portfolio with blog feature is ready for Hostinger!


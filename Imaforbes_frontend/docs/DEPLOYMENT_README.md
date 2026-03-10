# 🚀 Deployment to Hostinger - Complete Guide

## Quick Start

1. **Build the application:**
   ```bash
   npm run build
   # OR
   node deploy.js
   ```

2. **Follow the upload instructions in:**
   - `QUICK_DEPLOY.md` - Quick step-by-step guide
   - `FILES_TO_UPLOAD.md` - Detailed file list
   - `DEPLOYMENT_CHECKLIST.md` - Complete checklist

## What's New in This Version

### ✨ Blog Feature
- Public blog page at `/blog`
- Admin blog management at `/admin/blog`
- Create, edit, delete poems and letters
- Filter by type (Poems/Letters)
- Full internationalization support
- Responsive design matching site theme

### 🧹 Code Cleanup
- Removed all test/debug files
- Cleaned up unused examples
- Optimized build process

## Deployment Files

All deployment documentation is in the root folder:

- **`QUICK_DEPLOY.md`** - Fast deployment guide (start here!)
- **`DEPLOYMENT_CHECKLIST.md`** - Complete checklist with all steps
- **`FILES_TO_UPLOAD.md`** - Detailed list of files to upload
- **`deploy.js`** - Automated deployment script

## Backend Documentation

Backend deployment info is in `api_db_portfolio/`:

- **`HOSTINGER_DEPLOYMENT.md`** - Backend deployment guide
- **`database_schema.sql`** - Full database schema (includes blog table)
- **`add_blog_table.sql`** - Blog table only (if needed)

## Key Steps Summary

1. ✅ Build React app → `npm run build`
2. ✅ Upload frontend files → `dist/` to `public_html/`
3. ✅ Upload backend files → `api_db_portfolio/` to `public_html/api_db/`
4. ✅ Update database credentials → `api_db/config/database.php`
5. ✅ Update email settings → `api_db/config/email.php`
6. ✅ Import database → `database_schema.sql`
7. ✅ Set file permissions
8. ✅ Test everything!

## Important Notes

- **Blog table:** If you get a 500 error on `/blog`, run:
  `https://www.imaforbes.com/api_db/create_blog_table_now.php`

- **File permissions:** Make sure `api_db/uploads/` is writable (chmod 777)

- **Configuration:** Don't forget to update database and email credentials!

## Need Help?

Check the detailed guides:
- `QUICK_DEPLOY.md` for step-by-step instructions
- `DEPLOYMENT_CHECKLIST.md` for complete checklist
- `HOSTINGER_DEPLOYMENT.md` in api_db_portfolio for backend details

---

**Ready to deploy!** 🎉


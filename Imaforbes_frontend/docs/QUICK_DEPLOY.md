# ⚡ Quick Deployment to Hostinger

## One-Command Preparation

```bash
npm run prepare:hostinger
```

This will:
- ✅ Build your React app for production
- ✅ Validate all required files
- ✅ Create deployment checklist
- ✅ Generate upload instructions

## Quick Upload Steps

### 1. Build (if not done)
```bash
npm run build
```

### 2. Create API .env File
```bash
cd ../api_db_portfolio
cp .env.example .env
# Edit .env with your Hostinger credentials
```

### 3. Upload Files

**Frontend → `public_html/`:**
- `dist/index.html`
- `dist/assets/`
- `dist/img/`
- `dist/resources/`
- `.htaccess`

**Backend → `public_html/api_db/`:**
- `api_db_portfolio/api/`
- `api_db_portfolio/auth/`
- `api_db_portfolio/config/`
- `api_db_portfolio/utils/`
- `api_db_portfolio/.env`

### 4. Import Database
- phpMyAdmin → Import → `database_schema.sql`

### 5. Set Permissions
- Folders: 755
- Files: 644
- `api_db/uploads/`: 777

### 6. Test
- Visit: `https://www.imaforbes.com`
- Test contact form
- Test admin login

## Files You Need

✅ `dist/` folder (from `npm run build`)
✅ `api_db_portfolio/` folder
✅ `.htaccess` file
✅ `database_schema.sql` file
✅ `.env` file (with Hostinger credentials)

## Important URLs

- **Website**: https://www.imaforbes.com
- **Admin Login**: https://www.imaforbes.com/login
- **API Base**: https://www.imaforbes.com/api_db

## Need More Details?

See `HOSTINGER_DEPLOYMENT_GUIDE.md` for complete instructions.

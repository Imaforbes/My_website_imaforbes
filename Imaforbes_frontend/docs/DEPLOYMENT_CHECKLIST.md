# ✅ Hostinger Deployment Checklist

## Pre-Deployment Checklist

### Frontend (React App)
- [x] Build completed successfully
- [x] dist/ folder contains all files
- [x] .htaccess file is present
- [ ] Verify API base URL in src/config/api.js is set to production URL

### Backend (PHP API)
- [ ] Create .env file in api_db_portfolio/ with Hostinger credentials
- [ ] Verify database.php uses .env for production
- [ ] Verify email.php uses .env for production
- [ ] Test database connection locally (if possible)

### Files to Upload

#### Frontend → public_html/
- [ ] dist/index.html → public_html/index.html
- [ ] dist/assets/ → public_html/assets/
- [ ] dist/img/ → public_html/img/
- [ ] dist/resources/ → public_html/resources/
- [ ] .htaccess → public_html/.htaccess

#### Backend → public_html/api_db/
- [ ] api_db_portfolio/api/ → public_html/api_db/api/
- [ ] api_db_portfolio/auth/ → public_html/api_db/auth/
- [ ] api_db_portfolio/config/ → public_html/api_db/config/
- [ ] api_db_portfolio/utils/ → public_html/api_db/utils/
- [ ] api_db_portfolio/.env → public_html/api_db/.env (with production credentials)
- [ ] api_db_portfolio/.htaccess → public_html/api_db/.htaccess (if exists)

### Database Setup
- [ ] Create database in Hostinger control panel
- [ ] Import database_schema.sql via phpMyAdmin
- [ ] Verify database connection works

### Post-Deployment Testing
- [ ] Visit https://www.imaforbes.com
- [ ] Test homepage loads correctly
- [ ] Test contact form submission
- [ ] Test admin login (/login)
- [ ] Test admin messages panel
- [ ] Test blog page (/blog)
- [ ] Test admin blog management
- [ ] Verify email notifications work
- [ ] Check browser console for errors
- [ ] Test on mobile devices

### File Permissions (via Hostinger File Manager or SSH)
- [ ] Set folders to 755
- [ ] Set files to 644
- [ ] Set uploads/ folder to 777 (writable)

## Important Notes

1. **API URL**: Make sure src/config/api.js has production URL: https://www.imaforbes.com/api_db
2. **Environment Variables**: Create .env file in api_db_portfolio/ with Hostinger credentials
3. **Database**: Import database_schema.sql to create all tables
4. **Email**: Configure SMTP settings in .env file
5. **CORS**: Already configured in config/response.php

## Troubleshooting

If you encounter issues:
1. Check Hostinger error logs
2. Verify file permissions
3. Test API endpoints individually
4. Check browser console for errors
5. Verify .env file is uploaded and has correct credentials

---

Generated: 2025-11-07T17:00:41.243Z

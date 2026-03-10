# 📤 Hostinger Upload Instructions

## Quick Upload Guide

### Method 1: Using Hostinger File Manager (Recommended)

1. **Login to Hostinger Control Panel**
   - Go to https://hpanel.hostinger.com
   - Navigate to File Manager

2. **Upload Frontend Files**
   - Navigate to `public_html/`
   - Upload all files from `dist/` folder:
     - `dist/index.html` → `public_html/index.html`
     - `dist/assets/` → `public_html/assets/`
     - `dist/img/` → `public_html/img/`
     - `dist/resources/` → `public_html/resources/`
   - Upload `.htaccess` from project root → `public_html/.htaccess`

3. **Upload Backend Files**
   - Create folder `public_html/api_db/` if it doesn't exist
   - Upload entire `api_db_portfolio/` folder contents:
     - `api/` → `public_html/api_db/api/`
     - `auth/` → `public_html/api_db/auth/`
     - `config/` → `public_html/api_db/config/`
     - `utils/` → `public_html/api_db/utils/`
     - `.env` → `public_html/api_db/.env` (create with production credentials)
     - `.htaccess` → `public_html/api_db/.htaccess` (if exists)

4. **Set File Permissions**
   - Folders: 755
   - Files: 644
   - `api_db/uploads/`: 777 (writable)

### Method 2: Using FTP/SFTP

1. **Connect to Hostinger via FTP**
   - Host: ftp.yourdomain.com or your server IP
   - Username: Your Hostinger FTP username
   - Password: Your Hostinger FTP password
   - Port: 21 (FTP) or 22 (SFTP)

2. **Upload Files**
   - Use FileZilla or similar FTP client
   - Upload files following the same structure as Method 1

### Method 3: Using SSH (Advanced)

```bash
# Connect via SSH
ssh username@your-server-ip

# Navigate to public_html
cd public_html

# Upload files using scp (from your local machine)
scp -r dist/* username@your-server-ip:~/public_html/
scp -r api_db_portfolio/* username@your-server-ip:~/public_html/api_db/
```

## Database Import

1. **Access phpMyAdmin**
   - Go to Hostinger Control Panel
   - Click on phpMyAdmin

2. **Import Database**
   - Select your database (e.g., u179926833_portfolio)
   - Click "Import" tab
   - Choose file: `database_schema.sql`
   - Click "Go"

## Environment Configuration

1. **Create .env file**
   - Copy `.env.example` to `.env`
   - Fill in your Hostinger credentials:
     - Database host, user, password, name
     - SMTP settings
     - Email configuration

2. **Upload .env file**
   - Upload to `public_html/api_db/.env`
   - Set permissions to 600 (readable only by owner)

## Verification Steps

After upload, verify:
1. Files are in correct locations
2. File permissions are set correctly
3. .env file has production credentials
4. Database is imported
5. Test the website

---

**Need Help?**
- Check DEPLOYMENT_CHECKLIST.md for detailed checklist
- Review HOSTINGER_DEPLOYMENT.md for troubleshooting

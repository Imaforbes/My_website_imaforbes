# 📦 Files to Upload to Hostinger

## Frontend Files (React App)

### Upload to: `public_html/`

#### Root Level Files:
```
my-portfolio-react/
├── .htaccess                    → public_html/.htaccess
└── dist/
    └── index.html              → public_html/index.html
```

#### From `dist/` folder:
```
dist/
├── assets/                     → public_html/assets/
│   ├── *.js
│   └── *.css
├── img/                        → public_html/img/
│   ├── baner.jpg
│   ├── icono.jpg
│   ├── *.JPG
│   └── *.png
└── resources/                  → public_html/resources/
    └── CvIng_Imanol Perez Arteaga.pdf
```

**Note:** If you used `npm run build`, the `dist/` folder contains everything. Upload:
- `dist/index.html` → `public_html/index.html`
- `dist/assets/` → `public_html/assets/`
- `dist/img/` → `public_html/img/`
- `dist/resources/` → `public_html/resources/`

## Backend Files (PHP API)

### Upload to: `public_html/api_db/`

Upload **entire contents** of `api_db_portfolio/` folder:

```
api_db_portfolio/
├── api/                        → public_html/api_db/api/
│   ├── admin/
│   │   └── stats.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── verify.php
│   ├── blog.php               ⭐ NEW
│   ├── contact.php
│   ├── messages.php
│   ├── projects.php
│   ├── settings.php
│   └── upload/
│       ├── document.php
│       └── image.php
├── auth/                       → public_html/api_db/auth/
│   └── session.php
├── config/                     → public_html/api_db/config/
│   ├── database.php           ⚠️ UPDATE CREDENTIALS
│   ├── email.php              ⚠️ UPDATE CREDENTIALS
│   └── response.php
├── utils/                      → public_html/api_db/utils/
│   └── EmailSender.php
├── database_schema.sql         → Import to database
├── add_blog_table.sql          → Import if blog table missing
├── setup.php                   → Optional (for fresh install)
└── create_blog_table_now.php   → Run if blog table missing
```

## Important Configuration Files

### ⚠️ Must Update Before/After Upload:

1. **`public_html/api_db/config/database.php`**
   - Update with Hostinger database credentials
   - Host: `localhost`
   - Username: `u179926833_imanol`
   - Database: `u179926833_portfolio`

2. **`public_html/api_db/config/email.php`**
   - Update with Hostinger SMTP settings
   - SMTP Host: `smtp.hostinger.com`
   - Email: `imanol@imaforbes.com`

## Database Files

### Import to Database via phpMyAdmin:

1. **`database_schema.sql`** (Full database schema)
   - Creates all tables including `blog_posts` ⭐ NEW

2. **`add_blog_table.sql`** (Only if blog table missing)
   - Creates just the `blog_posts` table

## File Permissions

After upload, set permissions:

```bash
# Folders
chmod 755 public_html/api_db
chmod 755 public_html/api_db/api
chmod 755 public_html/api_db/config
chmod 755 public_html/api_db/uploads

# Files
chmod 644 public_html/api_db/**/*.php
chmod 644 public_html/.htaccess
chmod 644 public_html/index.html

# Uploads folder (must be writable)
chmod 777 public_html/api_db/uploads
```

## Quick Upload Checklist

- [ ] `.htaccess` → `public_html/.htaccess`
- [ ] `dist/index.html` → `public_html/index.html`
- [ ] `dist/assets/` → `public_html/assets/`
- [ ] `dist/img/` → `public_html/img/`
- [ ] `dist/resources/` → `public_html/resources/`
- [ ] `api_db_portfolio/` → `public_html/api_db/`
- [ ] Update `api_db/config/database.php` with Hostinger credentials
- [ ] Update `api_db/config/email.php` with Hostinger SMTP
- [ ] Import `database_schema.sql` to database
- [ ] Set file permissions
- [ ] Test the site!

---

**Total Upload Size:** ~5-10 MB (depending on images)

**Upload Time:** ~5-10 minutes (depending on connection)


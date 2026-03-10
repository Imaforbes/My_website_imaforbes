# 🚫 Files to EXCLUDE from Production Upload

## ⚠️ Do NOT Upload These Files to Hostinger

### Backend (api_db_portfolio/)

#### Test & Debug Files:
```
test_*.php              # All test files
debug_*.php             # All debug files
check_*.php             # Check scripts
simple_*.php            # Simple test scripts
minimal_*.php           # Minimal test scripts
complete_*.php          # Complete test scripts
fix_*.php               # Fix scripts
```

**Examples:**
- `test_api.php`
- `test_contact.php`
- `test_login.php`
- `debug_contact.php`
- `debug_messages.php`
- `check_database.php`
- `simple_test.php`
- `login_debug.php`
- `test_react_connection.php`
- `test_auth_flow.php`
- `test_messages_api.php`
- etc.

#### Development Files:
```
*.example.php           # Example files (keep for reference, don't upload)
.env*                   # Environment files
*.log                   # Log files
*.bak                   # Backup files
*.backup                # Backup files
```

#### Sensitive Files (Update with production values):
```
config/database.php     # ⚠️ UPDATE with Hostinger credentials before upload
config/email.php        # ⚠️ UPDATE with Hostinger SMTP before upload
```

### Frontend (my-portfolio-react/)

#### Development Files:
```
node_modules/           # Dependencies (not needed, already built)
src/                    # Source files (not needed, already built)
.env*                   # Environment files
*.log                   # Log files
*.bak                   # Backup files
.git/                   # Git repository
.vscode/                # IDE settings
.idea/                  # IDE settings
```

#### Build Files (Only upload dist/):
```
dist/                   # ✅ Upload this!
index.html              # ✅ Upload this (from dist/)
.htaccess               # ✅ Upload this!
```

**Note:** After `npm run build`, only upload:
- Contents of `dist/` folder
- `.htaccess` file
- NOT the `src/` folder or `node_modules/`

## ✅ Files to Upload

### Backend:
- `api/` folder (all endpoints)
- `config/` folder (with updated credentials)
- `auth/` folder
- `utils/` folder
- `database_schema.sql` (for import)
- `setup.php` (optional)
- `create_blog_table_now.php` (if needed)

### Frontend:
- `dist/index.html`
- `dist/assets/`
- `dist/img/`
- `dist/resources/`
- `.htaccess`

## 📋 Quick Checklist

Before uploading, verify:
- [ ] No `test_*.php` files
- [ ] No `debug_*.php` files
- [ ] No `.env` files
- [ ] No `*.log` files
- [ ] No `node_modules/` folder
- [ ] No `src/` folder (frontend)
- [ ] `config/database.php` has Hostinger credentials
- [ ] `config/email.php` has Hostinger SMTP settings

---

**Remember:** Only upload production-ready files. Test and debug files are for development only!


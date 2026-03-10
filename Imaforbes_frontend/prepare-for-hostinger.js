#!/usr/bin/env node

/**
 * Hostinger Deployment Preparation Script
 * 
 * This script prepares your project for deployment to Hostinger:
 * 1. Builds the React app for production
 * 2. Validates configuration files
 * 3. Creates deployment checklist
 * 4. Prepares file structure for upload
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = __dirname;
const DIST_DIR = join(PROJECT_ROOT, 'dist');
const API_DIR = join(PROJECT_ROOT, '../api_db_portfolio');

console.log('🚀 Preparing project for Hostinger deployment...\n');

// Step 1: Build React app
console.log('📦 Step 1: Building React app for production...');
try {
    execSync('npm run build', { 
        stdio: 'inherit',
        cwd: PROJECT_ROOT 
    });
    console.log('✅ Build completed successfully!\n');
} catch (error) {
    console.error('❌ Build failed! Please fix errors and try again.');
    process.exit(1);
}

// Step 2: Validate build output
console.log('🔍 Step 2: Validating build output...');
const requiredFiles = [
    'dist/index.html',
    'dist/assets',
    '.htaccess'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = join(PROJECT_ROOT, file);
    if (existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING!`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.error('\n❌ Some required files are missing. Please check the build output.');
    process.exit(1);
}

// Step 3: Check API configuration
console.log('\n🔍 Step 3: Checking API configuration...');
const apiConfigPath = join(API_DIR, 'config', 'database.php');
const apiEmailPath = join(API_DIR, 'config', 'email.php');
const envExamplePath = join(API_DIR, '.env.example');

if (existsSync(apiConfigPath)) {
    console.log('  ✅ API database config exists');
} else {
    console.log('  ⚠️  API database config not found');
}

if (existsSync(apiEmailPath)) {
    console.log('  ✅ API email config exists');
} else {
    console.log('  ⚠️  API email config not found');
}

if (existsSync(envExamplePath)) {
    console.log('  ✅ .env.example exists');
} else {
    console.log('  ⚠️  .env.example not found');
}

// Step 4: Create deployment checklist
console.log('\n📋 Step 4: Creating deployment checklist...');
const checklist = `# ✅ Hostinger Deployment Checklist

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

Generated: ${new Date().toISOString()}
`;

writeFileSync(join(PROJECT_ROOT, 'DEPLOYMENT_CHECKLIST.md'), checklist);
console.log('  ✅ Created DEPLOYMENT_CHECKLIST.md');

// Step 5: Create upload instructions
console.log('\n📝 Step 5: Creating upload instructions...');
const uploadInstructions = `# 📤 Hostinger Upload Instructions

## Quick Upload Guide

### Method 1: Using Hostinger File Manager (Recommended)

1. **Login to Hostinger Control Panel**
   - Go to https://hpanel.hostinger.com
   - Navigate to File Manager

2. **Upload Frontend Files**
   - Navigate to \`public_html/\`
   - Upload all files from \`dist/\` folder:
     - \`dist/index.html\` → \`public_html/index.html\`
     - \`dist/assets/\` → \`public_html/assets/\`
     - \`dist/img/\` → \`public_html/img/\`
     - \`dist/resources/\` → \`public_html/resources/\`
   - Upload \`.htaccess\` from project root → \`public_html/.htaccess\`

3. **Upload Backend Files**
   - Create folder \`public_html/api_db/\` if it doesn't exist
   - Upload entire \`api_db_portfolio/\` folder contents:
     - \`api/\` → \`public_html/api_db/api/\`
     - \`auth/\` → \`public_html/api_db/auth/\`
     - \`config/\` → \`public_html/api_db/config/\`
     - \`utils/\` → \`public_html/api_db/utils/\`
     - \`.env\` → \`public_html/api_db/.env\` (create with production credentials)
     - \`.htaccess\` → \`public_html/api_db/.htaccess\` (if exists)

4. **Set File Permissions**
   - Folders: 755
   - Files: 644
   - \`api_db/uploads/\`: 777 (writable)

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

\`\`\`bash
# Connect via SSH
ssh username@your-server-ip

# Navigate to public_html
cd public_html

# Upload files using scp (from your local machine)
scp -r dist/* username@your-server-ip:~/public_html/
scp -r api_db_portfolio/* username@your-server-ip:~/public_html/api_db/
\`\`\`

## Database Import

1. **Access phpMyAdmin**
   - Go to Hostinger Control Panel
   - Click on phpMyAdmin

2. **Import Database**
   - Select your database (e.g., u179926833_portfolio)
   - Click "Import" tab
   - Choose file: \`database_schema.sql\`
   - Click "Go"

## Environment Configuration

1. **Create .env file**
   - Copy \`.env.example\` to \`.env\`
   - Fill in your Hostinger credentials:
     - Database host, user, password, name
     - SMTP settings
     - Email configuration

2. **Upload .env file**
   - Upload to \`public_html/api_db/.env\`
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
`;

writeFileSync(join(PROJECT_ROOT, 'UPLOAD_INSTRUCTIONS.md'), uploadInstructions);
console.log('  ✅ Created UPLOAD_INSTRUCTIONS.md');

// Step 6: Summary
console.log('\n✨ Deployment preparation complete!\n');
console.log('📋 Next steps:');
console.log('   1. Review DEPLOYMENT_CHECKLIST.md');
console.log('   2. Review UPLOAD_INSTRUCTIONS.md');
console.log('   3. Create .env file in api_db_portfolio/ with Hostinger credentials');
console.log('   4. Upload files to Hostinger following the instructions');
console.log('   5. Import database_schema.sql to your database');
console.log('   6. Test your live site!\n');

console.log('📁 Files ready for upload:');
console.log(`   Frontend: ${DIST_DIR}`);
console.log(`   Backend: ${API_DIR}\n`);


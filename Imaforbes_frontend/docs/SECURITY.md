# 🔒 Security Guidelines for My Portfolio React Project

## ⚠️ CRITICAL SECURITY MEASURES

### 🚫 NEVER COMMIT THESE FILES TO GITHUB:
- `.env` - Contains environment variables and API keys
- `src/config/api.js` - Contains API configuration and secrets
- `src/config/database.js` - Contains database connection settings
- `src/utils/constants.js` - May contain sensitive configuration
- Any files with API keys, passwords, or secrets

### 📁 Protected Files & Directories:
```
.env*                      # Environment variables
src/config/api.js         # API configuration
src/config/database.js    # Database settings
src/config/secrets.js     # Secret keys
src/utils/constants.js    # Configuration constants
src/services/auth.js      # Authentication logic
src/data/                 # Data files
src/assets/data/          # Asset data
uploads/                  # User uploaded files
temp/                     # Temporary files
tmp/                      # Temporary files
```

### 🔐 Environment Setup:

1. **Environment Variables:**
   ```bash
   # Copy the template
   cp env.example .env
   
   # Edit with your actual values
   nano .env
   ```

2. **API Configuration:**
   ```bash
   # Copy the template
   cp src/config/api.example.js src/config/api.js
   
   # Edit with your actual API settings
   nano src/config/api.js
   ```

3. **Build Configuration:**
   ```bash
   # For production builds
   npm run build
   
   # For development
   npm run dev
   ```

### 🛡️ Security Best Practices:

1. **Environment Variables:**
   - Use `VITE_` prefix for Vite environment variables
   - Never hardcode sensitive data in source code
   - Use different values for development and production

2. **API Security:**
   - Validate all API responses
   - Handle errors gracefully
   - Implement proper CORS settings
   - Use HTTPS in production

3. **Build Security:**
   - Remove console.log statements in production
   - Minify and obfuscate code
   - Use environment-specific builds

### 🚨 Before Pushing to GitHub:

1. **Check for sensitive data:**
   ```bash
   # Search for potential secrets
   grep -r "password\|secret\|key\|token" --include="*.js" --include="*.jsx" src/
   ```

2. **Verify .gitignore:**
   ```bash
   # Check ignored files
   git status --ignored
   ```

3. **Test without sensitive files:**
   ```bash
   # Ensure project works with example files
   cp env.example .env
   cp src/config/api.example.js src/config/api.js
   npm run build
   ```

### 📋 Deployment Checklist:

- [ ] All sensitive files are in .gitignore
- [ ] Example files are provided
- [ ] No hardcoded credentials in source code
- [ ] Environment variables are used
- [ ] Production build is secure
- [ ] HTTPS is enabled in production
- [ ] API calls use secure endpoints
- [ ] Error messages don't expose sensitive info

### 🔧 Development vs Production:

**Development:**
```javascript
// Use local API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api_db';
```

**Production:**
```javascript
// Use production API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://www.imaforbes.com/api_db';
```

### 🆘 If You Accidentally Commit Sensitive Data:

1. **Immediately remove from history:**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```

2. **Force push to update remote:**
   ```bash
   git push origin --force --all
   ```

3. **Change all passwords and keys immediately**

### 📞 Support:
If you need help with security setup, contact the development team.

### 🚀 Quick Start:

1. **Clone the repository**
2. **Copy environment files:**
   ```bash
   cp env.example .env
   cp src/config/api.example.js src/config/api.js
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Configure your settings in .env and src/config/api.js**
5. **Start development:**
   ```bash
   npm run dev
   ```

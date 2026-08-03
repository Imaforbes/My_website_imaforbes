# MAMP Configuration Guide

This guide will help you set up both the API backend and React frontend to work with MAMP.

## Prerequisites

- MAMP installed and running
- MySQL running on port 8889 (MAMP default)
- Apache running on port 8888 (MAMP default)

## API Backend Configuration (`api_db_portfolio`)

### Database Configuration

The API is already configured to work with MAMP automatically. It detects localhost and uses these default credentials:

- **Host:** `127.0.0.1`
- **Port:** `8889` (MAMP MySQL default)
- **Username:** `root`
- **Password:** `root` (MAMP default)
- **Database:** `portfolio`

### Setup Steps

1. **Create the Database:**
   ```bash
   cd /Applications/MAMP/htdocs/api_db_portfolio
   php setup.php
   ```

2. **Verify Database Connection:**
   - The database configuration is in `config/database.php`
   - It automatically detects MAMP environment (localhost:8888 or 8889)
   - No `.env` file needed for local development

3. **Test the API:**
   - Open: `http://localhost:8888/api_db_portfolio/api/projects.php`
   - Should return JSON response

### CORS Configuration

CORS is already configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- Any `localhost` or `127.0.0.1` origin on any port

## React Frontend Configuration (`my-portfolio-react`)

### API Configuration

The React app is configured to use MAMP's Apache server:

- **Development URL:** `http://localhost:8888/api_db_portfolio`
- **Vite Dev Server:** `http://localhost:5173`

### Setup Steps

1. **Install Dependencies:**
   ```bash
   cd /Applications/MAMP/htdocs/my-portfolio-react
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Access the Application:**
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:8888/api_db_portfolio/api/`

### Configuration Files

- **API Config:** `src/config/api.js` - Points to MAMP Apache port 8888
- **Vite Config:** `vite.config.js` - Proxy configured for MAMP
- **Environment:** `env.example` - Template for environment variables

## Port Configuration

### Default MAMP Ports

- **Apache (HTTP):** `8888`
- **Apache (HTTPS):** `8890`
- **MySQL:** `8889`

If you've changed MAMP's ports, you'll need to update:

1. **API Backend:**
   - Update `config/database.php` - Change MySQL port if different
   - CORS will automatically accept any localhost port

2. **React Frontend:**
   - Update `src/config/api.js` - Change Apache port if different
   - Update `vite.config.js` - Change proxy target port

## Troubleshooting

### Database Connection Issues

1. **Check MAMP is Running:**
   - Open MAMP application
   - Click "Start Servers"
   - Verify MySQL is running on port 8889

2. **Check Database Exists:**
   ```sql
   -- Connect to MySQL via MAMP
   mysql -u root -proot -h 127.0.0.1 -P 8889
   
   -- Check if database exists
   SHOW DATABASES;
   
   -- If portfolio doesn't exist, run:
   CREATE DATABASE portfolio;
   ```

3. **Verify Credentials:**
   - Default MAMP credentials: `root` / `root`
   - If changed, update `config/database.php` or create `.env` file

### CORS Issues

1. **Check CORS Headers:**
   - Open browser DevTools > Network tab
   - Check response headers for `Access-Control-Allow-Origin`
   - Should include `http://localhost:5173`

2. **Clear Browser Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

3. **Verify Origin:**
   - Make sure React app is running on `http://localhost:5173`
   - API should accept requests from this origin automatically

### API Not Accessible

1. **Check Apache is Running:**
   - MAMP should show Apache as running
   - Test: `http://localhost:8888/api_db_portfolio/api/projects.php`

2. **Check File Permissions:**
   ```bash
   chmod -R 755 /Applications/MAMP/htdocs/api_db_portfolio
   ```

3. **Check .htaccess:**
   - `.htaccess` in `api/` folder should allow PHP execution

## File Structure

```
/Applications/MAMP/htdocs/
├── api_db_portfolio/          # API Backend
│   ├── api/                   # API endpoints
│   ├── config/                # Configuration files
│   │   ├── database.php       # Database config (auto-detects MAMP)
│   │   └── response.php       # API response handler
│   └── setup.php              # Database setup script
│
└── my-portfolio-react/        # React Frontend
    ├── src/
    │   ├── config/
    │   │   └── api.js         # API configuration (points to MAMP)
    │   └── services/
    │       └── api.js         # API service
    └── vite.config.js         # Vite config (proxy for MAMP)
```

## Quick Start Checklist

- [ ] MAMP installed and servers running
- [ ] Apache running on port 8888
- [ ] MySQL running on port 8889
- [ ] Database `portfolio` created (run `php setup.php`)
- [ ] React dependencies installed (`npm install`)
- [ ] React dev server started (`npm run dev`)
- [ ] Test API: `http://localhost:8888/api_db_portfolio/api/projects.php`
- [ ] Test Frontend: `http://localhost:5173`

## Additional Notes

- **No .env file needed** for local MAMP development
- Database credentials are hardcoded for MAMP (root/root)
- CORS automatically accepts localhost origins
- All configuration is automatic based on environment detection

---

**Your portfolio is now configured for MAMP! 🎉**


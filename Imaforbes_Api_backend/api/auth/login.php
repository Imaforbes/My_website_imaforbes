<?php
/**
 * Admin Login API Endpoint
 */

// CRITICAL: Set CORS headers IMMEDIATELY - no output before this point
// SIMPLIFIED HARDCODED CORS - Always works in production

// Get host and origin
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// If no origin header, try to get from referer
if (empty($origin) && !empty($_SERVER['HTTP_REFERER'])) {
    $parsedUrl = parse_url($_SERVER['HTTP_REFERER']);
    if ($parsedUrl && isset($parsedUrl['scheme']) && isset($parsedUrl['host'])) {
        $origin = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
    }
}

// ========================================
// CORS CONFIGURATION
// ========================================

// PRODUCTION (HOSTINGER) - Comentado, no modificar
/*
if (strpos($host, 'imaforbes.com') !== false) {
    // We're on Hostinger - ALWAYS allow imaforbes.com requests, NEVER localhost
    $corsOrigin = !empty($origin) && strpos($origin, 'imaforbes.com') !== false 
        ? $origin 
        : 'https://imaforbes.com';
} else {
    // Development only
    $corsOrigin = 'http://localhost:5173';
}
*/

// Detect environment: LOCAL or PRODUCTION
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && 
     strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
);

if ($isProduction) {
    // PRODUCTION: Allow imaforbes.com origins
    if (!empty($origin) && strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    } else {
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    // DEVELOPMENT: Allow localhost origins (any port)
    if (!empty($origin)) {
        if (strpos($origin, 'http://localhost:') === 0 || 
            strpos($origin, 'http://127.0.0.1:') === 0 ||
            $origin === 'http://localhost' ||
            $origin === 'http://127.0.0.1') {
            $corsOrigin = $origin;
        } else {
            $corsOrigin = 'http://localhost:5173';
        }
    } else {
        $corsOrigin = 'http://localhost:5173';
    }
}

// Set ALL CORS headers - these MUST be set before any output
header("Access-Control-Allow-Origin: $corsOrigin", true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);

// Handle preflight requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../config/response.php';
require_once '../../auth/session.php';
require_once '../../utils/RateLimiter.php';
require_once '../../utils/CsrfProtection.php';

// NOTE: CORS headers already set above - don't call CorsHandler as it might override

// Start session using SessionManager for proper cookie configuration
SessionManager::startSession();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

// SECURITY: Rate limiting - prevent brute force attacks
// Allow 5 login attempts per 15 minutes (900 seconds)
RateLimiter::requireLimit('login', 5, 900);

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    // Validate required fields
    $errors = [];

    if (empty($input['username'])) {
        $errors['username'] = 'Username is required';
    }

    if (empty($input['password'])) {
        $errors['password'] = 'Password is required';
    }

    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }

    $username = InputValidator::sanitizeString($input['username'], 100);
    $password = $input['password'];

    // Attempt login
    $user = SessionManager::login($username, $password);

    if ($user) {
        // SECURITY: Reset rate limit on successful login
        RateLimiter::resetLimit('login');
        
        // Clean up expired sessions
        SessionManager::cleanupExpiredSessions();

        ApiResponse::success($user, 'Login successful');
    } else {
        // SECURITY: Rate limit already incremented, just return error
        ApiResponse::error('Invalid credentials', 401);
    }
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred during login');
}

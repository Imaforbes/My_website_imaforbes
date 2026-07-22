<?php

/**
 * Admin Logout API Endpoint
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

// Get origin and detect environment
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';

// Detect environment: LOCAL or PRODUCTION
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && 
     strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
);

if ($isProduction) {
    // PRODUCTION: Allow imaforbes.com origins (both www and non-www)
    if (!empty($origin) && strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    } else {
        // Default to www version if origin not provided
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    // DEVELOPMENT: Allow localhost origins (any port)
    $corsOrigin = 'http://localhost:5173';
    if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
        $corsOrigin = $origin;
    }
}

// Set ALL CORS headers - these MUST be set before any output
header("Access-Control-Allow-Origin: $corsOrigin", true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);

// Handle preflight requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/response.php';
require_once '../../auth/session.php';

// NOTE: CORS headers already set above - don't call CorsHandler as it might override

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

try {
    SessionManager::logout();
    ApiResponse::success(null, 'Logout successful');
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred during logout');
}

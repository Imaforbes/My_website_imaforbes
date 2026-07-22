<?php

/**
 * CSRF Token API Endpoint
 * Returns a CSRF token for the current session
 */

// CRITICAL: Set CORS headers IMMEDIATELY - no output before this point
// Turn off output buffering to prevent any output before headers
if (ob_get_level()) {
    ob_end_clean();
}

// Get origin and detect environment
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';

// Extract origin from referer if needed
if (empty($origin) && !empty($_SERVER['HTTP_REFERER'])) {
    $parsed = parse_url($_SERVER['HTTP_REFERER']);
    if ($parsed && isset($parsed['scheme']) && isset($parsed['host'])) {
        $origin = $parsed['scheme'] . '://' . $parsed['host'];
    }
}

// Detect environment: LOCAL or PRODUCTION
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' &&
     strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
);

// Determine CORS origin
if ($isProduction) {
    // PRODUCTION: Allow both www and non-www versions
    if (!empty($origin)) {
        // Check if origin is imaforbes.com (with or without www)
        if (strpos($origin, 'imaforbes.com') !== false) {
            $corsOrigin = $origin;
        } else {
            // Default to www version
            $corsOrigin = 'https://www.imaforbes.com';
        }
    } else {
        // No origin header, default to www
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    // DEVELOPMENT: Allow localhost origins
    $corsOrigin = 'http://localhost:5173';
    if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
        $corsOrigin = $origin;
    }
}

// Set CORS headers - MUST be set before any output
header("Access-Control-Allow-Origin: $corsOrigin", true);
header('Access-Control-Allow-Methods: GET, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);

// Handle preflight OPTIONS requests - MUST be handled before any other code
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once '../../config/response.php';
require_once '../../auth/session.php';
require_once '../../utils/CsrfProtection.php';

// Start session
SessionManager::startSession();

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::error('Method not allowed', 405);
}

try {
    // Generate or get existing CSRF token
    $token = CsrfProtection::getToken();
    
    ApiResponse::success([
        'csrf_token' => $token,
        'expires_in' => 3600 // 1 hour
    ], 'CSRF token generated successfully');
} catch (Exception $e) {
    error_log("CSRF token error: " . $e->getMessage());
    ApiResponse::serverError('Failed to generate CSRF token');
}


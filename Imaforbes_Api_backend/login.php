<?php
/**
 * Login Endpoint Alias
 * Redirects to the correct login endpoint for backward compatibility
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

// DEVELOPMENT (LOCAL) - Always allow localhost origins
// For local development, accept any localhost or 127.0.0.1 origin
if (!empty($origin)) {
    // Check if origin is localhost or 127.0.0.1 (any port)
    if (strpos($origin, 'http://localhost:') === 0 || 
        strpos($origin, 'http://127.0.0.1:') === 0 ||
        $origin === 'http://localhost' ||
        $origin === 'http://127.0.0.1') {
        // Use the exact origin requested
        $corsOrigin = $origin;
    } else {
        // Not a localhost origin, default to localhost:5173
        $corsOrigin = 'http://localhost:5173';
    }
} else {
    // No origin provided, default to localhost:5173 for development
    $corsOrigin = 'http://localhost:5173';
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

// Include the actual login endpoint
require_once __DIR__ . '/api/auth/login.php';


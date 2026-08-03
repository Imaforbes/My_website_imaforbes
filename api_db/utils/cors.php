<?php

/**
 * CORS Middleware
 * Centralized CORS header handling for all API endpoints.
 * Include this file at the top of every API endpoint instead of
 * duplicating CORS logic in each file.
 *
 * Usage: require_once __DIR__ . '/../utils/cors.php';
 */

// Suppress any accidental output
ob_start();

// Get origin and detect environment.
// Parse hostnames instead of using substring matches so, for example,
// evil-imaforbes.com cannot be treated as an allowed Imaforbes origin.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '')[0]);

// If no origin header, try to get from referer
if (empty($origin) && !empty($_SERVER['HTTP_REFERER'])) {
    $parsedUrl = parse_url($_SERVER['HTTP_REFERER']);
    if ($parsedUrl && isset($parsedUrl['scheme']) && isset($parsedUrl['host'])) {
        $origin = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
    }
}

// Detect environment: LOCAL or PRODUCTION
$isProduction = !in_array($host, ['localhost', '127.0.0.1'], true);
$originParts = $origin ? parse_url($origin) : null;
$originHost = strtolower($originParts['host'] ?? '');
$originScheme = strtolower($originParts['scheme'] ?? '');
$isAllowedProductionOrigin =
    $originScheme === 'https' &&
    in_array($originHost, ['imaforbes.com', 'www.imaforbes.com'], true);
$isAllowedLocalOrigin =
    $originScheme === 'http' &&
    in_array($originHost, ['localhost', '127.0.0.1'], true);

if ($isProduction) {
    // PRODUCTION: Allow only the exact www and non-www site origins.
    $corsOrigin = $isAllowedProductionOrigin ? $origin : 'https://www.imaforbes.com';
} else {
    // DEVELOPMENT: Allow localhost origins (any port)
    $corsOrigin = $isAllowedLocalOrigin ? $origin : 'http://localhost:5173';
}

// Set CORS headers — MUST be before any output
header("Access-Control-Allow-Origin: $corsOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Handle preflight OPTIONS requests IMMEDIATELY
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// Clear any accidental output before continuing
ob_end_clean();

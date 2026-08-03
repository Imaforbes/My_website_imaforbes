<?php

/**
 * CSRF Token API Endpoint
 * Returns a CSRF token for the current session
 */

require_once __DIR__ . '/../../utils/cors.php';

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


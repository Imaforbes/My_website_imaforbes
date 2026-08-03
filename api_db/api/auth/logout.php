<?php

/**
 * Admin Logout API Endpoint
 */

require_once __DIR__ . '/../../utils/cors.php';

require_once '../../config/response.php';
require_once '../../auth/session.php';

// CORS headers are provided by the centralized middleware above.

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

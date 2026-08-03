<?php
/**
 * Admin Login API Endpoint
 */

require_once __DIR__ . '/../../utils/cors.php';

require_once '../../config/database.php';
require_once '../../config/response.php';
require_once '../../auth/session.php';
require_once '../../utils/RateLimiter.php';
require_once '../../utils/CsrfProtection.php';

// CORS headers are provided by the centralized middleware above.

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

<?php

/**
 * CSRF Protection Utility
 * Generates and validates CSRF tokens for API endpoints
 */

class CsrfProtection
{
    /**
     * Generate a CSRF token and store it in session
     */
    public static function generateToken()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Generate a secure random token
        $token = bin2hex(random_bytes(32));
        
        // Store token in session with timestamp
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_token_time'] = time();

        return $token;
    }

    /**
     * Get the current CSRF token (generate if doesn't exist)
     */
    public static function getToken()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Check if token exists and is not expired (1 hour expiry)
        if (isset($_SESSION['csrf_token']) && 
            isset($_SESSION['csrf_token_time']) &&
            (time() - $_SESSION['csrf_token_time']) < 3600) {
            return $_SESSION['csrf_token'];
        }

        // Generate new token if expired or doesn't exist
        return self::generateToken();
    }

    /**
     * Validate CSRF token
     */
    public static function validateToken($token)
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Check if token exists in session
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }

        // Check if token is expired (1 hour)
        if (!isset($_SESSION['csrf_token_time']) || 
            (time() - $_SESSION['csrf_token_time']) > 3600) {
            // Token expired, clear it
            unset($_SESSION['csrf_token']);
            unset($_SESSION['csrf_token_time']);
            return false;
        }

        // Compare tokens using constant-time comparison to prevent timing attacks
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Validate CSRF token from request
     * Checks X-CSRF-Token header or csrf_token in request body
     */
    public static function validateRequest()
    {
        // Only validate state-changing methods
        $stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (!in_array($_SERVER['REQUEST_METHOD'], $stateChangingMethods)) {
            return true; // GET requests don't need CSRF protection
        }

        // Get token from header (preferred) or request body
        $token = null;
        
        // Check X-CSRF-Token header
        $headers = getallheaders();
        if (isset($headers['X-CSRF-Token'])) {
            $token = $headers['X-CSRF-Token'];
        } elseif (isset($headers['x-csrf-token'])) {
            $token = $headers['x-csrf-token'];
        }

        // If not in header, check request body
        if (!$token) {
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['csrf_token'])) {
                $token = $input['csrf_token'];
            }
        }

        // If still no token, check POST data
        if (!$token && isset($_POST['csrf_token'])) {
            $token = $_POST['csrf_token'];
        }

        if (!$token) {
            return false;
        }

        return self::validateToken($token);
    }

    /**
     * Require CSRF token validation (throws error if invalid)
     */
    public static function requireToken()
    {
        if (!self::validateRequest()) {
            require_once __DIR__ . '/../config/response.php';
            ApiResponse::error('Invalid or missing CSRF token', 403);
        }
    }
}


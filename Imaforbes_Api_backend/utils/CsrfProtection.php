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

        // Get token from header (preferred) - MUST be in header to avoid consuming php://input
        $token = null;
        
        // Check X-CSRF-Token header (case-insensitive)
        // Try getallheaders() first (works on Apache)
        $headers = @getallheaders();
        if ($headers) {
            // Check both uppercase and lowercase versions
            foreach ($headers as $key => $value) {
                if (strtolower($key) === 'x-csrf-token') {
                    $token = $value;
                    break;
                }
            }
        }
        
        // Fallback: Check $_SERVER superglobal (works on all servers)
        // Headers in $_SERVER are prefixed with HTTP_ and converted to uppercase with underscores
        // X-CSRF-Token becomes HTTP_X_CSRF_TOKEN
        if (!$token && isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
            $token = $_SERVER['HTTP_X_CSRF_TOKEN'];
        }
        
        // If still no token, check POST data (for form submissions)
        if (!$token && isset($_POST['csrf_token'])) {
            $token = $_POST['csrf_token'];
        }
        
        // Note: We don't check request body to avoid consuming php://input
        // The token MUST be sent in the X-CSRF-Token header

        // Log for debugging
        if (!$token) {
            error_log("CSRF Protection - No token found in request. Method: " . $_SERVER['REQUEST_METHOD']);
            error_log("CSRF Protection - Headers: " . json_encode($headers));
            return false;
        }

        $isValid = self::validateToken($token);
        if (!$isValid) {
            error_log("CSRF Protection - Token validation failed. Method: " . $_SERVER['REQUEST_METHOD']);
            error_log("CSRF Protection - Token provided: " . substr($token, 0, 10) . "...");
        }
        
        return $isValid;
    }

    /**
     * Require CSRF token validation (throws error if invalid)
     */
    public static function requireToken()
    {
        // Only validate state-changing methods
        $stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
        if (!in_array($_SERVER['REQUEST_METHOD'], $stateChangingMethods)) {
            // GET requests don't need CSRF protection - return early
            return;
        }
        
        if (!self::validateRequest()) {
            require_once __DIR__ . '/../config/response.php';
            error_log("CSRF Protection - Invalid or missing CSRF token for method: " . $_SERVER['REQUEST_METHOD']);
            ApiResponse::error('Invalid or missing CSRF token', 403);
        }
    }
}


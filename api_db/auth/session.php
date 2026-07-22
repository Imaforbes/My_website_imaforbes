<?php

/**
 * Session Management for Admin Authentication
 */

require_once __DIR__ . '/../config/database.php';

class SessionManager
{

    public static function startSession()
    {
        if (session_status() === PHP_SESSION_NONE) {
            // Detect environment
            $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
            $isProduction = (
                strpos($host, 'imaforbes.com') !== false ||
                (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && 
                 strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
            );
            
            $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
            
            // Configure session settings
            ini_set('session.cookie_httponly', 1);
            ini_set('session.use_only_cookies', 1);
            
            if ($isProduction && $isHttps) {
                // PRODUCTION HTTPS: Use SameSite=None for cross-origin (www <-> non-www)
                ini_set('session.cookie_secure', 1);
                ini_set('session.cookie_samesite', 'None');
                // Set domain to allow cookies across www and non-www
                ini_set('session.cookie_domain', '.imaforbes.com');
                
                session_set_cookie_params([
                    'lifetime' => 0,
                    'path' => '/',
                    'domain' => '.imaforbes.com', // Allow cookies for both www and non-www
                    'secure' => true, // HTTPS required
                    'httponly' => true,
                    'samesite' => 'None' // Required for cross-origin (www <-> non-www)
                ]);
            } else {
                // DEVELOPMENT: Use Lax for localhost
                ini_set('session.cookie_secure', 0);
                ini_set('session.cookie_domain', '');
                ini_set('session.cookie_samesite', 'Lax');
                
                session_set_cookie_params([
                    'lifetime' => 0,
                    'path' => '/',
                    'domain' => '', // Empty for localhost
                    'secure' => false, // HTTP for localhost
                    'httponly' => true,
                    'samesite' => 'Lax' // Lax works for localhost
                ]);
            }

            session_start();
        }
    }

    public static function isAuthenticated()
    {
        self::startSession();

        if (!isset($_SESSION['admin_user_id'])) {
            return false;
        }

        // For now, use simple session-based authentication
        // In a production environment, you might want to add session tokens to the database
        return true;
    }

    public static function login($username, $password)
    {
        $db = Database::getInstance();

        // Use the existing usuarios table
        $sql = "SELECT id, username, password_hash 
                FROM usuarios 
                WHERE username = ?";

        $stmt = $db->query($sql, [$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return false;
        }

        // Set session variables
        self::startSession();
        $_SESSION['admin_user_id'] = $user['id'];
        $_SESSION['admin_username'] = $user['username'];
        $_SESSION['admin_role'] = 'admin'; // Default role

        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => 'admin'
        ];
    }

    public static function logout()
    {
        self::startSession();
        self::destroySession();
    }

    public static function destroySession()
    {
        self::startSession();
        session_destroy();
    }

    public static function getCurrentUser()
    {
        if (!self::isAuthenticated()) {
            return null;
        }

        self::startSession();

        return [
            'id' => $_SESSION['admin_user_id'],
            'username' => $_SESSION['admin_username'],
            'role' => $_SESSION['admin_role']
        ];
    }

    public static function requireAuth()
    {
        if (!self::isAuthenticated()) {
            require_once '../config/response.php';
            ApiResponse::unauthorized('Authentication required');
        }
    }

    public static function requireRole($requiredRole)
    {
        self::requireAuth();

        $user = self::getCurrentUser();
        if ($user['role'] !== $requiredRole && $user['role'] !== 'super_admin') {
            require_once '../config/response.php';
            ApiResponse::forbidden('Insufficient permissions');
        }
    }

    public static function cleanupExpiredSessions()
    {
        // No-op for now since we're using simple session-based auth
        return true;
    }
}

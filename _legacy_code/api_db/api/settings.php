<?php

/**
 * Settings Management API Endpoint
 * Handles CRUD operations for system configuration settings
 */

require_once __DIR__ . '/../utils/cors.php';

require_once '../config/database.php';
require_once '../config/response.php';
require_once '../auth/session.php';

// CORS headers are provided by the centralized middleware above.

// Start session explicitly (after CORS headers are set)
if (session_status() === PHP_SESSION_NONE) {
    SessionManager::startSession();
}

// Check multiple session variables for backward compatibility
$isAuthenticated = (
    isset($_SESSION['admin_user_id']) ||
    (isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true) ||
    isset($_SESSION['admin_username'])
);

error_log("Settings API - Authentication result: " . ($isAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'));

if (!$isAuthenticated) {
    error_log("Settings API - Authentication failed, returning 401");
    error_log("Settings API - Available session keys: " . implode(', ', array_keys($_SESSION ?? [])));
    ApiResponse::unauthorized('Authentication required');
}

$method = $_SERVER['REQUEST_METHOD'];

// Debug logging
error_log("Settings API - Request Method: " . $method);
error_log("Settings API - Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'unknown'));

$db = Database::getInstance();

try {
    switch ($method) {
        case 'GET':
            handleGetSettings($db);
            break;
        case 'POST':
        case 'PUT':
        case 'PATCH':
            handleUpdateSettings($db);
            break;
        default:
            error_log("Settings API - Unsupported method: " . $method);
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Settings API error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred while processing the request');
}

function handleGetSettings($db)
{
    try {
        // Create table if it doesn't exist (safe - won't error if exists)
        $createTableSql = "CREATE TABLE IF NOT EXISTS portfolio_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT,
            description VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $db->query($createTableSql);

        // Get all settings from the portfolio_settings table
        $sql = "SELECT setting_key, setting_value, description FROM portfolio_settings ORDER BY setting_key";
        $stmt = $db->query($sql);
        $settings = $stmt->fetchAll();

        // Convert to associative array
        $settingsArray = [];
        foreach ($settings as $setting) {
            $settingsArray[$setting['setting_key']] = [
                'value' => $setting['setting_value'],
                'description' => $setting['description']
            ];
        }

        // Get system status
        $systemStatus = getSystemStatus($db);

        $response = [
            'settings' => $settingsArray,
            'system_status' => $systemStatus
        ];

        ApiResponse::success($response, 'Settings retrieved successfully');
    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
        $trace = $e->getTraceAsString();
        error_log("Get settings error: " . $errorMessage);
        error_log("Get settings trace: " . $trace);
        ApiResponse::serverError('Failed to retrieve settings: ' . $errorMessage);
    }
}

function handleUpdateSettings($db)
{
    // SECURITY: Validate CSRF token
    require_once '../utils/CsrfProtection.php';
    CsrfProtection::requireToken();
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    try {
        // Create table if it doesn't exist (safe - won't error if exists)
        $createTableSql = "CREATE TABLE IF NOT EXISTS portfolio_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT,
            description VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $db->query($createTableSql);

        $db->beginTransaction();

        $updatedSettings = [];

        foreach ($input as $key => $value) {
            // Skip null or empty keys
            if (empty($key) || $key === null) {
                continue;
            }

            // Sanitize the key
            $key = preg_replace('/[^a-zA-Z0-9_]/', '_', $key);

            if (is_array($value) && isset($value['value'])) {
                // Handle nested settings (like notifications, security, etc.)
                $settingValue = json_encode($value['value'], JSON_UNESCAPED_UNICODE);
            } else {
                $settingValue = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string)$value;
            }

            $description = getSettingDescription($key);

            // Check if setting exists first
            $checkSql = "SELECT id FROM portfolio_settings WHERE setting_key = ?";
            $checkStmt = $db->query($checkSql, [$key]);
            $exists = $checkStmt->fetch();

            if ($exists) {
                // Update existing setting
                $updateSql = "UPDATE portfolio_settings
                             SET setting_value = ?, description = ?, updated_at = CURRENT_TIMESTAMP
                             WHERE setting_key = ?";
                $db->query($updateSql, [$settingValue, $description, $key]);
            } else {
                // Insert new setting
                $insertSql = "INSERT INTO portfolio_settings (setting_key, setting_value, description)
                             VALUES (?, ?, ?)";
                $db->query($insertSql, [$key, $settingValue, $description]);
            }

            $updatedSettings[$key] = $settingValue;
        }

        $db->commit();

        // Get updated settings
        $sql = "SELECT setting_key, setting_value FROM portfolio_settings";
        $stmt = $db->query($sql);
        $allSettings = $stmt->fetchAll();

        $settingsArray = [];
        foreach ($allSettings as $setting) {
            $settingsArray[$setting['setting_key']] = $setting['setting_value'];
        }

        ApiResponse::success($settingsArray, 'Settings updated successfully');
    } catch (Exception $e) {
        try {
            $connection = $db->getConnection();
            if ($connection && method_exists($connection, 'inTransaction')) {
                if ($connection->inTransaction()) {
                    $db->rollBack();
                }
            } else {
                // Fallback: try to rollback anyway
                try {
                    $db->rollBack();
                } catch (Exception $rollbackException) {
                    // Ignore rollback errors
                }
            }
        } catch (Exception $rollbackException) {
            // Ignore rollback errors, continue with error reporting
        }

        $errorMessage = $e->getMessage();
        $trace = $e->getTraceAsString();
        error_log("Update settings error: " . $errorMessage);
        error_log("Update settings trace: " . $trace);
        error_log("Update settings input: " . json_encode($input));
        ApiResponse::serverError('Failed to update settings: ' . $errorMessage);
    }
}

function getSystemStatus($db)
{
    try {
        // Check database connection
        $dbStatus = 'connected';

        // Check API status
        $apiStatus = 'working';

        // Check backup status (simulate)
        $backupStatus = 'pending';

        // Get message count
        $stmt = $db->query("SELECT COUNT(*) as count FROM datos");
        $messageCount = $stmt->fetch()['count'];

        return [
            'database' => $dbStatus,
            'api' => $apiStatus,
            'backup' => $backupStatus,
            'message_count' => $messageCount,
            'last_check' => date('Y-m-d H:i:s')
        ];
    } catch (Exception $e) {
        return [
            'database' => 'error',
            'api' => 'error',
            'backup' => 'error',
            'message_count' => 0,
            'last_check' => date('Y-m-d H:i:s'),
            'error' => $e->getMessage()
        ];
    }
}

function getSettingDescription($key)
{
    $descriptions = [
        'site_name' => 'Main site title',
        'site_description' => 'Site meta description',
        'admin_email' => 'Administrator email address',
        'notifications' => 'Notification preferences',
        'security' => 'Security settings',
        'appearance' => 'Appearance and theme settings',
        'database' => 'Database configuration',
        'contact_email' => 'Content form email address',
        'github_url' => 'GitHub profile URL',
        'linkedin_url' => 'LinkedIn profile URL',
        'max_upload_size' => 'Maximum file upload size in bytes',
        'allowed_file_types' => 'Allowed file extensions for uploads'
    ];

    return $descriptions[$key] ?? 'System setting';
}

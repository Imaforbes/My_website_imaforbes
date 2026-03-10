<?php
/**
 * Contact Form API Endpoint
 * Handles contact form submissions and message management
 */

// CRITICAL: Set CORS headers IMMEDIATELY - no output before this point
// No whitespace, no BOM, no echo statements before headers

// ========================================
// CORS CONFIGURATION
// ========================================

// Get origin from request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// If no origin header, try to get from referer
if (empty($origin) && !empty($_SERVER['HTTP_REFERER'])) {
    $parsedUrl = parse_url($_SERVER['HTTP_REFERER']);
    if ($parsedUrl && isset($parsedUrl['scheme']) && isset($parsedUrl['host'])) {
        $origin = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
    }
}

// PRODUCTION (HOSTINGER) - Comentado, no modificar
/*
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'https://www.imaforbes.com',
    'https://imaforbes.com'
];

// Determine CORS origin
$corsOrigin = null;

if (!empty($origin)) {
    if (in_array($origin, $allowedOrigins)) {
        $corsOrigin = $origin;
    } elseif (strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    }
}

// Fallback: Check if we're in production environment
if (empty($corsOrigin)) {
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    $isProduction = (
        strpos($host, 'imaforbes.com') !== false ||
        strpos($host, 'www.imaforbes.com') !== false ||
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && strpos($host, 'localhost') === false)
    );
    
    if ($isProduction) {
        $corsOrigin = !empty($origin) && strpos($origin, 'imaforbes.com') !== false 
            ? $origin 
            : 'https://imaforbes.com';
    } else {
        $corsOrigin = 'http://localhost:5173';
    }
}
*/

// Get origin and detect environment
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';

// Detect environment: LOCAL or PRODUCTION
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && 
     strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
);

if ($isProduction) {
    // PRODUCTION: Allow imaforbes.com origins (both www and non-www)
    if (!empty($origin) && strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    } else {
        // Default to www version if origin not provided
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    // DEVELOPMENT: Allow localhost origins (any port)
    $corsOrigin = 'http://localhost:5173';
    if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
        $corsOrigin = $origin;
    }
}

// Set ALL CORS headers - these MUST be set before any output
header("Access-Control-Allow-Origin: $corsOrigin", true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle OPTIONS preflight requests - exit immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../config/response.php';
require_once '../utils/EmailSender.php';
require_once '../utils/RateLimiter.php';
require_once '../utils/CsrfProtection.php';
require_once '../auth/session.php';

// Only allow POST requests for contact form submission
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

// SECURITY: Start session for CSRF token validation
SessionManager::startSession();

// SECURITY: Rate limiting - prevent spam/abuse
// Allow 3 submissions per 10 minutes (600 seconds)
RateLimiter::requireLimit('contact', 3, 600);

// SECURITY: Validate CSRF token for public contact form
// This prevents CSRF attacks even on public endpoints
CsrfProtection::requireToken();

try {
    // Test database connection first
    try {
        $db = Database::getInstance();
    } catch (Exception $e) {
        error_log("Database connection failed: " . $e->getMessage());
        ApiResponse::serverError('Database connection failed. Please run the database setup first.');
    }

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    // Debug: Log the received input
    error_log("Contact form input: " . json_encode($input));

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    // Validate required fields
    $errors = [];

    if (empty($input['name'])) {
        $errors['name'] = 'Name is required';
    }

    if (empty($input['email'])) {
        $errors['email'] = 'Email is required';
    } elseif (!InputValidator::validateEmail($input['email'])) {
        $errors['email'] = 'Invalid email format';
    }

    if (empty($input['message'])) {
        $errors['message'] = 'Message is required';
    }

    if (!empty($errors)) {
        // Debug: Log validation errors
        error_log("Contact form validation errors: " . json_encode($errors));
        ApiResponse::validationError($errors);
    }

    // Sanitize input
    $name = InputValidator::sanitizeString($input['name'], 200);
    $email = InputValidator::sanitizeString($input['email'], 200);
    $message = InputValidator::sanitizeText($input['message'], 2000);

    // Additional validation
    if (strlen($name) < 2) {
        $errors['name'] = 'Name must be at least 2 characters';
    }

    if (strlen($message) < 10) {
        $errors['message'] = 'Message must be at least 10 characters';
    }

    if (!empty($errors)) {
        // Debug: Log additional validation errors
        error_log("Contact form additional validation errors: " . json_encode($errors));
        ApiResponse::validationError($errors);
    }

    // Get client information
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    // Insert message into database using the existing datos table
    try {
        // Log which database we're connected to
        $connection = $db->getConnection();
        $currentDb = $connection->query("SELECT DATABASE()")->fetchColumn();
        error_log("=== CONTACT FORM SUBMISSION ===");
        error_log("Current database: " . $currentDb);
        error_log("Expected database: portfolio");
        
        // First, check if the datos table exists and get its structure
        $checkTable = $db->query("SHOW TABLES LIKE 'datos'");
        $tableExists = $checkTable->rowCount() > 0;
        
        if (!$tableExists) {
            error_log("⚠️ datos table does NOT exist - creating it...");
            // Create the datos table if it doesn't exist
            $createTableSql = "CREATE TABLE IF NOT EXISTS datos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(200) NOT NULL,
                email VARCHAR(200) NOT NULL,
                mensaje TEXT NOT NULL,
                fecha DATE,
                ip_address VARCHAR(45),
                user_agent TEXT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            $db->query($createTableSql);
            error_log("✅ Created datos table");
        } else {
            error_log("✅ datos table exists");
            // Check table structure to see what columns exist
            $describeStmt = $db->query("DESCRIBE datos");
            $columns = $describeStmt->fetchAll(PDO::FETCH_COLUMN);
            error_log("datos table columns: " . json_encode($columns));
        }

        // Use the existing datos table with the exact structure: id, nombre, email, mensaje, fecha, ip_address, user_agent
        // Insert with all columns matching the table structure
        $sql = "INSERT INTO datos (nombre, email, mensaje, fecha, ip_address, user_agent) VALUES (?, ?, ?, CURDATE(), ?, ?)";
        
        // Log database info for debugging
        $connection = $db->getConnection();
        $dbName = $connection->query("SELECT DATABASE()")->fetchColumn();
        error_log("Connected to database: " . $dbName);
        error_log("Attempting INSERT into datos table");
        error_log("SQL: " . $sql);
        error_log("Values: nombre={$name}, email={$email}, mensaje length=" . strlen($message) . ", fecha=CURDATE(), ip_address={$ipAddress}, user_agent length=" . strlen($userAgent));
        
        try {
            $stmt = $db->query($sql, [$name, $email, $message, $ipAddress, $userAgent]);
            error_log("✅ INSERT query executed successfully");
        } catch (Exception $queryException) {
            error_log("❌ INSERT query failed: " . $queryException->getMessage());
            error_log("SQL Error Code: " . $queryException->getCode());
            error_log("SQL State: " . ($queryException->getCode() ?: 'N/A'));
            error_log("Full error: " . print_r($queryException, true));
            throw $queryException;
        }

        // Get the inserted ID (this confirms the insert worked)
        $messageId = $db->lastInsertId();
        error_log("lastInsertId returned: " . $messageId);

        if ($messageId > 0) {
            // Verify the insert by querying the database
            $verifyStmt = $db->query("SELECT * FROM datos WHERE id = ?", [$messageId]);
            $verifyRow = $verifyStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($verifyRow) {
                error_log("✅ Insert verified - Record found in database: ID {$messageId}");
            } else {
                error_log("⚠️ WARNING: Insert ID returned but record not found in database!");
            }
            
            // Log successful submission
            error_log("Contact form submitted successfully: ID {$messageId}, Email: {$email}");

            // Send email notifications
            try {
                $emailSender = new EmailSender();

                // Send notification to you
                $emailSent = $emailSender->sendContactNotification($name, $email, $message, $ipAddress);

                if ($emailSent) {
                    error_log("Email notification sent successfully");
                } else {
                    error_log("Failed to send email notification");
                }

                // Send auto-reply to the sender
                $autoReplySent = $emailSender->sendAutoReply($name, $email);

                if ($autoReplySent) {
                    error_log("Auto-reply sent successfully to: {$email}");
                } else {
                    error_log("Failed to send auto-reply to: {$email}");
                }
            } catch (Exception $e) {
                error_log("Email sending failed: " . $e->getMessage());
                // Don't fail the entire request if email fails
            }

            // SECURITY: Reset rate limit on successful submission
            RateLimiter::resetLimit('contact');
            
            ApiResponse::success([
                'id' => $messageId,
                'name' => $name,
                'email' => $email,
                'message' => $message,
                'created_at' => date('c')
            ], 'Message sent successfully!');
        } else {
            error_log("Failed to get insert ID - insert may have failed");
            ApiResponse::serverError('Failed to save message - no insert ID returned');
        }
    } catch (Exception $e) {
        error_log("Database query failed: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        ApiResponse::serverError('Database error: ' . $e->getMessage());
    }
} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred while processing your message');
}

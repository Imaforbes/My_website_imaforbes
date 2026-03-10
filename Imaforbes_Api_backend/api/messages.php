<?php

/**
 * Messages Management API Endpoint
 * Handles CRUD operations for contact messages (Admin only)
 */

// CRITICAL: Set CORS headers IMMEDIATELY - no output before this point
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

$corsOrigin = null;

if (!empty($origin)) {
    if (in_array($origin, $allowedOrigins)) {
        $corsOrigin = $origin;
    } elseif (strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    }
}

if (empty($corsOrigin)) {
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    $isProduction = (
        strpos($host, 'imaforbes.com') !== false ||
        strpos($host, 'www.imaforbes.com') !== false ||
        (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && strpos($host, 'localhost') === false)
    );
    
    if ($isProduction) {
        // In production, default to the requesting origin or imaforbes.com
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
require_once '../auth/session.php';

// Start session using SessionManager for proper cookie configuration
SessionManager::startSession();

// Enhanced authentication check with debugging
error_log("Messages API - Checking authentication...");
error_log("Messages API - Session data: " . json_encode($_SESSION ?? []));
error_log("Messages API - Session ID: " . session_id());
error_log("Messages API - Cookies received: " . json_encode($_COOKIE ?? []));

// Check multiple session variables for backward compatibility
$isAuthenticated = (
    isset($_SESSION['admin_user_id']) ||
    (isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true) ||
    isset($_SESSION['admin_username'])
);

error_log("Messages API - Authentication result: " . ($isAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'));

if (!$isAuthenticated) {
    error_log("Messages API - Authentication failed, returning 401");
    error_log("Messages API - Available session keys: " . implode(', ', array_keys($_SESSION ?? [])));
    error_log("Messages API - Cookie PHPSESSID: " . ($_COOKIE['PHPSESSID'] ?? 'NOT SET'));
    ApiResponse::unauthorized('Authentication required');
}

$method = $_SERVER['REQUEST_METHOD'];

// Debug logging
error_log("Messages API - Request Method: " . $method);
error_log("Messages API - Request URI: " . ($_SERVER['REQUEST_URI'] ?? 'unknown'));
error_log("Messages API - User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));

$db = Database::getInstance();

try {
    switch ($method) {
        case 'GET':
            handleGetMessages($db);
            break;
        case 'PATCH':
            handleUpdateMessage($db);
            break;
        case 'DELETE':
            handleDeleteMessage($db);
            break;
        default:
            error_log("Messages API - Unsupported method: " . $method);
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Messages API error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred while processing the request');
}

function handleGetMessages($db)
{
    // Get query parameters
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(1, intval($_GET['limit'] ?? 10)));
    $status = $_GET['status'] ?? null;
    $search = $_GET['search'] ?? null;

    $offset = ($page - 1) * $limit;

    // Build WHERE clause
    $whereConditions = [];
    $params = [];

    // Note: The datos table doesn't have a status column, so we skip status filtering
    // If you want to add status filtering, you'd need to add a status column to the datos table
    // For now, we'll skip status filtering and just get all messages
    // if ($status && in_array($status, ['new', 'read', 'replied', 'archived'])) {
    //     $whereConditions[] = "status = ?";
    //     $params[] = $status;
    // }

    // SECURITY: Sanitize and validate search input to prevent DoS attacks
    if ($search) {
        $search = InputValidator::sanitizeString($search, 100); // Limit search length
        // SECURITY: Limit search term length to prevent expensive LIKE queries
        if (strlen($search) > 100) {
            $search = substr($search, 0, 100);
        }
        // SECURITY: Escape special characters in LIKE pattern
        $searchTerm = "%" . str_replace(['%', '_'], ['\%', '\_'], $search) . "%";
        $whereConditions[] = "(nombre LIKE ? OR email LIKE ? OR mensaje LIKE ?)";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM datos {$whereClause}";
    $countStmt = $db->query($countSql, $params);
    $total = $countStmt->fetch()['total'];

    // Get messages
    $sql = "SELECT id, nombre as name, email, mensaje as message, fecha as created_at, ip_address, user_agent 
            FROM datos 
            {$whereClause} 
            ORDER BY fecha DESC 
            LIMIT ? OFFSET ?";

    $params[] = $limit;
    $params[] = $offset;

    $stmt = $db->query($sql, $params);
    $messages = $stmt->fetchAll();

    // Calculate pagination info
    $totalPages = ceil($total / $limit);
    $hasNext = $page < $totalPages;
    $hasPrev = $page > 1;

    $pagination = [
        'current_page' => $page,
        'total_pages' => $totalPages,
        'total_items' => $total,
        'items_per_page' => $limit,
        'has_next' => $hasNext,
        'has_prev' => $hasPrev
    ];

    ApiResponse::paginated($messages, $pagination, 'Messages retrieved successfully');
}

function handleUpdateMessage($db)
{
    // SECURITY: Validate CSRF token
    require_once '../utils/CsrfProtection.php';
    CsrfProtection::requireToken();
    
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    $messageId = intval($_GET['id'] ?? 0);
    if (!$messageId) {
        ApiResponse::error('Message ID is required', 400);
    }

    // Validate status if provided
    if (isset($input['status'])) {
        if (!in_array($input['status'], ['new', 'read', 'replied', 'archived'])) {
            ApiResponse::error('Invalid status value', 400);
        }
    }

    // Build update query
    $updateFields = [];
    $params = [];

    if (isset($input['status'])) {
        $updateFields[] = "status = ?";
        $params[] = $input['status'];
    }

    if (empty($updateFields)) {
        ApiResponse::error('No valid fields to update', 400);
    }

    $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
    $params[] = $messageId;

    $sql = "UPDATE contact_messages SET " . implode(', ', $updateFields) . " WHERE id = ?";

    $stmt = $db->query($sql, $params);

    if ($stmt->rowCount() > 0) {
        ApiResponse::success(null, 'Message updated successfully');
    } else {
        ApiResponse::notFound('Message not found');
    }
}

function handleDeleteMessage($db)
{
    // SECURITY: Validate CSRF token
    require_once '../utils/CsrfProtection.php';
    CsrfProtection::requireToken();
    
    $messageId = intval($_GET['id'] ?? 0);

    if (!$messageId) {
        ApiResponse::error('Message ID is required', 400);
    }

    // Use the datos table instead of contact_messages
    $sql = "DELETE FROM datos WHERE id = ?";
    $stmt = $db->query($sql, [$messageId]);

    if ($stmt->rowCount() > 0) {
        ApiResponse::success(null, 'Message deleted successfully');
    } else {
        ApiResponse::notFound('Message not found');
    }
}

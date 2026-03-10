<?php

/**
 * Blog API Endpoint
 * Handles CRUD operations for blog posts (poems and letters)
 */

// CRITICAL: Set CORS headers IMMEDIATELY - no output before this point
// SIMPLIFIED HARDCODED CORS - Always works in production

// ========================================
// CORS HEADERS - MUST BE ABSOLUTELY FIRST
// ========================================
// Suppress any output that might interfere
ob_start();

// Get origin and detect environment
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
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

// Set CORS headers - MUST be before any output
header("Access-Control-Allow-Origin: $corsOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS requests IMMEDIATELY
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// Clear any accidental output before continuing
ob_end_clean();

require_once '../config/database.php';
require_once '../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];

// Initialize database connection with error handling
try {
    $db = Database::getInstance();
} catch (Exception $e) {
    error_log("Blog API - Database connection failed: " . $e->getMessage());
    ApiResponse::serverError('Database connection failed. Please check your database configuration.');
}

try {
    // Log the request method for debugging
    error_log("Blog API - Request method: " . $method);

    switch ($method) {
        case 'GET':
            // GET requests are public - no CSRF or authentication required
            handleGetBlogPosts($db);
            break;
        case 'POST':
            handleCreateBlogPost($db);
            break;
        case 'PUT':
        case 'PATCH':
            handleUpdateBlogPost($db);
            break;
        case 'DELETE':
            handleDeleteBlogPost($db);
            break;
        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Blog API error: " . $e->getMessage());
    error_log("Blog API error trace: " . $e->getTraceAsString());
    $errorMessage = $e->getMessage();

    // Check if it's a CSRF error (shouldn't happen for GET)
    if (strpos($errorMessage, "CSRF") !== false || strpos($errorMessage, "csrf") !== false) {
        error_log("Blog API - CSRF error detected for method: " . $method);
        if ($method === 'GET') {
            // This shouldn't happen - GET doesn't require CSRF
            ApiResponse::serverError('Unexpected CSRF validation error for GET request. Please check server configuration.');
        } else {
            ApiResponse::error('Invalid or missing CSRF token', 403);
        }
    } elseif (strpos($errorMessage, "doesn't exist") !== false || strpos($errorMessage, "Base table or view not found") !== false) {
        ApiResponse::error('Blog table not found. Please create the blog_posts table in your database. See database_schema.sql for the table structure.', 500);
    } else {
        ApiResponse::serverError('An error occurred while processing the request: ' . $errorMessage);
    }
}

function handleGetBlogPosts($db)
{
    // GET requests don't require CSRF token - this is a public endpoint
    // No authentication or CSRF validation needed for reading blog posts
    try {
        // Check if table exists
        try {
            $checkTable = $db->query("SHOW TABLES LIKE 'blog_posts'");
            if (!$checkTable->fetch()) {
                ApiResponse::error('Blog table not found. Please create the blog_posts table in your database. See database_schema.sql for the table structure.', 500);
            }
        } catch (Exception $e) {
            error_log("Blog API - Table check failed: " . $e->getMessage());
            ApiResponse::serverError('Database error: ' . $e->getMessage());
        }

        // SECURITY: Sanitize and validate input parameters
        $type = isset($_GET['type']) && !empty($_GET['type']) ? InputValidator::sanitizeString($_GET['type'], 50) : null;
        $status = isset($_GET['status']) && !empty($_GET['status']) ? InputValidator::sanitizeString($_GET['status'], 50) : 'published';
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        // SECURITY: Validate status and type values
        if ($status && !in_array($status, ['draft', 'published', 'archived'])) {
            $status = 'published';
        }
        if ($type && !in_array($type, ['poem', 'letter'])) {
            $type = null;
        }
        if ($id !== null && $id <= 0) {
            $id = null;
        }

        // SECURITY: If specific ID requested, validate and use prepared statement
        if ($id) {
            $sql = "SELECT *, COALESCE(likes_count, 0) as likes_count, COALESCE(views_count, 0) as views_count FROM blog_posts WHERE id = ?";
            $stmt = $db->query($sql, [intval($id)]);
            $post = $stmt->fetch();

            if (!$post) {
                ApiResponse::notFound('Blog post not found');
            }

            ApiResponse::success($post);
        }

        // Build query - include likes_count and views_count
        $sql = "SELECT *, COALESCE(likes_count, 0) as likes_count, COALESCE(views_count, 0) as views_count FROM blog_posts WHERE 1=1";
        $params = [];

        if ($status && $status !== 'all') {
            $sql .= " AND status = ?";
            $params[] = $status;
        }

        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $db->query($sql, $params);
        $posts = $stmt->fetchAll();

        ApiResponse::success($posts);
    } catch (Exception $e) {
        error_log("Get blog posts error: " . $e->getMessage());
        error_log("Get blog posts error trace: " . $e->getTraceAsString());
        // Check if it's a database/table error
        $errorMessage = $e->getMessage();
        if (
            strpos($errorMessage, "doesn't exist") !== false ||
            strpos($errorMessage, "Base table or view not found") !== false ||
            (strpos($errorMessage, "Table") !== false && strpos($errorMessage, "doesn't exist") !== false)
        ) {
            ApiResponse::error('Blog table not found. Please create the blog_posts table in your database. See database_schema.sql for the table structure.', 500);
        } else {
            ApiResponse::serverError('Failed to retrieve blog posts: ' . $errorMessage);
        }
    }
}

function handleCreateBlogPost($db)
{
    // SECURITY: Use proper session manager for authentication
    require_once '../auth/session.php';
    require_once '../utils/CsrfProtection.php';

    // Start session first
    SessionManager::startSession();

    // Check authentication
    SessionManager::requireAuth();

    // SECURITY: Validate CSRF token
    CsrfProtection::requireToken();

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    // SECURITY: Validate and sanitize required fields
    $errors = [];
    if (empty($input['title']) || empty($input['content'])) {
        $errors['title'] = 'Title and content are required';
    }

    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }

    try {
        // SECURITY: Sanitize all input
        $title = InputValidator::sanitizeString($input['title'], 200);
        $content = InputValidator::sanitizeText($input['content'], 50000);
        $type = isset($input['type']) && in_array($input['type'], ['poem', 'letter'])
            ? $input['type']
            : 'poem';
        $status = isset($input['status']) && in_array($input['status'], ['draft', 'published', 'archived'])
            ? $input['status']
            : 'draft';
        $imageUrl = isset($input['image_url'])
            ? InputValidator::sanitizeString($input['image_url'], 500)
            : null;

        // SECURITY: Validate title and content length
        if (strlen($title) < 2 || strlen($title) > 200) {
            ApiResponse::validationError(['title' => 'Title must be between 2 and 200 characters']);
        }
        if (strlen($content) < 10 || strlen($content) > 50000) {
            ApiResponse::validationError(['content' => 'Content must be between 10 and 50000 characters']);
        }

        // SECURITY: Validate image URL format if provided
        if ($imageUrl && !filter_var($imageUrl, FILTER_VALIDATE_URL) && !preg_match('/^\/uploads\/[a-zA-Z0-9_\/\-\.]+$/', $imageUrl)) {
            $imageUrl = null; // Invalid URL, set to null
        }

        $sql = "INSERT INTO blog_posts (title, content, image_url, type, status) VALUES (?, ?, ?, ?, ?)";
        $db->query($sql, [$title, $content, $imageUrl, $type, $status]);

        $postId = $db->lastInsertId();

        // Get the created post
        $sql = "SELECT * FROM blog_posts WHERE id = ?";
        $stmt = $db->query($sql, [$postId]);
        $post = $stmt->fetch();

        ApiResponse::success($post, 'Blog post created successfully', 201);
    } catch (Exception $e) {
        error_log("Create blog post error: " . $e->getMessage());
        ApiResponse::serverError('Failed to create blog post: ' . $e->getMessage());
    }
}

function handleUpdateBlogPost($db)
{
    // SECURITY: Use proper session manager for authentication
    require_once '../auth/session.php';
    require_once '../utils/CsrfProtection.php';

    // Start session first
    SessionManager::startSession();

    // Check authentication
    SessionManager::requireAuth();

    // SECURITY: Validate CSRF token
    CsrfProtection::requireToken();

    // SECURITY: Validate and sanitize ID parameter
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if (!$id || $id <= 0) {
        ApiResponse::error('Valid post ID is required', 400);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    // SECURITY: Validate ID is positive integer
    if (!is_numeric($id) || $id <= 0) {
        ApiResponse::error('Invalid post ID', 400);
    }

    try {
        // SECURITY: Check if post exists and user has permission
        $checkSql = "SELECT id FROM blog_posts WHERE id = ?";
        $checkStmt = $db->query($checkSql, [intval($id)]);
        if (!$checkStmt->fetch()) {
            ApiResponse::notFound('Blog post not found');
        }

        // SECURITY: Build update query with proper sanitization
        $updates = [];
        $params = [];

        if (isset($input['title'])) {
            $title = InputValidator::sanitizeString($input['title'], 200);
            if (strlen($title) < 2 || strlen($title) > 200) {
                ApiResponse::validationError(['title' => 'Title must be between 2 and 200 characters']);
            }
            $updates[] = "title = ?";
            $params[] = $title;
        }

        if (isset($input['content'])) {
            $content = InputValidator::sanitizeText($input['content'], 50000);
            if (strlen($content) < 10 || strlen($content) > 50000) {
                ApiResponse::validationError(['content' => 'Content must be between 10 and 50000 characters']);
            }
            $updates[] = "content = ?";
            $params[] = $content;
        }

        if (isset($input['image_url'])) {
            $imageUrl = !empty($input['image_url'])
                ? InputValidator::sanitizeString($input['image_url'], 500)
                : null;
            // SECURITY: Validate image URL format if provided
            if ($imageUrl && !filter_var($imageUrl, FILTER_VALIDATE_URL) && !preg_match('/^\/uploads\/[a-zA-Z0-9_\/\-\.]+$/', $imageUrl)) {
                $imageUrl = null; // Invalid URL, set to null
            }
            $updates[] = "image_url = ?";
            $params[] = $imageUrl;
        }

        // SECURITY: Validate type and status values
        if (isset($input['type'])) {
            if (!in_array($input['type'], ['poem', 'letter'])) {
                ApiResponse::validationError(['type' => 'Invalid type. Must be "poem" or "letter"']);
            }
            $updates[] = "type = ?";
            $params[] = $input['type'];
        }

        if (isset($input['status'])) {
            if (!in_array($input['status'], ['draft', 'published', 'archived'])) {
                ApiResponse::validationError(['status' => 'Invalid status. Must be "draft", "published", or "archived"']);
            }
            $updates[] = "status = ?";
            $params[] = $input['status'];
        }

        // SECURITY: Ensure we have updates to prevent empty updates
        if (empty($updates)) {
            ApiResponse::error('No valid fields to update', 400);
        }

        $sql = "UPDATE blog_posts SET " . implode(", ", $updates) . " WHERE id = ?";
        $params[] = intval($id); // SECURITY: Ensure ID is integer
        $db->query($sql, $params);

        // Get updated post
        $sql = "SELECT * FROM blog_posts WHERE id = ?";
        $stmt = $db->query($sql, [intval($id)]);
        $post = $stmt->fetch();

        ApiResponse::success($post, 'Blog post updated successfully');
    } catch (Exception $e) {
        error_log("Update blog post error: " . $e->getMessage());
        ApiResponse::serverError('Failed to update blog post: ' . $e->getMessage());
    }
}

function handleDeleteBlogPost($db)
{
    // SECURITY: Use proper session manager for authentication
    require_once '../auth/session.php';
    require_once '../utils/CsrfProtection.php';

    // Start session first
    SessionManager::startSession();

    // Check authentication
    SessionManager::requireAuth();

    // SECURITY: Validate CSRF token
    CsrfProtection::requireToken();

    // SECURITY: Validate and sanitize ID parameter
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;

    if (!$id || $id <= 0) {
        ApiResponse::error('Valid post ID is required', 400);
    }

    try {
        // SECURITY: Check if post exists
        $checkSql = "SELECT id FROM blog_posts WHERE id = ?";
        $checkStmt = $db->query($checkSql, [intval($id)]);
        if (!$checkStmt->fetch()) {
            ApiResponse::notFound('Blog post not found');
        }

        // SECURITY: Delete with validated ID
        $sql = "DELETE FROM blog_posts WHERE id = ?";
        $db->query($sql, [intval($id)]);

        ApiResponse::success(null, 'Blog post deleted successfully');
    } catch (Exception $e) {
        error_log("Delete blog post error: " . $e->getMessage());
        ApiResponse::serverError('Failed to delete blog post: ' . $e->getMessage());
    }
}

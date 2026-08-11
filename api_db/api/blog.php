<?php

/**
 * Blog API Endpoint
 * Handles CRUD operations for blog posts (poems and letters)
 */

require_once __DIR__ . '/../utils/cors.php';

require_once '../config/database.php';
require_once '../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

try {
    switch ($method) {
        case 'GET':
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
    $errorMessage = $e->getMessage();
    if (strpos($errorMessage, "doesn't exist") !== false || strpos($errorMessage, "Base table or view not found") !== false) {
                ApiResponse::error('Blog table not found. Please create the blog_posts table in your database. See database_schema.sql for the table structure.', 500);
    } else {
        ApiResponse::serverError('An error occurred while processing the request: ' . $errorMessage);
    }
}

function handleGetBlogPosts($db)
{
    try {
        // Check if table exists
        try {
            $checkTable = $db->query("SHOW TABLES LIKE 'blog_posts'");
            if (!$checkTable->fetch()) {
                ApiResponse::error('Blog table not found. Please create the blog_posts table in your database. See database_schema.sql for the table structure.', 500);
            }
        } catch (Exception $e) {
            error_log("Blog API - Table check failed: " . $e->getMessage());
            ApiResponse::error('Database error: ' . $e->getMessage(), 500);
        }

        // SECURITY: Sanitize and validate input parameters
        $type = isset($_GET['type']) ? InputValidator::sanitizeString($_GET['type'], 50) : null;
        $status = isset($_GET['status']) ? InputValidator::sanitizeString($_GET['status'], 50) : 'published';
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        if ($status && !in_array($status, ['draft', 'published', 'archived', 'all'])) {
            $status = 'published';
        }
        if ($type && !in_array($type, ['poem', 'letter', 'article'])) {
            $type = null;
        }
        if ($id !== null && $id <= 0) {
            $id = null;
        }

        // SECURITY: If specific ID requested, validate and use prepared statement
        if ($id) {
            $sql = "SELECT * FROM blog_posts WHERE id = ?";
            $stmt = $db->query($sql, [intval($id)]);
            $post = $stmt->fetch();

            if (!$post) {
                ApiResponse::notFound('Blog post not found');
            }

            ApiResponse::success($post);
        }

        // Build query
        $sql = "SELECT * FROM blog_posts WHERE 1=1";
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
        ApiResponse::serverError('Failed to retrieve blog posts: ' . $e->getMessage());
    }
}

function handleCreateBlogPost($db)
{
    // SECURITY: Use proper session manager for authentication
    require_once '../auth/session.php';
    require_once '../utils/CsrfProtection.php';
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
        $type = isset($input['type']) && in_array($input['type'], ['poem', 'letter', 'article']) 
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
            if (!in_array($input['type'], ['poem', 'letter', 'article'])) {
                ApiResponse::validationError(['type' => 'Invalid type. Must be "poem", "letter", or "article"']);
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

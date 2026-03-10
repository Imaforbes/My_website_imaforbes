<?php

/**
 * Blog Like API Endpoint
 * Handles liking and unliking blog posts
 */

// CRITICAL: Set CORS headers IMMEDIATELY - no output before this point
// Turn off output buffering to prevent any output before headers
if (ob_get_level()) {
    ob_end_clean();
}

// Get origin and detect environment
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';

// Extract origin from referer if needed
if (empty($origin) && !empty($_SERVER['HTTP_REFERER'])) {
    $parsed = parse_url($_SERVER['HTTP_REFERER']);
    if ($parsed && isset($parsed['scheme']) && isset($parsed['host'])) {
        $origin = $parsed['scheme'] . '://' . $parsed['host'];
    }
}

// Detect environment: LOCAL or PRODUCTION
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && 
     strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
);

// Determine CORS origin
if ($isProduction) {
    // PRODUCTION: Allow both www and non-www versions
    if (!empty($origin)) {
        // Check if origin is imaforbes.com (with or without www)
        if (strpos($origin, 'imaforbes.com') !== false) {
            $corsOrigin = $origin;
        } else {
            // Default to www version
            $corsOrigin = 'https://www.imaforbes.com';
        }
    } else {
        // No origin header, default to www
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    // DEVELOPMENT: Allow localhost origins
    $corsOrigin = 'http://localhost:5173';
    if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
        $corsOrigin = $origin;
    }
}

// Set CORS headers - MUST be set before any output
header("Access-Control-Allow-Origin: $corsOrigin", true);
header('Access-Control-Allow-Methods: POST, GET, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);

// Handle preflight OPTIONS requests - MUST be handled before any other code
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once '../../config/database.php';
require_once '../../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

// Get client IP address
function getClientIp() {
    $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

try {
    switch ($method) {
        case 'POST':
            handleLikePost($db);
            break;
        case 'GET':
            handleGetLikeStatus($db);
            break;
        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Blog Like API error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred: ' . $e->getMessage());
}

function handleLikePost($db) {
    // Check if blog_likes table exists
    try {
        $tableCheck = $db->query("SHOW TABLES LIKE 'blog_likes'");
        if (!$tableCheck->fetch()) {
            ApiResponse::serverError('Blog likes table not found. Please run the migration: migrations/add_blog_likes_views.sql');
        }
    } catch (Exception $e) {
        error_log("Blog Like API - Table check error: " . $e->getMessage());
    }
    
    // Check if likes_count column exists
    try {
        $columnCheck = $db->query("SHOW COLUMNS FROM blog_posts LIKE 'likes_count'");
        if (!$columnCheck->fetch()) {
            ApiResponse::serverError('likes_count column not found in blog_posts table. Please run the migration: migrations/add_blog_likes_views.sql');
        }
    } catch (Exception $e) {
        error_log("Blog Like API - Column check error: " . $e->getMessage());
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['post_id'])) {
        ApiResponse::error('Post ID is required', 400);
    }
    
    $postId = intval($input['post_id']);
    $ipAddress = getClientIp();
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    // Check if post exists
    $checkSql = "SELECT id, COALESCE(likes_count, 0) as likes_count FROM blog_posts WHERE id = ?";
    $checkStmt = $db->query($checkSql, [$postId]);
    $post = $checkStmt->fetch();
    
    if (!$post) {
        ApiResponse::notFound('Blog post not found');
    }
    
    $currentLikesCount = intval($post['likes_count']);
    
    // Check if user already liked this post
    $likeSql = "SELECT id FROM blog_likes WHERE post_id = ? AND ip_address = ?";
    $likeStmt = $db->query($likeSql, [$postId, $ipAddress]);
    $existingLike = $likeStmt->fetch();
    
    if ($existingLike) {
        // Unlike: Remove like and decrement count
        $deleteSql = "DELETE FROM blog_likes WHERE id = ?";
        $db->query($deleteSql, [$existingLike['id']]);
        
        $newCount = max(0, $currentLikesCount - 1);
        $updateSql = "UPDATE blog_posts SET likes_count = ? WHERE id = ?";
        $db->query($updateSql, [$newCount, $postId]);
        
        ApiResponse::success([
            'liked' => false,
            'likes_count' => $newCount
        ], 'Post unliked successfully');
    } else {
        // Like: Add like and increment count
        try {
            $insertSql = "INSERT INTO blog_likes (post_id, ip_address, user_agent) VALUES (?, ?, ?)";
            $db->query($insertSql, [$postId, $ipAddress, $userAgent]);
        } catch (Exception $e) {
            // If insert fails (e.g., duplicate), check if like already exists
            $likeStmt = $db->query($likeSql, [$postId, $ipAddress]);
            $existingLike = $likeStmt->fetch();
            if ($existingLike) {
                // Like already exists, treat as unlike
                $deleteSql = "DELETE FROM blog_likes WHERE id = ?";
                $db->query($deleteSql, [$existingLike['id']]);
                $newCount = max(0, $currentLikesCount - 1);
                $updateSql = "UPDATE blog_posts SET likes_count = ? WHERE id = ?";
                $db->query($updateSql, [$newCount, $postId]);
                ApiResponse::success([
                    'liked' => false,
                    'likes_count' => $newCount
                ], 'Post unliked successfully');
                return;
            }
            throw $e;
        }
        
        $newCount = $currentLikesCount + 1;
        $updateSql = "UPDATE blog_posts SET likes_count = ? WHERE id = ?";
        $db->query($updateSql, [$newCount, $postId]);
        
        ApiResponse::success([
            'liked' => true,
            'likes_count' => $newCount
        ], 'Post liked successfully');
    }
}

function handleGetLikeStatus($db) {
    // Check if blog_likes table exists (but don't fail if it doesn't - return default values)
    $tableExists = true;
    try {
        $tableCheck = $db->query("SHOW TABLES LIKE 'blog_likes'");
        if (!$tableCheck->fetch()) {
            $tableExists = false;
        }
    } catch (Exception $e) {
        $tableExists = false;
        error_log("Blog Like API - Table check error: " . $e->getMessage());
    }
    
    $postId = isset($_GET['post_id']) ? intval($_GET['post_id']) : null;
    
    if (!$postId) {
        ApiResponse::error('Post ID is required', 400);
    }
    
    $ipAddress = getClientIp();
    
    // Check if post exists - use COALESCE to handle missing column gracefully
    try {
    $checkSql = "SELECT id, COALESCE(likes_count, 0) as likes_count FROM blog_posts WHERE id = ?";
    $checkStmt = $db->query($checkSql, [$postId]);
    $post = $checkStmt->fetch();
    } catch (Exception $e) {
        // If column doesn't exist, try without it
        $checkSql = "SELECT id FROM blog_posts WHERE id = ?";
        $checkStmt = $db->query($checkSql, [$postId]);
        $post = $checkStmt->fetch();
        if ($post) {
            $post['likes_count'] = 0;
        }
    }
    
    if (!$post) {
        ApiResponse::notFound('Blog post not found');
    }
    
    $likesCount = isset($post['likes_count']) ? intval($post['likes_count']) : 0;
    $liked = false;
    
    // Check if user has liked this post (only if table exists)
    if ($tableExists) {
        try {
    $likeSql = "SELECT id FROM blog_likes WHERE post_id = ? AND ip_address = ?";
    $likeStmt = $db->query($likeSql, [$postId, $ipAddress]);
    $existingLike = $likeStmt->fetch();
            $liked = $existingLike !== false;
        } catch (Exception $e) {
            error_log("Blog Like API - Error checking like status: " . $e->getMessage());
            $liked = false;
        }
    }
    
    ApiResponse::success([
        'liked' => $liked,
        'likes_count' => $likesCount
    ]);
}


<?php

/**
 * Blog View Tracking API Endpoint
 * Tracks views for blog posts
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
header('Access-Control-Allow-Methods: POST, OPTIONS', true);
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

if ($method !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

try {
    // Check if blog_views table exists
    try {
        $tableCheck = $db->query("SHOW TABLES LIKE 'blog_views'");
        if (!$tableCheck->fetch()) {
            ApiResponse::serverError('Blog views table not found. Please run the migration: migrations/add_blog_likes_views.sql');
        }
    } catch (Exception $e) {
        error_log("Blog View API - Table check error: " . $e->getMessage());
    }
    
    // Check if views_count column exists
    try {
        $columnCheck = $db->query("SHOW COLUMNS FROM blog_posts LIKE 'views_count'");
        if (!$columnCheck->fetch()) {
            ApiResponse::serverError('views_count column not found in blog_posts table. Please run the migration: migrations/add_blog_likes_views.sql');
        }
    } catch (Exception $e) {
        error_log("Blog View API - Column check error: " . $e->getMessage());
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['post_id'])) {
        ApiResponse::error('Post ID is required', 400);
    }
    
    $postId = intval($input['post_id']);
    $ipAddress = getClientIp();
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    // Check if post exists
    $checkSql = "SELECT id, COALESCE(views_count, 0) as views_count FROM blog_posts WHERE id = ?";
    $checkStmt = $db->query($checkSql, [$postId]);
    $post = $checkStmt->fetch();
    
    if (!$post) {
        ApiResponse::notFound('Blog post not found');
    }
    
    $currentViewsCount = intval($post['views_count']);
    
    // Check if this IP already viewed this post in the last 24 hours (to prevent spam)
    $checkViewSql = "SELECT id FROM blog_views WHERE post_id = ? AND ip_address = ? AND viewed_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)";
    $checkViewStmt = $db->query($checkViewSql, [$postId, $ipAddress]);
    $recentView = $checkViewStmt->fetch();
    
    if (!$recentView) {
        // Record the view
        $insertSql = "INSERT INTO blog_views (post_id, ip_address, user_agent) VALUES (?, ?, ?)";
        $db->query($insertSql, [$postId, $ipAddress, $userAgent]);
        
        // Increment view count
        $newCount = $currentViewsCount + 1;
        $updateSql = "UPDATE blog_posts SET views_count = ? WHERE id = ?";
        $db->query($updateSql, [$newCount, $postId]);
        
        ApiResponse::success([
            'views_count' => $newCount,
            'view_recorded' => true
        ], 'View recorded successfully');
    } else {
        // View already recorded in last 24 hours
        ApiResponse::success([
            'views_count' => $currentViewsCount,
            'view_recorded' => false
        ], 'View already recorded');
    }
} catch (Exception $e) {
    $errorMessage = $e->getMessage();
    error_log("Blog View API error: " . $errorMessage);
    
    // Check for common database errors
    if (strpos($errorMessage, "doesn't exist") !== false || 
        strpos($errorMessage, "Base table or view not found") !== false ||
        strpos($errorMessage, "Unknown column") !== false) {
        ApiResponse::serverError('Database schema error. Please run the migration: migrations/add_blog_likes_views.sql. Error: ' . $errorMessage);
    } else {
        ApiResponse::serverError('An error occurred: ' . $errorMessage);
    }
}


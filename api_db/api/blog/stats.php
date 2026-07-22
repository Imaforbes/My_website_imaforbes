<?php

/**
 * Blog Statistics API Endpoint
 * Returns statistics about blog posts (views, likes, etc.)
 * Requires admin authentication
 */

// CRITICAL: Set CORS headers IMMEDIATELY - no output before this point
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
    if (!empty($origin) && strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    } else {
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    $corsOrigin = 'http://localhost:5173';
    if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
        $corsOrigin = $origin;
    }
}

// Set CORS headers
header("Access-Control-Allow-Origin: $corsOrigin");
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

ob_end_clean();

require_once '../../config/database.php';
require_once '../../config/response.php';
require_once '../../auth/session.php';

// Check authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$isAuthenticated = (
    isset($_SESSION['admin_user_id']) ||
    (isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true) ||
    isset($_SESSION['admin_username'])
);

if (!$isAuthenticated) {
    ApiResponse::unauthorized('Authentication required');
}

$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getInstance();

if ($method !== 'GET') {
    ApiResponse::error('Method not allowed', 405);
}

try {
    $postId = isset($_GET['post_id']) ? intval($_GET['post_id']) : null;

    if ($postId) {
        // Get statistics for a specific post
        getPostStats($db, $postId);
    } else {
        // Get overall statistics
        getOverallStats($db);
    }
} catch (Exception $e) {
    error_log("Blog Stats API error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred: ' . $e->getMessage());
}

function getPostStats($db, $postId)
{
    // Get post details
    $postSql = "SELECT id, title, views_count, likes_count, created_at FROM blog_posts WHERE id = ?";
    $postStmt = $db->query($postSql, [$postId]);
    $post = $postStmt->fetch();

    if (!$post) {
        ApiResponse::notFound('Blog post not found');
    }

    // Get total likes
    $likesSql = "SELECT COUNT(*) as total FROM blog_likes WHERE post_id = ?";
    $likesStmt = $db->query($likesSql, [$postId]);
    $likesResult = $likesStmt->fetch();

    // Get total views
    $viewsSql = "SELECT COUNT(*) as total FROM blog_views WHERE post_id = ?";
    $viewsStmt = $db->query($viewsSql, [$postId]);
    $viewsResult = $viewsStmt->fetch();

    // Get views in last 7 days
    $views7DaysSql = "SELECT COUNT(*) as total FROM blog_views WHERE post_id = ? AND viewed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)";
    $views7DaysStmt = $db->query($views7DaysSql, [$postId]);
    $views7DaysResult = $views7DaysStmt->fetch();

    // Get views in last 30 days
    $views30DaysSql = "SELECT COUNT(*) as total FROM blog_views WHERE post_id = ? AND viewed_at > DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $views30DaysStmt = $db->query($views30DaysSql, [$postId]);
    $views30DaysResult = $views30DaysStmt->fetch();

    ApiResponse::success([
        'post_id' => $postId,
        'title' => $post['title'],
        'views_count' => intval($post['views_count']),
        'likes_count' => intval($post['likes_count']),
        'total_likes' => intval($likesResult['total']),
        'total_views' => intval($viewsResult['total']),
        'views_last_7_days' => intval($views7DaysResult['total']),
        'views_last_30_days' => intval($views30DaysResult['total']),
        'created_at' => $post['created_at']
    ]);
}

function getOverallStats($db)
{
    // Get total posts
    $totalPostsSql = "SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'";
    $totalPostsStmt = $db->query($totalPostsSql);
    $totalPostsResult = $totalPostsStmt->fetch();

    // Get total views
    $totalViewsSql = "SELECT SUM(views_count) as total FROM blog_posts";
    $totalViewsStmt = $db->query($totalViewsSql);
    $totalViewsResult = $totalViewsStmt->fetch();

    // Get total likes
    $totalLikesSql = "SELECT SUM(likes_count) as total FROM blog_posts";
    $totalLikesStmt = $db->query($totalLikesSql);
    $totalLikesResult = $totalLikesStmt->fetch();

    // Get most viewed posts
    $mostViewedSql = "SELECT id, title, views_count, likes_count FROM blog_posts WHERE status = 'published' ORDER BY views_count DESC LIMIT 10";
    $mostViewedStmt = $db->query($mostViewedSql);
    $mostViewed = $mostViewedStmt->fetchAll();

    // Get most liked posts
    $mostLikedSql = "SELECT id, title, views_count, likes_count FROM blog_posts WHERE status = 'published' ORDER BY likes_count DESC LIMIT 10";
    $mostLikedStmt = $db->query($mostLikedSql);
    $mostLiked = $mostLikedStmt->fetchAll();

    // Get views in last 7 days
    $views7DaysSql = "SELECT COUNT(*) as total FROM blog_views WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 7 DAY)";
    $views7DaysStmt = $db->query($views7DaysSql);
    $views7DaysResult = $views7DaysStmt->fetch();

    // Get views in last 30 days
    $views30DaysSql = "SELECT COUNT(*) as total FROM blog_views WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 30 DAY)";
    $views30DaysStmt = $db->query($views30DaysSql);
    $views30DaysResult = $views30DaysStmt->fetch();

    ApiResponse::success([
        'total_posts' => intval($totalPostsResult['total']),
        'total_views' => intval($totalViewsResult['total'] ?? 0),
        'total_likes' => intval($totalLikesResult['total'] ?? 0),
        'views_last_7_days' => intval($views7DaysResult['total']),
        'views_last_30_days' => intval($views30DaysResult['total']),
        'most_viewed' => $mostViewed,
        'most_liked' => $mostLiked
    ]);
}

<?php

/**
 * Admin Dashboard Statistics API Endpoint
 */

require_once '../../config/database.php';
require_once '../../config/response.php';
require_once '../../auth/session.php';

// Set CORS headers
CorsHandler::setHeaders();

// Check authentication
SessionManager::requireAuth();

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::error('Method not allowed', 405);
}

try {
    $db = Database::getInstance();

    // Get contact messages statistics
    // NOTE: Using 'datos' table (not 'contact_messages') as per database schema
    $messagesStats = [];

    // Total messages
    $stmt = $db->query("SELECT COUNT(*) as total FROM datos");
    $messagesStats['total'] = $stmt->fetch()['total'];

    // Messages by status (datos table doesn't have status column, so skip this)
    $messagesStats['by_status'] = [];

    // Messages from last 30 days
    $stmt = $db->query("SELECT COUNT(*) as count FROM datos WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
    $messagesStats['last_30_days'] = $stmt->fetch()['count'];

    // Messages from last 7 days
    $stmt = $db->query("SELECT COUNT(*) as count FROM datos WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
    $messagesStats['last_7_days'] = $stmt->fetch()['count'];

    // Get projects statistics
    $projectsStats = [];

    // Total projects
    $stmt = $db->query("SELECT COUNT(*) as total FROM projects");
    $projectsStats['total'] = $stmt->fetch()['total'];

    // Projects by status
    $stmt = $db->query("SELECT status, COUNT(*) as count FROM projects GROUP BY status");
    $statusCounts = $stmt->fetchAll();

    $projectsStats['by_status'] = [];
    foreach ($statusCounts as $row) {
        $projectsStats['by_status'][$row['status']] = $row['count'];
    }

    // Featured projects
    $stmt = $db->query("SELECT COUNT(*) as count FROM projects WHERE featured = 1");
    $projectsStats['featured'] = $stmt->fetch()['count'];

    // Recent activity (last 10 messages)
    // NOTE: Using 'datos' table with correct column names
    $stmt = $db->query("SELECT id, nombre as name, email, fecha as created_at 
                       FROM datos 
                       ORDER BY fecha DESC 
                       LIMIT 10");
    $recentMessages = $stmt->fetchAll();

    // System information
    $systemInfo = [
        'php_version' => PHP_VERSION,
        'server_time' => date('c'),
        'database_status' => 'connected'
    ];

    $stats = [
        'messages' => $messagesStats,
        'projects' => $projectsStats,
        'recent_messages' => $recentMessages,
        'system' => $systemInfo
    ];

    ApiResponse::success($stats, 'Statistics retrieved successfully');
} catch (Exception $e) {
    error_log("Stats API error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred while retrieving statistics');
}

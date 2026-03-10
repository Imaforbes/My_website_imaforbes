<?php

/**
 * Work Experiences API Endpoint
 * Handles CRUD operations for work experiences
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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}

// Clear output buffer
ob_end_clean();

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../auth/session.php';

// Initialize database connection with error handling
try {
    $db = Database::getInstance();
} catch (Exception $e) {
    error_log("Experiences API - Database connection failed: " . $e->getMessage());
    ApiResponse::serverError('Database connection failed. Please check your database configuration.');
}

$method = $_SERVER['REQUEST_METHOD'];

// Check authentication for write operations
$isWriteOperation = in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE']);
if ($isWriteOperation) {
    if (!SessionManager::isAuthenticated()) {
        ApiResponse::error('Unauthorized', 401);
    }
}

try {
    switch ($method) {
        case 'GET':
            handleGetExperiences($db);
            break;
        case 'POST':
            handleCreateExperience($db);
            break;
        case 'PUT':
        case 'PATCH':
            handleUpdateExperience($db);
            break;
        case 'DELETE':
            handleDeleteExperience($db);
            break;
        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Experiences API Error: " . $e->getMessage());
    ApiResponse::error('Internal server error', 500);
}

function handleGetExperiences($db) {
    $status = $_GET['status'] ?? 'published';
    $includeDrafts = $status === 'all';
    
    try {
        // Check if table exists first
        $checkTable = $db->query("SHOW TABLES LIKE 'work_experiences'");
        if (!$checkTable->fetch()) {
            error_log("Work experiences table does not exist");
            // Return empty array instead of error if table doesn't exist
            ApiResponse::success([], 'No experiences found');
            return;
        }
        
        if ($includeDrafts && SessionManager::isAuthenticated()) {
            // Admin can see all experiences
            $stmt = $db->query("SELECT * FROM work_experiences ORDER BY sort_order ASC, created_at DESC");
        } else {
            // Public users only see published experiences
            $stmt = $db->query("SELECT * FROM work_experiences WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC");
        }
        
        $experiences = $stmt->fetchAll();
        
        // Decode JSON fields
        foreach ($experiences as &$exp) {
            if (!empty($exp['responsibilities'])) {
                $exp['responsibilities'] = json_decode($exp['responsibilities'], true) ?: [];
            } else {
                $exp['responsibilities'] = [];
            }
            
            if (!empty($exp['technologies'])) {
                $exp['technologies'] = json_decode($exp['technologies'], true) ?: [];
            } else {
                $exp['technologies'] = [];
            }
        }
        
        ApiResponse::success($experiences);
    } catch (Exception $e) {
        error_log("Get experiences error: " . $e->getMessage());
        error_log("Get experiences error trace: " . $e->getTraceAsString());
        
        // Check if it's a table doesn't exist error
        $errorMessage = $e->getMessage();
        if (strpos($errorMessage, "doesn't exist") !== false || 
            strpos($errorMessage, "Base table or view not found") !== false ||
            strpos($errorMessage, "Table") !== false && strpos($errorMessage, "doesn't exist") !== false) {
            error_log("Work experiences table not found - returning empty array");
            // Return empty array instead of error if table doesn't exist
            ApiResponse::success([], 'No experiences found');
        } else {
            ApiResponse::error('Failed to fetch experiences: ' . $e->getMessage(), 500);
        }
    }
}

function handleCreateExperience($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        ApiResponse::error('Invalid JSON data', 400);
    }
    
    // Validation
    $errors = [];
    
    if (empty($input['title'])) {
        $errors['title'] = 'Title is required';
    }
    if (empty($input['company'])) {
        $errors['company'] = 'Company is required';
    }
    if (empty($input['period'])) {
        $errors['period'] = 'Period is required';
    }
    
    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }
    
    // Sanitize and prepare data
    $title = InputValidator::sanitizeString($input['title'], 200);
    $company = InputValidator::sanitizeString($input['company'], 200);
    $location = !empty($input['location']) ? InputValidator::sanitizeString($input['location'], 200) : null;
    $period = InputValidator::sanitizeString($input['period'], 100);
    $description = !empty($input['description']) ? InputValidator::sanitizeText($input['description'], 2000) : null;
    $responsibilities = !empty($input['responsibilities']) && is_array($input['responsibilities']) 
        ? json_encode($input['responsibilities']) 
        : null;
    $technologies = !empty($input['technologies']) && is_array($input['technologies']) 
        ? json_encode($input['technologies']) 
        : null;
    $sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
    $status = isset($input['status']) && in_array($input['status'], ['draft', 'published', 'archived']) 
        ? $input['status'] 
        : 'published';
    
    try {
        $stmt = $db->query(
            "INSERT INTO work_experiences (title, company, location, period, description, responsibilities, technologies, sort_order, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [$title, $company, $location, $period, $description, $responsibilities, $technologies, $sortOrder, $status]
        );
        
        $id = $db->lastInsertId();
        
        // Fetch the created experience
        $stmt = $db->query("SELECT * FROM work_experiences WHERE id = ?", [$id]);
        $experience = $stmt->fetch();
        
        // Decode JSON fields
        if (!empty($experience['responsibilities'])) {
            $experience['responsibilities'] = json_decode($experience['responsibilities'], true) ?: [];
        } else {
            $experience['responsibilities'] = [];
        }
        
        if (!empty($experience['technologies'])) {
            $experience['technologies'] = json_decode($experience['technologies'], true) ?: [];
        } else {
            $experience['technologies'] = [];
        }
        
        ApiResponse::success($experience, 'Experience created successfully');
    } catch (Exception $e) {
        error_log("Create experience error: " . $e->getMessage());
        ApiResponse::error('Failed to create experience', 500);
    }
}

function handleUpdateExperience($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Get ID from query string or body
    $id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($input['id']) ? (int)$input['id'] : null);
    
    if (!$id) {
        ApiResponse::error('Invalid data or missing ID', 400);
    }
    
    // Check if experience exists
    $stmt = $db->query("SELECT id FROM work_experiences WHERE id = ?", [$id]);
    if (!$stmt->fetch()) {
        ApiResponse::error('Experience not found', 404);
    }
    
    // Build update query dynamically
    $updates = [];
    $params = [];
    
    if (isset($input['title'])) {
        $updates[] = "title = ?";
        $params[] = InputValidator::sanitizeString($input['title'], 200);
    }
    if (isset($input['company'])) {
        $updates[] = "company = ?";
        $params[] = InputValidator::sanitizeString($input['company'], 200);
    }
    if (isset($input['location'])) {
        $updates[] = "location = ?";
        $params[] = InputValidator::sanitizeString($input['location'], 200);
    }
    if (isset($input['period'])) {
        $updates[] = "period = ?";
        $params[] = InputValidator::sanitizeString($input['period'], 100);
    }
    if (isset($input['description'])) {
        $updates[] = "description = ?";
        $params[] = InputValidator::sanitizeText($input['description'], 2000);
    }
    if (isset($input['responsibilities'])) {
        $updates[] = "responsibilities = ?";
        $params[] = is_array($input['responsibilities']) ? json_encode($input['responsibilities']) : null;
    }
    if (isset($input['technologies'])) {
        $updates[] = "technologies = ?";
        $params[] = is_array($input['technologies']) ? json_encode($input['technologies']) : null;
    }
    if (isset($input['sort_order'])) {
        $updates[] = "sort_order = ?";
        $params[] = (int)$input['sort_order'];
    }
    if (isset($input['status']) && in_array($input['status'], ['draft', 'published', 'archived'])) {
        $updates[] = "status = ?";
        $params[] = $input['status'];
    }
    
    if (empty($updates)) {
        ApiResponse::error('No fields to update', 400);
    }
    
    $params[] = $id;
    
    try {
        $sql = "UPDATE work_experiences SET " . implode(', ', $updates) . " WHERE id = ?";
        $db->query($sql, $params);
        
        // Fetch updated experience
        $stmt = $db->query("SELECT * FROM work_experiences WHERE id = ?", [$id]);
        $experience = $stmt->fetch();
        
        // Decode JSON fields
        if (!empty($experience['responsibilities'])) {
            $experience['responsibilities'] = json_decode($experience['responsibilities'], true) ?: [];
        } else {
            $experience['responsibilities'] = [];
        }
        
        if (!empty($experience['technologies'])) {
            $experience['technologies'] = json_decode($experience['technologies'], true) ?: [];
        } else {
            $experience['technologies'] = [];
        }
        
        ApiResponse::success($experience, 'Experience updated successfully');
    } catch (Exception $e) {
        error_log("Update experience error: " . $e->getMessage());
        ApiResponse::error('Failed to update experience', 500);
    }
}

function handleDeleteExperience($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['id'])) {
        ApiResponse::error('Invalid data or missing ID', 400);
    }
    
    $id = (int)$input['id'];
    
    // Check if experience exists
    $stmt = $db->query("SELECT id FROM work_experiences WHERE id = ?", [$id]);
    if (!$stmt->fetch()) {
        ApiResponse::error('Experience not found', 404);
    }
    
    try {
        $db->query("DELETE FROM work_experiences WHERE id = ?", [$id]);
        ApiResponse::success(['id' => $id], 'Experience deleted successfully');
    } catch (Exception $e) {
        error_log("Delete experience error: " . $e->getMessage());
        ApiResponse::error('Failed to delete experience', 500);
    }
}


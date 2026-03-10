<?php

/**
 * Projects API Endpoint
 * Handles CRUD operations for portfolio projects
 */

// CRITICAL: Set CORS headers FIRST, before any other output
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
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && strpos($host, 'localhost') === false)
);

if ($isProduction) {
    // PRODUCTION: Always allow imaforbes.com variants - NEVER return localhost
    if (!empty($origin) && strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    } else {
        $corsOrigin = 'https://imaforbes.com';
    }
} else {
    // DEVELOPMENT: Use localhost
    $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
    ];
    
    if (!empty($origin) && in_array($origin, $allowedOrigins)) {
        $corsOrigin = $origin;
    } else {
        $corsOrigin = 'http://localhost:5173';
    }
}
*/

// Detect environment: LOCAL or PRODUCTION
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
$isProduction = (
    strpos($host, 'imaforbes.com') !== false ||
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' && 
     strpos($host, 'localhost') === false && strpos($host, '127.0.0.1') === false)
);

if ($isProduction) {
    // PRODUCTION: Allow imaforbes.com origins
    if (!empty($origin) && strpos($origin, 'imaforbes.com') !== false) {
        $corsOrigin = $origin;
    } else {
        $corsOrigin = 'https://www.imaforbes.com';
    }
} else {
    // DEVELOPMENT: Allow localhost origins (any port)
    if (!empty($origin)) {
        if (strpos($origin, 'http://localhost:') === 0 || 
            strpos($origin, 'http://127.0.0.1:') === 0 ||
            $origin === 'http://localhost' ||
            $origin === 'http://127.0.0.1') {
            $corsOrigin = $origin;
        } else {
            $corsOrigin = 'http://localhost:5173';
        }
    } else {
        $corsOrigin = 'http://localhost:5173';
    }
}

// Set CORS headers
header("Access-Control-Allow-Origin: $corsOrigin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../config/response.php';

// Also set CORS headers using the handler (as backup)
CorsHandler::setHeaders();

$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = Database::getInstance();
    
    // Verify projects table exists on GET requests (non-blocking check)
    if ($method === 'GET') {
        try {
            $tableCheck = $db->query("SHOW TABLES LIKE 'projects'");
            if (!$tableCheck->fetch()) {
                // Table doesn't exist - try to create it
                try {
                    $createSql = "CREATE TABLE IF NOT EXISTS projects (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        title VARCHAR(200) NOT NULL,
                        description TEXT NOT NULL,
                        short_description VARCHAR(500),
                        image_url VARCHAR(500),
                        technologies JSON,
                        github_url VARCHAR(500),
                        live_url VARCHAR(500),
                        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                        featured BOOLEAN DEFAULT FALSE,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                    $db->query($createSql);
                    
                    // Create indexes (ignore errors if they already exist)
                    try {
                        $db->query("CREATE INDEX idx_projects_status ON projects(status)");
                    } catch (Exception $e) {
                        // Index may already exist
                    }
                    try {
                        $db->query("CREATE INDEX idx_projects_featured ON projects(featured)");
                    } catch (Exception $e) {
                        // Index may already exist
                    }
                    try {
                        $db->query("CREATE INDEX idx_projects_sort_order ON projects(sort_order)");
                    } catch (Exception $e) {
                        // Index may already exist
                    }
                } catch (Exception $createError) {
                    error_log("Failed to create projects table: " . $createError->getMessage());
                    ApiResponse::serverError('Projects table not found and could not be created automatically. Please run: setup.php or check_projects_table.php');
                }
            }
        } catch (Exception $checkError) {
            error_log("Table check error: " . $checkError->getMessage());
            // Continue anyway - the query will fail with a better error message
        }
    }
} catch (Exception $dbError) {
    error_log("Database connection error: " . $dbError->getMessage());
    ApiResponse::serverError('Database connection failed: ' . $dbError->getMessage());
}

try {
    switch ($method) {
        case 'GET':
            handleGetProjects($db);
            break;
        case 'POST':
            handleCreateProject($db);
            break;
        case 'PUT':
            handleUpdateProject($db);
            break;
        case 'DELETE':
            handleDeleteProject($db);
            break;
        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    $errorMessage = $e->getMessage();
    error_log("Projects API error: " . $errorMessage . "\nStack trace: " . $e->getTraceAsString());
    
    // Provide more detailed error information in development
    $detailedError = $errorMessage;
    if (strpos($errorMessage, "doesn't exist") !== false || 
        strpos($errorMessage, "Base table or view not found") !== false ||
        strpos($errorMessage, "Unknown table") !== false) {
        $detailedError = 'Projects table not found. Please run the database setup: setup.php or migrations/create_projects_table.php';
    }
    
    ApiResponse::serverError('An error occurred while processing the request: ' . $detailedError);
}

function handleGetProjects($db)
{
    try {
        $projectId = intval($_GET['id'] ?? 0);

        if ($projectId > 0) {
            // Get single project
            $sql = "SELECT * FROM projects WHERE id = ? AND status = 'published'";
            $stmt = $db->query($sql, [$projectId]);
            $project = $stmt->fetch();

            if (!$project) {
                ApiResponse::notFound('Project not found');
            }

            // Decode JSON fields
            if ($project['technologies']) {
                $project['technologies'] = json_decode($project['technologies'], true);
                // If json_decode returns null, set to empty array
                if ($project['technologies'] === null) {
                    $project['technologies'] = [];
                }
            } else {
                $project['technologies'] = [];
            }

            ApiResponse::success($project, 'Project retrieved successfully');
        } else {
            // Get all projects
            $featured = $_GET['featured'] ?? null;
            $limit = min(100, max(1, intval($_GET['limit'] ?? 20)));

            $whereConditions = ["status = 'published'"];
            $params = [];

            if ($featured === 'true') {
                $whereConditions[] = "featured = 1";
            }

            $whereClause = count($whereConditions) > 0 ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

            $sql = "SELECT id, title, description, short_description, image_url, 
                           technologies, github_url, live_url, featured, sort_order, created_at
                    FROM projects 
                    {$whereClause} 
                    ORDER BY sort_order ASC, created_at DESC 
                    LIMIT ?";

            $params[] = $limit;

            try {
                $stmt = $db->query($sql, $params);
                $projects = $stmt->fetchAll();
            } catch (Exception $queryError) {
                error_log("Projects query error: " . $queryError->getMessage());
                throw $queryError;
            }

            // Decode JSON fields for each project
            foreach ($projects as &$project) {
                if ($project['technologies']) {
                    $project['technologies'] = json_decode($project['technologies'], true);
                    // If json_decode returns null, set to empty array
                    if ($project['technologies'] === null) {
                        $project['technologies'] = [];
                    }
                } else {
                    $project['technologies'] = [];
                }
            }

            ApiResponse::success($projects, 'Projects retrieved successfully');
        }
    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
        error_log("Projects API - Get projects error: " . $errorMessage);
        
        // Check for specific database errors
        if (strpos($errorMessage, "doesn't exist") !== false || 
            strpos($errorMessage, "Base table or view not found") !== false) {
            ApiResponse::serverError('Projects table not found. Please run the database setup: setup.php');
        } else {
            ApiResponse::serverError('An error occurred while fetching projects: ' . $errorMessage);
        }
    }
}

function handleCreateProject($db)
{
    // Check authentication for admin operations
    require_once '../auth/session.php';
    require_once '../utils/CsrfProtection.php';
    if (!SessionManager::isAuthenticated()) {
        ApiResponse::unauthorized('Authentication required');
    }
    
    // SECURITY: Validate CSRF token
    CsrfProtection::requireToken();

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    // Validate required fields
    $errors = [];

    if (empty($input['title'])) {
        $errors['title'] = 'Title is required';
    }

    if (empty($input['description'])) {
        $errors['description'] = 'Description is required';
    }

    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }

    // Sanitize and validate input
    $title = InputValidator::sanitizeString($input['title'], 200);
    $description = InputValidator::sanitizeText($input['description'], 5000);
    $shortDescription = InputValidator::sanitizeString($input['short_description'] ?? '', 500);
    $imageUrl = InputValidator::sanitizeString($input['image_url'] ?? '', 500);
    $githubUrl = InputValidator::sanitizeString($input['github_url'] ?? '', 500);
    $liveUrl = InputValidator::sanitizeString($input['live_url'] ?? '', 500);
    $technologies = $input['technologies'] ?? [];
    $featured = isset($input['featured']) ? (bool)$input['featured'] : false;
    $status = $input['status'] ?? 'draft';
    $sortOrder = intval($input['sort_order'] ?? 0);

    // Validate status
    if (!in_array($status, ['draft', 'published', 'archived'])) {
        $errors['status'] = 'Invalid status value';
    }

    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }

    // Validate URLs if provided
    if ($imageUrl && !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
        $errors['image_url'] = 'Invalid image URL';
    }

    if ($githubUrl && !filter_var($githubUrl, FILTER_VALIDATE_URL)) {
        $errors['github_url'] = 'Invalid GitHub URL';
    }

    if ($liveUrl && !filter_var($liveUrl, FILTER_VALIDATE_URL)) {
        $errors['live_url'] = 'Invalid live URL';
    }

    if (!empty($errors)) {
        ApiResponse::validationError($errors);
    }

    // Insert project
    $sql = "INSERT INTO projects (title, description, short_description, image_url, 
                                technologies, github_url, live_url, featured, status, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $technologiesJson = json_encode($technologies);

    $stmt = $db->query($sql, [
        $title,
        $description,
        $shortDescription,
        $imageUrl,
        $technologiesJson,
        $githubUrl,
        $liveUrl,
        $featured,
        $status,
        $sortOrder
    ]);

    if ($stmt->rowCount() > 0) {
        $projectId = $db->lastInsertId();

        ApiResponse::success([
            'id' => $projectId,
            'title' => $title,
            'description' => $description,
            'status' => $status,
            'created_at' => date('c')
        ], 'Project created successfully', 201);
    } else {
        ApiResponse::serverError('Failed to create project');
    }
}

function handleUpdateProject($db)
{
    // Check authentication
    require_once '../auth/session.php';
    require_once '../utils/CsrfProtection.php';
    if (!SessionManager::isAuthenticated()) {
        ApiResponse::unauthorized('Authentication required');
    }
    
    // SECURITY: Validate CSRF token
    CsrfProtection::requireToken();

    $projectId = intval($_GET['id'] ?? 0);

    if (!$projectId) {
        ApiResponse::error('Project ID is required', 400);
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        ApiResponse::error('Invalid JSON input', 400);
    }

    // Build update query
    $updateFields = [];
    $params = [];

    $allowedFields = [
        'title',
        'description',
        'short_description',
        'image_url',
        'technologies',
        'github_url',
        'live_url',
        'featured',
        'status',
        'sort_order'
    ];

    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "{$field} = ?";

            if ($field === 'technologies') {
                $params[] = json_encode($input[$field]);
            } elseif ($field === 'featured') {
                $params[] = (bool)$input[$field];
            } elseif ($field === 'sort_order') {
                $params[] = intval($input[$field]);
            } else {
                $params[] = $input[$field];
            }
        }
    }

    if (empty($updateFields)) {
        ApiResponse::error('No valid fields to update', 400);
    }

    $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
    $params[] = $projectId;

    $sql = "UPDATE projects SET " . implode(', ', $updateFields) . " WHERE id = ?";

    $stmt = $db->query($sql, $params);

    if ($stmt->rowCount() > 0) {
        ApiResponse::success(null, 'Project updated successfully');
    } else {
        ApiResponse::notFound('Project not found');
    }
}

function handleDeleteProject($db)
{
    // Check authentication
    require_once '../auth/session.php';
    require_once '../utils/CsrfProtection.php';
    if (!SessionManager::isAuthenticated()) {
        ApiResponse::unauthorized('Authentication required');
    }
    
    // SECURITY: Validate CSRF token
    CsrfProtection::requireToken();

    $projectId = intval($_GET['id'] ?? 0);

    if (!$projectId) {
        ApiResponse::error('Project ID is required', 400);
    }

    $sql = "DELETE FROM projects WHERE id = ?";
    $stmt = $db->query($sql, [$projectId]);

    if ($stmt->rowCount() > 0) {
        ApiResponse::success(null, 'Project deleted successfully');
    } else {
        ApiResponse::notFound('Project not found');
    }
}

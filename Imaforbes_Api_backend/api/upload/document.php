<?php

/**
 * Document Upload API Endpoint
 */

require_once '../../config/database.php';
require_once '../../config/response.php';
require_once '../../auth/session.php';
require_once '../../utils/CsrfProtection.php';
require_once '../../utils/RateLimiter.php';

// Set CORS headers
CorsHandler::setHeaders();

// Check authentication
SessionManager::requireAuth();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

// SECURITY: Validate CSRF token
CsrfProtection::requireToken();

// SECURITY: Rate limiting - prevent upload abuse
// Allow 10 uploads per 5 minutes (300 seconds)
RateLimiter::requireLimit('upload', 10, 300);

try {
    // Check if file was uploaded
    if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
        ApiResponse::error('No file uploaded or upload error', 400);
    }

    $file = $_FILES['document'];

    // SECURITY: Validate file size FIRST (before processing)
    $maxSize = 10 * 1024 * 1024; // 10MB
    if ($file['size'] > $maxSize) {
        ApiResponse::error('File too large. Maximum size is 10MB.', 400);
    }

    // SECURITY: Validate file size is not zero
    if ($file['size'] === 0) {
        ApiResponse::error('Empty file not allowed', 400);
    }

    // SECURITY: Get file extension and validate (prevent path traversal)
    $originalName = basename($file['name']); // Prevent path traversal in filename
    $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];

    if (!in_array($fileExtension, $allowedExtensions)) {
        ApiResponse::error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.', 400);
    }

    // SECURITY: Validate MIME type from actual file content (not just extension)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    if (!in_array($detectedMimeType, $allowedMimeTypes)) {
        ApiResponse::error('Invalid file type detected. Only PDF, DOC, DOCX, and TXT files are allowed.', 400);
    }

    // SECURITY: Generate safe, unique filename (no user input in filename)
    $safeFilename = bin2hex(random_bytes(16)) . '_' . time() . '.' . $fileExtension;

    // SECURITY: Validate upload directory path (prevent path traversal)
    $uploadDir = realpath(__DIR__ . '/../../uploads/documents/');
    if ($uploadDir === false) {
        // Create directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../uploads/documents/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                ApiResponse::serverError('Failed to create upload directory');
            }
        }
        $uploadDir = realpath($uploadDir);
    }

    // SECURITY: Ensure we're in the correct directory (prevent path traversal)
    $expectedBaseDir = realpath(__DIR__ . '/../../uploads/documents/');
    if (strpos($uploadDir, $expectedBaseDir) !== 0) {
        ApiResponse::serverError('Invalid upload directory');
    }

    $uploadPath = $uploadDir . DIRECTORY_SEPARATOR . $safeFilename;

    // SECURITY: Move uploaded file with validation
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // SECURITY: Verify file was actually saved and is readable
        if (!file_exists($uploadPath) || !is_readable($uploadPath)) {
            // Clean up if file is corrupted
            if (file_exists($uploadPath)) {
                @unlink($uploadPath);
            }
            ApiResponse::serverError('Failed to verify uploaded file');
        }

        // SECURITY: Set proper file permissions (readable by web server, not executable)
        chmod($uploadPath, 0644);

        // SECURITY: Reset rate limit on successful upload
        RateLimiter::resetLimit('upload');
        // Generate public URL (relative path for security)
        $relativePath = '/uploads/documents/' . $safeFilename;

        ApiResponse::success([
            'filename' => $safeFilename,
            'url' => $relativePath,
            'size' => $file['size'],
            'type' => $detectedMimeType,
            'extension' => $fileExtension
        ], 'Document uploaded successfully');
    } else {
        ApiResponse::serverError('Failed to save file');
    }
} catch (Exception $e) {
    error_log("Document upload error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred during file upload');
}

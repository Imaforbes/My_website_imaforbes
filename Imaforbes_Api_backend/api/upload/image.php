<?php

/**
 * Image Upload API Endpoint
 * Enhanced security: file content validation, path traversal protection, MIME type verification
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
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        ApiResponse::error('No file uploaded or upload error', 400);
    }

    $file = $_FILES['image'];

    // SECURITY: Validate file size FIRST (before processing)
    // Increased to 20MB to support high-resolution images
    $maxSize = 20 * 1024 * 1024; // 20MB
    if ($file['size'] > $maxSize) {
        ApiResponse::error('File too large. Maximum size is 20MB.', 400);
    }

    // SECURITY: Validate file size is not zero
    if ($file['size'] === 0) {
        ApiResponse::error('Empty file not allowed', 400);
    }

    // SECURITY: Get file extension and validate
    $originalName = basename($file['name']); // Prevent path traversal in filename
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (!in_array($extension, $allowedExtensions)) {
        ApiResponse::error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', 400);
    }

    // SECURITY: Validate MIME type from actual file content (not just extension)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMimeType = finfo_file($finfo, $file['tmp_name']);
    // Note: finfo_close() is deprecated in PHP 8.1+. The resource is automatically freed.

    $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if (!in_array($detectedMimeType, $allowedMimeTypes)) {
        ApiResponse::error('Invalid file type detected. Only JPEG, PNG, GIF, and WebP images are allowed.', 400);
    }

    // SECURITY: Additional validation - check file signature (magic bytes)
    $fileHandle = fopen($file['tmp_name'], 'rb');
    if (!$fileHandle) {
        ApiResponse::error('Failed to read uploaded file', 400);
    }

    $fileSignature = fread($fileHandle, 12); // Read first 12 bytes
    fclose($fileHandle);

    $validSignatures = [
        'image/jpeg' => ["\xFF\xD8\xFF"],
        'image/png' => ["\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"],
        'image/gif' => ["GIF87a", "GIF89a"],
        'image/webp' => ["RIFF"] // WebP starts with RIFF, followed by WEBP
    ];

    $signatureValid = false;
    foreach ($validSignatures as $mime => $signatures) {
        if ($mime === $detectedMimeType) {
            foreach ($signatures as $signature) {
                if (strpos($fileSignature, $signature) === 0) {
                    $signatureValid = true;
                    break 2;
                }
            }
        }
    }

    // Special check for WebP (RIFF...WEBP)
    if ($detectedMimeType === 'image/webp' && strpos($fileSignature, 'RIFF') === 0) {
        $webpHeader = fread(fopen($file['tmp_name'], 'rb'), 20);
        if (strpos($webpHeader, 'WEBP') !== false) {
            $signatureValid = true;
        }
    }

    if (!$signatureValid) {
        ApiResponse::error('File signature does not match file type. Upload may be corrupted or malicious.', 400);
    }

    // SECURITY: Generate safe, unique filename (no user input in filename)
    $safeFilename = bin2hex(random_bytes(16)) . '_' . time() . '.' . $extension;

    // SECURITY: Validate upload directory path (prevent path traversal)
    $uploadDir = realpath(__DIR__ . '/../../uploads/images/');
    if ($uploadDir === false) {
        // Create directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../uploads/images/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                ApiResponse::serverError('Failed to create upload directory');
            }
        }
        $uploadDir = realpath($uploadDir);
    }

    // SECURITY: Ensure we're in the correct directory (prevent path traversal)
    $expectedBaseDir = realpath(__DIR__ . '/../../uploads/images/');
    if (strpos($uploadDir, $expectedBaseDir) !== 0) {
        ApiResponse::serverError('Invalid upload directory');
    }

    $uploadPath = $uploadDir . DIRECTORY_SEPARATOR . $safeFilename;

    // SECURITY: Additional check - ensure file doesn't already exist (very unlikely but good practice)
    if (file_exists($uploadPath)) {
        $safeFilename = bin2hex(random_bytes(16)) . '_' . time() . '_' . uniqid() . '.' . $extension;
        $uploadPath = $uploadDir . DIRECTORY_SEPARATOR . $safeFilename;
    }

    // SECURITY: Move uploaded file with validation
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        ApiResponse::serverError('Failed to save file');
    }

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

    // Generate public URL (relative path for security)
    $relativePath = '/uploads/images/' . $safeFilename;

    // SECURITY: Reset rate limit on successful upload
    RateLimiter::resetLimit('upload');

    ApiResponse::success([
        'filename' => $safeFilename,
        'url' => $relativePath,
        'size' => $file['size'],
        'type' => $detectedMimeType
    ], 'Image uploaded successfully');
} catch (Exception $e) {
    error_log("Image upload error: " . $e->getMessage());
    ApiResponse::serverError('An error occurred during file upload');
}

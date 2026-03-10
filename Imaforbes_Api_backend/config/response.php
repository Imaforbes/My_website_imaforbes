<?php

/**
 * API Response Handler
 * Standardized response format for all API endpoints
 */

class ApiResponse
{
    /**
     * Ensure CORS headers are set before sending response
     */
    private static function ensureCorsHeaders()
    {
        // DEVELOPMENT: Don't override headers if they're already set correctly
        // This prevents overwriting headers set at the beginning of API files
        if (headers_sent()) {
            return;
        }
        
        // Only set headers if Access-Control-Allow-Origin is not already set
        $headers = headers_list();
        $corsSet = false;
        foreach ($headers as $header) {
            if (stripos($header, 'Access-Control-Allow-Origin') === 0) {
                $corsSet = true;
                break;
            }
        }
        
        if ($corsSet) {
            // Headers already set, don't override
            return;
        }
        
        // If headers not set, set them now
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
        
        // Detect environment: LOCAL or PRODUCTION
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
            if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
                $corsOrigin = $origin;
            } else {
                $corsOrigin = 'http://localhost:5173';
            }
        }
        
        header("Access-Control-Allow-Origin: $corsOrigin", true);
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS', true);
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With', true);
        header('Access-Control-Allow-Credentials: true', true);
        header('Access-Control-Max-Age: 86400', true);
    }

    public static function success($data = null, $message = 'Success', $statusCode = 200)
    {
        // Ensure CORS headers are preserved
        self::ensureCorsHeaders();

        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');

        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => date('c'),
            'status_code' => $statusCode
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error($message = 'Error', $statusCode = 400, $errors = null)
    {
        // Ensure CORS headers are preserved
        self::ensureCorsHeaders();

        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');

        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('c'),
            'status_code' => $statusCode
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function validationError($errors, $message = 'Validation failed')
    {
        self::error($message, 422, $errors);
    }

    public static function notFound($message = 'Resource not found')
    {
        self::error($message, 404);
    }

    public static function unauthorized($message = 'Unauthorized')
    {
        self::error($message, 401);
    }

    public static function forbidden($message = 'Forbidden')
    {
        self::error($message, 403);
    }

    public static function serverError($message = 'Internal server error')
    {
        self::error($message, 500);
    }

    public static function paginated($data, $pagination, $message = 'Success')
    {
        // Ensure CORS headers are preserved
        self::ensureCorsHeaders();

        http_response_code(200);
        header('Content-Type: application/json; charset=UTF-8');

        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => date('c'),
            'status_code' => 200,
            'data' => [
                'items' => $data,
                'pagination' => $pagination
            ]
        ];

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * CORS Headers Handler
 */
class CorsHandler
{

    public static function setHeaders()
    {
        // DEVELOPMENT: Don't override headers if they're already set correctly
        if (headers_sent()) {
            return;
        }
        
        // Only set headers if Access-Control-Allow-Origin is not already set
        $headers = headers_list();
        $corsSet = false;
        foreach ($headers as $header) {
            if (stripos($header, 'Access-Control-Allow-Origin') === 0) {
                $corsSet = true;
                break;
            }
        }
        
        if (!$corsSet) {
            // Headers not set yet, set them now
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
            
            // Detect environment: LOCAL or PRODUCTION
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
                if (!empty($origin) && (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0)) {
                    $corsOrigin = $origin;
                } else {
                    $corsOrigin = 'http://localhost:5173';
                }
            }
            
            header("Access-Control-Allow-Origin: $corsOrigin", true);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS', true);
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token', true);
            header('Access-Control-Allow-Credentials: true', true);
            header('Access-Control-Max-Age: 86400', true);
        }

        // Security headers (always set these)
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');

        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}

/**
 * Input Validation Helper
 */
class InputValidator
{

    public static function validateEmail($email)
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function validateRequired($value, $fieldName)
    {
        if (empty($value)) {
            return "The {$fieldName} field is required.";
        }
        return null;
    }

    public static function validateLength($value, $min, $max, $fieldName)
    {
        $length = strlen($value);
        if ($length < $min) {
            return "The {$fieldName} must be at least {$min} characters.";
        }
        if ($length > $max) {
            return "The {$fieldName} must not exceed {$max} characters.";
        }
        return null;
    }

    public static function sanitizeString($value, $maxLength = 255)
    {
        if ($value === null || $value === '') {
            return null;
        }
        $value = trim($value);
        $value = strip_tags($value);
        $value = substr($value, 0, $maxLength);
        return $value;
    }

    public static function sanitizeText($value, $maxLength = 2000)
    {
        if ($value === null || $value === '') {
            return null;
        }
        $value = trim($value);
        $value = strip_tags($value);
        $value = substr($value, 0, $maxLength);
        return $value;
    }
}

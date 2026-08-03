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
        if (headers_sent()) {
            return;
        }

        require_once __DIR__ . '/../utils/cors.php';
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
        $value = trim($value);
        $value = strip_tags($value);
        $value = substr($value, 0, $maxLength);
        return $value;
    }

    public static function sanitizeText($value, $maxLength = 2000)
    {
        $value = trim($value);
        $value = strip_tags($value);
        $value = substr($value, 0, $maxLength);
        return $value;
    }
}

<?php

/**
 * Rate Limiting Utility
 * Prevents brute force attacks and API abuse
 */

class RateLimiter
{
    private static $storageDir = __DIR__ . '/../storage/rate_limits/';

    /**
     * Initialize storage directory
     */
    private static function initStorage()
    {
        if (!is_dir(self::$storageDir)) {
            mkdir(self::$storageDir, 0755, true);
        }
    }

    /**
     * Get client identifier (IP address)
     */
    private static function getClientId()
    {
        // Get real IP address (considering proxies)
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        // Check for forwarded IP (if behind proxy)
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $forwarded = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($forwarded[0]);
        } elseif (isset($_SERVER['HTTP_X_REAL_IP'])) {
            $ip = $_SERVER['HTTP_X_REAL_IP'];
        }

        return md5($ip); // Hash IP for privacy
    }

    /**
     * Get rate limit file path
     */
    private static function getLimitFile($key)
    {
        self::initStorage();
        $clientId = self::getClientId();
        return self::$storageDir . $clientId . '_' . md5($key) . '.json';
    }

    /**
     * Check if rate limit is exceeded
     * 
     * @param string $key Rate limit key (e.g., 'login', 'contact', 'api')
     * @param int $maxAttempts Maximum attempts allowed
     * @param int $windowSeconds Time window in seconds
     * @return array ['allowed' => bool, 'remaining' => int, 'reset_at' => int]
     */
    public static function checkLimit($key, $maxAttempts = 5, $windowSeconds = 300)
    {
        $file = self::getLimitFile($key);
        $now = time();

        // Read existing data
        $data = [
            'attempts' => 0,
            'first_attempt' => $now,
            'last_attempt' => 0,
            'blocked_until' => 0
        ];

        if (file_exists($file)) {
            $content = file_get_contents($file);
            $stored = json_decode($content, true);
            if ($stored) {
                $data = array_merge($data, $stored);
            }
        }

        // Check if currently blocked
        if ($data['blocked_until'] > $now) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_at' => $data['blocked_until'],
                'retry_after' => $data['blocked_until'] - $now
            ];
        }

        // Reset if window has passed
        if (($now - $data['first_attempt']) > $windowSeconds) {
            $data['attempts'] = 0;
            $data['first_attempt'] = $now;
        }

        // Check if limit exceeded
        if ($data['attempts'] >= $maxAttempts) {
            // Block for the remaining window time
            $data['blocked_until'] = $data['first_attempt'] + $windowSeconds;
            file_put_contents($file, json_encode($data), LOCK_EX);
            
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_at' => $data['blocked_until'],
                'retry_after' => $data['blocked_until'] - $now
            ];
        }

        // Increment attempts
        $data['attempts']++;
        $data['last_attempt'] = $now;
        file_put_contents($file, json_encode($data), LOCK_EX);

        return [
            'allowed' => true,
            'remaining' => max(0, $maxAttempts - $data['attempts']),
            'reset_at' => $data['first_attempt'] + $windowSeconds
        ];
    }

    /**
     * Record a successful attempt (reset counter)
     */
    public static function resetLimit($key)
    {
        $file = self::getLimitFile($key);
        if (file_exists($file)) {
            unlink($file);
        }
    }

    /**
     * Require rate limit check (throws error if exceeded)
     */
    public static function requireLimit($key, $maxAttempts = 5, $windowSeconds = 300)
    {
        $result = self::checkLimit($key, $maxAttempts, $windowSeconds);
        
        if (!$result['allowed']) {
            require_once __DIR__ . '/../config/response.php';
            
            $retryAfter = isset($result['retry_after']) ? $result['retry_after'] : 0;
            
            // Set Retry-After header
            if ($retryAfter > 0) {
                header("Retry-After: {$retryAfter}");
            }
            
            ApiResponse::error(
                'Too many requests. Please try again later.',
                429,
                [
                    'retry_after' => $retryAfter,
                    'reset_at' => $result['reset_at']
                ]
            );
        }
        
        return $result;
    }

    /**
     * Clean up old rate limit files (older than 1 hour)
     */
    public static function cleanup()
    {
        self::initStorage();
        $files = glob(self::$storageDir . '*.json');
        $now = time();
        $cleaned = 0;

        foreach ($files as $file) {
            $mtime = filemtime($file);
            // Delete files older than 1 hour
            if (($now - $mtime) > 3600) {
                unlink($file);
                $cleaned++;
            }
        }

        return $cleaned;
    }
}


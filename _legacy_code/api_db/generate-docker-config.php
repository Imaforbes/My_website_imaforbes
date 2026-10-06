<?php
/**
 * Generate database.php and email.php from environment variables
 * Run this script inside the Docker container or before building
 * 
 * Usage: php generate-docker-config.php
 */

$dbHost = getenv('DB_HOST') ?: 'mysql';
$dbName = getenv('DB_NAME') ?: 'portfolio';
$dbUser = getenv('DB_USER') ?: 'portfolio_user';
$dbPass = getenv('DB_PASS') ?: 'portfolio_pass';

$smtpHost = getenv('SMTP_HOST') ?: 'smtp.example.com';
$smtpPort = getenv('SMTP_PORT') ?: '587';
$smtpUser = getenv('SMTP_USER') ?: '';
$smtpPass = getenv('SMTP_PASS') ?: '';
$smtpSecure = getenv('SMTP_SECURE') ?: 'tls';
$fromEmail = getenv('FROM_EMAIL') ?: 'noreply@example.com';
$fromName = getenv('FROM_NAME') ?: 'Portfolio';
$replyTo = getenv('REPLY_TO') ?: 'contact@example.com';

// Generate database.php
$databaseConfig = "<?php

/**
 * Database Configuration
 * Auto-generated from environment variables
 * Generated: " . date('Y-m-d H:i:s') . "
 */

class DatabaseConfig {
    const DB_HOST = '{$dbHost}';
    const DB_NAME = '{$dbName}';
    const DB_USER = '{$dbUser}';
    const DB_PASS = '{$dbPass}';
    const DB_CHARSET = 'utf8mb4';
    
    const DB_OPTIONS = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => \"SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci\"
    ];
    
    const MAX_CONNECTIONS = 10;
    const CONNECTION_TIMEOUT = 30;
    const QUERY_TIMEOUT = 60;
}
";

// Generate email.php
$emailConfig = "<?php

/**
 * Email Configuration
 * Auto-generated from environment variables
 * Generated: " . date('Y-m-d H:i:s') . "
 */

class EmailConfig {
    const SMTP_HOST = '{$smtpHost}';
    const SMTP_PORT = {$smtpPort};
    const SMTP_USER = '{$smtpUser}';
    const SMTP_PASS = '{$smtpPass}';
    const SMTP_SECURE = '{$smtpSecure}';
    
    const FROM_EMAIL = '{$fromEmail}';
    const FROM_NAME = '{$fromName}';
    const REPLY_TO = '{$replyTo}';
    
    const MAX_RECIPIENTS = 50;
    const RATE_LIMIT = 10;
    const MAX_ATTACHMENT_SIZE = 5242880;
}
";

// Write database.php
$dbFile = __DIR__ . '/config/database.php';
if (file_put_contents($dbFile, $databaseConfig)) {
    echo "✓ Generated config/database.php\n";
} else {
    echo "✗ Failed to write config/database.php\n";
    exit(1);
}

// Write email.php
$emailFile = __DIR__ . '/config/email.php';
if (file_put_contents($emailFile, $emailConfig)) {
    echo "✓ Generated config/email.php\n";
} else {
    echo "✗ Failed to write config/email.php\n";
    exit(1);
}

echo "\nConfiguration files generated successfully!\n";
echo "Database Host: {$dbHost}\n";
echo "Database Name: {$dbName}\n";
echo "Database User: {$dbUser}\n";


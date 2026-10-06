<?php
$host = '127.0.0.1';
$port = '8889';
$db   = 'portfolio';
$user = 'root';
$pass = 'root';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     
     // English update
     $desc_en = "Lead the end-to-end development of a custom CRM and operational management system to modernize legal and administrative workflows. Engineered a robust architecture featuring automated prospect tracking, smart email dispatching, and AI-powered drafting for client communications using Google Gemini. Designed a responsive, high-performance frontend with dynamic animations, deeply integrated with a secure Python backend and a relational database to manage complex legal portfolios, real estate transactions, and financial control.";
     
     // Spanish update
     $desc_es = "Lideré el desarrollo integral de un sistema CRM y de gestión operativa personalizado para modernizar los flujos de trabajo legales y administrativos. Diseñé una arquitectura robusta que incluye seguimiento automatizado de prospectos, envío inteligente de correos electrónicos y redacción asistida por Inteligencia Artificial (Google Gemini) para la comunicación con clientes. Desarrollé un frontend responsivo y de alto rendimiento con animaciones dinámicas, perfectamente integrado con un backend seguro en Python y una base de datos relacional para gestionar expedientes legales complejos, compraventas y control financiero.";
     
     // Technologies update
     $tech = json_encode([
         "React", "JavaScript", "Vite", "CSS / Bootstrap", "Framer Motion", 
         "Python", "Flask", "Google Gemini AI", "MySQL", "Linux Shell", "REST APIs", "SMTP"
     ]);

     $stmt = $pdo->prepare("UPDATE experiences SET description_en = ?, description_es = ?, technologies = ? WHERE company LIKE '%ALLEGRO%'");
     $stmt->execute([$desc_en, $desc_es, $tech]);
     
     echo "Updated " . $stmt->rowCount() . " rows.";
} catch (\PDOException $e) {
     echo "Connection failed: " . $e->getMessage() . "\n";
}
?>

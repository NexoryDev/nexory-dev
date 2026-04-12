<?php
header('Content-Type: application/json');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'https://nexory-dev.de',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$sessionAvailable = true;
if (session_status() !== PHP_SESSION_ACTIVE) {
    $sessionAvailable = @session_start();
}

$supported = ['de', 'en'];
$default = 'de';

if ($method === 'GET') {
    $lang = $default;

    if ($sessionAvailable && isset($_SESSION['language'])) {
        $lang = $_SESSION['language'];
    }

    if (!in_array($lang, $supported, true)) {
        $lang = $default;
    }

    echo json_encode(['language' => $lang]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode((string)$raw, true);
    if (!is_array($body)) {
        $body = [];
    }

    $lang = strtolower(trim((string)($body['language'] ?? '')));

    if (!in_array($lang, $supported, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Unsupported language']);
        exit;
    }

    if ($sessionAvailable) {
        $_SESSION['language'] = $lang;
    }

    echo json_encode(['language' => $lang]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);
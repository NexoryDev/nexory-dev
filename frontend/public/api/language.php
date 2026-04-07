<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://nexory-dev.de');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

$supported = ['de', 'en'];
$default   = 'de';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $lang = $_SESSION['language'] ?? $default;
    if (!in_array($lang, $supported, true)) {
        $lang = $default;
    }
    echo json_encode(['language' => $lang]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $lang = strtolower(trim($body['language'] ?? ''));

    if (!in_array($lang, $supported, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Unsupported language: ' . htmlspecialchars($lang, ENT_QUOTES, 'UTF-8')]);
        exit;
    }

    $_SESSION['language'] = $lang;
    echo json_encode(['language' => $lang]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed.']);

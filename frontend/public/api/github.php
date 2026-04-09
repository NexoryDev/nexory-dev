<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://nexory-dev.de');

$token = getenv('GITHUB_TOKEN');
if (!$token) {
    foreach ([__DIR__ . '/../../../../.env', __DIR__ . '/../../../.env', __DIR__ . '/../../.env'] as $envFile) {
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (str_starts_with(trim($line), 'GITHUB_TOKEN=')) {
                    $token = trim(explode('=', $line, 2)[1]);
                    break 2;
                }
            }
        }
    }
}
if (!$token) {
    http_response_code(500);
    echo json_encode(['error' => 'GitHub token not configured']);
    exit;
}

$allowed = [
    'members'       => 'https://api.github.com/orgs/NexoryDev/members',
];

$endpoint = $_GET['endpoint'] ?? '';
$repo     = preg_replace('/[^a-zA-Z0-9_.-]/', '', $_GET['repo'] ?? '');

if ($endpoint === 'collaborators' && $repo) {
    $url = "https://api.github.com/repos/NexoryDev/{$repo}/collaborators";
} elseif (isset($allowed[$endpoint])) {
    $url = $allowed[$endpoint];
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid endpoint']);
    exit;
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $token,
        'Accept: application/vnd.github.v3+json',
        'User-Agent: nexory-dev-website',
    ],
]);
$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($status);
echo $response;
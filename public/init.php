<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Permissions-Policy: interest-cohort=()");

if ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443) {
    header('Strict-Transport-Security: max-age=63072000; includeSubDomains; preload');
}

$csp = "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; img-src 'self' data: blob: https:; script-src 'self' https://unpkg.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' https://cdnjs.cloudflare.com https://unpkg.com https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com https:; connect-src 'self' https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://unpkg.com https://api.emailjs.com;";
header("Content-Security-Policy: $csp");

$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['SERVER_PORT'] ?? '') == 443;

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
if ($secure) {
    ini_set('session.cookie_secure', '1');
}

$cookieParams = [
    'lifetime' => 0,
    'path' => '/',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax'
];

$rawHost = (string)($_SERVER['HTTP_HOST'] ?? '');
$cookieHost = (string)parse_url(($secure ? 'https' : 'http') . '://' . $rawHost, PHP_URL_HOST);

$allowedCookieBaseDomains = ['nexory.org'];

if ($cookieHost !== '' && filter_var($cookieHost, FILTER_VALIDATE_IP) === false) {
    foreach ($allowedCookieBaseDomains as $baseDomain) {
        $baseDomain = strtolower(trim($baseDomain));
        $host = strtolower($cookieHost);

        if ($host === $baseDomain || substr($host, -strlen('.' . $baseDomain)) === '.' . $baseDomain) {
            $cookieParams['domain'] = $baseDomain;
            break;
        }
    }
}

session_set_cookie_params($cookieParams);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    if (empty($_SESSION['initiated'])) {
        session_regenerate_id(true);
        $_SESSION['initiated'] = true;
    }
}

require_once __DIR__ . '/language.php';
bootstrap_language();
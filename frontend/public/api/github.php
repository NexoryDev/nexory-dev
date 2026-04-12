<?php
header("Content-Type: application/json; charset=utf-8");

function read_env_value(string $key): string {
  $candidates = [];

  $v = getenv($key);
  if ($v !== false && $v !== null) $candidates[] = $v;
  if (isset($_SERVER[$key])) $candidates[] = $_SERVER[$key];
  if (isset($_ENV[$key])) $candidates[] = $_ENV[$key];

  foreach ($candidates as $candidate) {
    $candidate = trim((string)$candidate);
    $candidate = trim($candidate, "\"'");
    if ($candidate !== "") return $candidate;
  }

  return "";
}

function read_dotenv_value(string $dotenvPath, string $key): string {
  if (!is_readable($dotenvPath)) return "";

  $lines = file($dotenvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  if ($lines === false) return "";

  foreach ($lines as $line) {
    $line = trim($line);
    if ($line === "" || strpos($line, "#") === 0) continue;

    $parts = explode("=", $line, 2);
    if (count($parts) !== 2) continue;

    $k = trim($parts[0]);
    $v = trim($parts[1]);
    $v = trim($v, "\"'");

    if ($k === $key && $v !== "") return $v;
  }

  return "";
}

$token = read_env_value("GITHUB_TOKEN");
if ($token === "") {
  $dotenvCandidates = [
    dirname(__DIR__, 2) . "/.env",
    __DIR__ . "/.env"
  ];
  foreach ($dotenvCandidates as $dotenvPath) {
    $dotenvToken = read_dotenv_value($dotenvPath, "GITHUB_TOKEN");
    if ($dotenvToken !== "") {
      $token = $dotenvToken;
      break;
    }
  }
}

if ($token === "") {
  http_response_code(500);
  echo json_encode(["error" => "Missing GITHUB_TOKEN"]);
  exit;
}

$org = "NexoryDev";
$endpoint = $_GET["endpoint"] ?? "";

function gh_request(string $url, string $token, int &$statusCode = 0) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
      "Accept: application/vnd.github+json",
      "Authorization: Bearer " . $token,
      "User-Agent: nexory-dev-frontend"
    ],
    CURLOPT_TIMEOUT => 20
  ]);

  $response = curl_exec($ch);
  $statusCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);

  if ($err) return [false, "curl_error"];
  $decoded = json_decode((string)$response, true);
  if (!is_array($decoded)) return [false, "invalid_json"];

  return [true, $decoded];
}

function safe_repo_name(string $repo): string {
  return rawurlencode(trim($repo));
}

function respond_proxy_json(string $url, string $token, bool $filterPrivateRepos = false): void {
  $status = 0;
  [$ok, $data] = gh_request($url, $token, $status);

  if (!$ok || $status >= 400) {
    http_response_code($status > 0 ? $status : 502);
    echo json_encode(["error" => "Upstream request failed"]);
    exit;
  }

  if ($filterPrivateRepos && is_array($data)) {
    $data = array_values(array_filter($data, static function ($repo) {
      return is_array($repo) && (!isset($repo["private"]) || $repo["private"] !== true);
    }));
  }

  http_response_code(200);
  echo json_encode($data);
  exit;
}

if ($endpoint === "org") {
  respond_proxy_json("https://api.github.com/orgs/$org", $token);
}

if ($endpoint === "repos") {
  $perPage = isset($_GET["per_page"]) ? (int)$_GET["per_page"] : 100;
  if ($perPage < 1) $perPage = 1;
  if ($perPage > 100) $perPage = 100;

  $sort = $_GET["sort"] ?? "updated";
  $allowedSort = ["created", "updated", "pushed", "full_name"];
  if (!in_array($sort, $allowedSort, true)) $sort = "updated";

  $url = "https://api.github.com/orgs/$org/repos?type=public&per_page=$perPage&sort=$sort";
  respond_proxy_json($url, $token, true);
}

if ($endpoint === "members") {
  respond_proxy_json("https://api.github.com/orgs/$org/members?per_page=100", $token);
}

if ($endpoint === "contributors") {
  $repo = trim((string)($_GET["repo"] ?? ""));
  if ($repo === "") {
    http_response_code(400);
    echo json_encode(["error" => "Missing repo"]);
    exit;
  }

  $url = "https://api.github.com/repos/$org/" . safe_repo_name($repo) . "/contributors?per_page=100";
  respond_proxy_json($url, $token);
}

if ($endpoint === "collaborators") {
  $repo = trim((string)($_GET["repo"] ?? ""));
  if ($repo === "") {
    http_response_code(400);
    echo json_encode(["error" => "Missing repo"]);
    exit;
  }

  $url = "https://api.github.com/repos/$org/" . safe_repo_name($repo) . "/collaborators?per_page=100";
  respond_proxy_json($url, $token);
}

if ($endpoint === "dashboard") {
  $cacheDir = __DIR__ . "/cache";
  $cacheFile = $cacheDir . "/github-dashboard.json";
  $cacheTtl = 120;

  if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
  }

  if (is_readable($cacheFile)) {
    $raw = file_get_contents($cacheFile);
    $cached = json_decode((string)$raw, true);

    if (
      is_array($cached) &&
      isset($cached["generated_at"], $cached["data"]) &&
      (time() - (int)$cached["generated_at"]) < $cacheTtl
    ) {
      echo json_encode($cached["data"]);
      exit;
    }
  }

  $status = 0;
  [$okOrg, $orgData] = gh_request("https://api.github.com/orgs/$org", $token, $status);
  if (!$okOrg || $status >= 400) {
    if (is_readable($cacheFile)) {
      $raw = file_get_contents($cacheFile);
      $cached = json_decode((string)$raw, true);
      if (is_array($cached) && isset($cached["data"])) {
        echo json_encode($cached["data"]);
        exit;
      }
    }
    http_response_code(502);
    echo json_encode(["error" => "Failed to fetch org"]);
    exit;
  }

  [$okRepos, $reposData] = gh_request("https://api.github.com/orgs/$org/repos?type=public&per_page=100&sort=updated", $token, $status);
  if (!$okRepos || $status >= 400) {
    http_response_code(502);
    echo json_encode(["error" => "Failed to fetch repos"]);
    exit;
  }

  [$okMembers, $membersData] = gh_request("https://api.github.com/orgs/$org/members?per_page=100", $token, $status);
  if (!$okMembers || $status >= 400) {
    http_response_code(502);
    echo json_encode(["error" => "Failed to fetch members"]);
    exit;
  }

  $safeRepos = array_values(array_filter($reposData, static function ($repo) {
    return is_array($repo) && (!isset($repo["private"]) || $repo["private"] !== true);
  }));

  usort($safeRepos, static function ($a, $b) {
    return ((int)($b["stargazers_count"] ?? 0)) <=> ((int)($a["stargazers_count"] ?? 0));
  });

  $topRepos = array_slice($safeRepos, 0, 10);

  $roleRank = ["admin" => 1, "maintain" => 2, "push" => 3, "triage" => 4, "pull" => 5];
  $roleMap = [];
  $commitMap = [];
  $repoCountMap = [];

  foreach ($topRepos as $repo) {
    $repoName = $repo["name"] ?? "";
    if ($repoName === "") continue;

    [$okCollabs, $collabs] = gh_request(
      "https://api.github.com/repos/$org/" . safe_repo_name($repoName) . "/collaborators?per_page=100",
      $token,
      $status
    );
    if ($okCollabs && is_array($collabs)) {
      foreach ($collabs as $c) {
        if (!is_array($c) || empty($c["login"])) continue;
        $login = (string)$c["login"];
        $perms = $c["permissions"] ?? [];

        $role = "pull";
        if (!empty($perms["admin"])) $role = "admin";
        else if (!empty($perms["maintain"])) $role = "maintain";
        else if (!empty($perms["push"])) $role = "push";
        else if (!empty($perms["triage"])) $role = "triage";

        if (!isset($roleMap[$login]) || $roleRank[$role] < $roleRank[$roleMap[$login]]) {
          $roleMap[$login] = $role;
        }
        $repoCountMap[$login] = ($repoCountMap[$login] ?? 0) + 1;
      }
    }

    [$okContrib, $contribs] = gh_request(
      "https://api.github.com/repos/$org/" . safe_repo_name($repoName) . "/contributors?per_page=100",
      $token,
      $status
    );
    if ($okContrib && is_array($contribs)) {
      foreach ($contribs as $c) {
        if (!is_array($c) || empty($c["login"])) continue;
        $login = (string)$c["login"];
        $commitMap[$login] = ($commitMap[$login] ?? 0) + (int)($c["contributions"] ?? 0);
      }
    }
  }

  $members = [];
  foreach ($membersData as $member) {
    if (!is_array($member) || empty($member["login"])) continue;
    $login = (string)$member["login"];
    $member["role"] = $roleMap[$login] ?? "member";
    $member["commits"] = $commitMap[$login] ?? 0;
    $member["repoCount"] = $repoCountMap[$login] ?? 0;
    $members[] = $member;
  }

  usort($members, static function ($a, $b) use ($roleRank) {
    return ($roleRank[$a["role"]] ?? 99) <=> ($roleRank[$b["role"]] ?? 99);
  });

  $payload = [
    "org" => $orgData,
    "repos" => $topRepos,
    "members" => $members
  ];

  @file_put_contents($cacheFile, json_encode([
    "generated_at" => time(),
    "data" => $payload
  ], JSON_UNESCAPED_SLASHES));

  echo json_encode($payload);
  exit;
}

http_response_code(400);
echo json_encode(["error" => "Invalid endpoint"]);
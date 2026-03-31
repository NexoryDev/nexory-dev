
<?php

if (!function_exists('supported_languages')) {
	function supported_languages() {
		return ['de', 'en'];
	}
}

if (!function_exists('normalize_language')) {
	function normalize_language($lang) {
		$lang = strtolower((string)$lang);
		return in_array($lang, supported_languages(), true) ? $lang : '';
	}
}

if (!function_exists('bootstrap_language')) {
	function bootstrap_language() {
		$lang = '';

		if (isset($_GET['lang'])) {
			$lang = normalize_language($_GET['lang']);
			if ($lang !== '') {
				$_SESSION['lang'] = $lang;
			}
		}

		if ($lang === '' && isset($_SESSION['lang'])) {
			$lang = normalize_language($_SESSION['lang']);
		}

		if ($lang === '') {
			$acceptLanguage = (string)($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '');
			foreach (preg_split('/\s*,\s*/', $acceptLanguage) as $entry) {
				$candidate = normalize_language(substr($entry, 0, 2));
				if ($candidate !== '') {
					$lang = $candidate;
					break;
				}
			}
		}

		if ($lang === '') {
			$lang = 'de';
		}

		$_SESSION['lang'] = $lang;
		$GLOBALS['app_lang'] = $lang;
	}
}

if (!function_exists('current_lang')) {
	function current_lang() {
		return (string)($GLOBALS['app_lang'] ?? 'de');
	}
}

if (!function_exists('t')) {
	function t($key) {
		static $translations = [
			'de' => [
				'home.title' => 'Startseite',
			],
			'en' => [
				'home.title' => 'Home',
			],
		];

		$lang = current_lang();
		if (!isset($translations[$lang])) {
			$lang = 'de';
		}

		if (isset($translations[$lang][$key])) {
			return $translations[$lang][$key];
		}

		if (isset($translations['de'][$key])) {
			return $translations['de'][$key];
		}

		return (string)$key;
	}
}

if (!function_exists('e')) {
	function e($value) {
		return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
	}
}


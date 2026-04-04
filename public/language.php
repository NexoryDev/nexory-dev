
<?php

if (!function_exists('supported_languages')) {
	function supported_languages() {
		return ['de', 'en'];
	}
}

if (!function_exists('normalize_language')) {
	function normalize_language($language) {
		$language = strtolower((string)$language);
		return in_array($language, supported_languages(), true) ? $language : '';
	}
}

if (!function_exists('bootstrap_language')) {
	function bootstrap_language() {
		$language = '';

		if (isset($_GET['language'])) {
			$language = normalize_language($_GET['language']);
			if ($language !== '') {
				$_SESSION['language'] = $language;
			}
		}

		if ($language === '' && isset($_SESSION['language'])) {
			$language = normalize_language($_SESSION['language']);
			if ($language === '') {
				unset($_SESSION['language']);
			}
		}

		if ($language === '') {
			$acceptLanguage = (string)($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '');
			foreach (preg_split('/\s*,\s*/', $acceptLanguage) as $entry) {
				$candidate = normalize_language(substr($entry, 0, 2));
				if ($candidate !== '') {
					$language = $candidate;
					break;
				}
			}
		}

		if ($language === '') {
			$language = 'de';
		}

		$_SESSION['language'] = $language;
		$GLOBALS['app_language'] = $language;
	}
}

if (!function_exists('current_language')) {
	function current_language() {
		return (string)($GLOBALS['app_language'] ?? 'de');
	}
}

if (!function_exists('with_language')) {
    function with_language($url, $language = null) {
        $language = normalize_language($language ?? current_language());
        if ($language === '') {
            $language = current_language();
        }

        $parts = parse_url((string)$url);
        $path = $parts['path'] ?? '/';
        $query = [];
        if (!empty($parts['query'])) {
            parse_str($parts['query'], $query);
        }

        $query['language'] = $language;
        $qs = http_build_query($query);
        $result = $path . ($qs !== '' ? '?' . $qs : '');

        if (!empty($parts['fragment'])) {
            $result .= '#' . $parts['fragment'];
        }

        return $result;
    }
}

if (!function_exists('current_url_with_language')) {
    function current_url_with_language($language) {
        $current = (string)($_SERVER['REQUEST_URI'] ?? '/dashboard/home.php');
        return with_language($current, $language);
    }
}

if (!function_exists('e')) {
	function e($s) {
		return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
	}
}

if (!function_exists('t')) {
	function t($key) {
		$language = current_language();
		$translations = [
			'de' => [
				'nav.home' => 'Startseite',
				'nav.github' => 'Github',
				'nav.contact' => 'Kontakt',
				'nav.language_switcher' => 'Sprachwechsel',
				'home.title' => 'nexory.dev',
				'footer.tagline' => 'Open-Source-Projekte · Python, JavaScript, PHP und mehr',
				'footer.nav_heading' => 'Navigation',
				'footer.links_heading' => 'Links',
			],
			'en' => [
				'nav.home' => 'Home',
				'nav.github' => 'Github',
				'nav.contact' => 'Contact',
				'nav.language_switcher' => 'Language Switcher',
				'home.title' => 'nexory.dev',
				'footer.tagline' => 'Open source projects · Python, JavaScript, PHP and more',
				'footer.nav_heading' => 'Navigation',
				'footer.links_heading' => 'Links',
			]
		];

		$language = current_language();
		if (isset($translations[$language][$key])) {
			return $translations[$language][$key];
		}

		if (isset($translations['en'][$key])) {
            return $translations['en'][$key];
		}
		return (string)$key;
	}
}
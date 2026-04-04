<?php $current = $_SERVER['REQUEST_URI']; ?>
<nav class="navebar">
    <div class="logo-container">
        <a href="../dashboard/home.php"><img src="../database/logo/logo.png"  alt="Logo" class="logo"></a>
    </div>
    <ul class="navebar-menu">
        <li><a href="<?= e(with_language('../dashboard/home.php')) ?>" <?= str_contains($current, '/dashboard/') ? 'class="active"' : '' ?>><?= e(t('nav.home')) ?></a></li>
        <li><a href="<?= e(with_language('../github/github.php')) ?>" <?= str_contains($current, '/github/') ? 'class="active"' : '' ?>><?= e(t('nav.github')) ?></a></li>
        <li><a href="<?= e(with_language('../contact/contact.php')) ?>" <?= str_contains($current, '/contact/') ? 'class="active"' : '' ?>><?= e(t('nav.contact')) ?></a></li>
    </ul>

    <div class="language-switch" aria-label="<?= e(t('nav.language_switcher')) ?>">
        <a class="<?= current_language() === 'de' ? 'active' : '' ?>" href="<?= e(current_url_with_language('de')) ?>">DE</a>
        <a class="<?= current_language() === 'en' ? 'active' : '' ?>" href="<?= e(current_url_with_language('en')) ?>">EN</a>
    </div>

    <div class="navebar-toggle" id="navebar-toggle">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>
</nav>

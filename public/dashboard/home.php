<?php
require_once __DIR__ . '/../init.php';
?>

<!DOCTYPE html>
<html lang="<?=  e(current_language()) ?>">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <base href="/">
        <title data-i18n="home.title"><?= e(t('home.title')) ?></title>
        <script>
        window.__i18nPage = {
            de: { 'home.title': 'nexory.dev' },
            en: { 'home.title': 'nexory.dev' }
        };
        </script>
        <link rel="stylesheet" href="../dashboard/home.css">
        <link rel="stylesheet" href="../navebar/navebar.css">
        <link rel="stylesheet" href="../footer/footer.css">
    </head>

    <body>
        <div id="preloader-root"></div>

        <div id="page" class="page-hidden">
            <?php include __DIR__ . '/../navebar/navebar.php'; ?>

            <section class="hero">
                <canvas id="code-canvas"></canvas>

                <div class="hero-content">
                    <div class="info">
                        <h1>nexory.dev</h1>
                        <p>Open source projects &middot; Python, JavaScript, PHP and more</p>
                    </div>

                    <div class="terminal">
                        <div class="terminal-header">
                            <span class="dot red"></span>
                            <span class="dot yellow"></span>
                            <span class="dot green"></span>
                            <span class="terminal-title">nexory.py</span>
                        </div>
                        <div class="terminal-body">
                            <pre id="code-output"></pre><span class="cursor"></span>
                        </div>
                    </div>
                </div>
            </section>

            <?php include __DIR__ . '/../footer/footer.php'; ?>
        </div>

        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script type="text/babel" src="../dashboard/home.js"></script>
    </body>

</html>

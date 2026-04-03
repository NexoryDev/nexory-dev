<?php
require_once __DIR__ . '/../init.php';
?>

<!DOCTYPE html>
<html lang="<?=  e(current_lang()) ?>">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <base href="/">
        <title><?=  e(t('home.title')) ?> </title>
        <link rel="stylesheet" href="../dashboard/home.css">
        <link rel="stylesheet" href="../navebar/navebar.css">
        <link rel="stylesheet" href="../footer/footer.css">
    </head>

    <body>
        <?php include __DIR__ . '/../navebar/navebar.php'; ?>

        <section class="hero">
            <canvas id="code-canvas"></canvas>

            <div class="hero-content">
                <div class="info">
                    <h1>Nexory.Org</h1>
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

        <script src="../dashboard/home.js"></script>
    </body>

</html>
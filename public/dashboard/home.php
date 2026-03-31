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
    </head>

    <body>
        <?php include __DIR__ . '/../navebar/navebar.php'; ?>

        <section class="test">
            <h1>test</h1>
        </section>
    </body>

</html>
<?php
require_once __DIR__ . '/../init.php';
?>

<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <base href="/">
        <title>Imprint &mdash; nexory.dev</title>

        <link rel="stylesheet" href="public/imprint/imprint.css">
        <link rel="stylesheet" href="public/navebar/navebar.css">
        <link rel="stylesheet" href="public/footer/footer.css">
    </head>

    <body>
        <div id="page">
            <?php include __DIR__ . '/../navebar/navebar.php'; ?>

            <main class="legal-page">
                <div class="legal-container">

                    <header class="legal-header">
                        <p class="legal-label">Legal</p>
                        <h1 class="legal-title">Imprint</h1>
                        <p class="legal-subtitle">Information pursuant to § 5 TMG (German Telemedia Act)</p>
                    </header>

                    <section class="legal-section">
                        <h2>Responsible Party</h2>
                        <p>
                            Luca Bohnet<br>
                            Vogelsangweg 3<br>
                            72202 Nagold<br>
                            07452 8866722
                        </p>
                        <p>
                            <strong>E-Mail:</strong>
                            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
                        </p>
                    </section>

                    <section class="legal-section">
                        <h2>Disclaimer</h2>
                        <h3>Liability for Content</h3>
                        <p>
                            The contents of this website have been created with the utmost care. However, we cannot
                            guarantee the accuracy, completeness, or timeliness of the content. As a service provider
                            we are responsible for our own content on these pages in accordance with general law.
                            However, we are not obligated to monitor transmitted or stored third-party information or
                            to investigate circumstances that indicate illegal activity.
                        </p>
                        <h3>Liability for Links</h3>
                        <p>
                            Our website contains links to external websites over which we have no control. Therefore
                            we cannot accept any liability for these external contents. The respective provider or
                            operator of the linked pages is always responsible for their content. The linked pages
                            were checked for possible legal violations at the time of linking. Illegal content was
                            not recognizable at the time of linking.
                        </p>
                        <h3>Copyright</h3>
                        <p>
                            The content and works created by the site operators on these pages are subject to
                            copyright law. Duplication, processing, distribution, or any form of commercialization
                            of such material beyond the scope of copyright law requires the prior written consent of
                            its respective author or creator. Downloads and copies of this site are only permitted
                            for private, non-commercial use.
                        </p>
                    </section>

                    <footer class="legal-foot">
                        <p>Last updated: April 2026</p>
                    </footer>

                </div>
            </main>

            <?php include __DIR__ . '/../footer/footer.php'; ?>
        </div>

        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script type="text/babel" src="public/navebar/navebar.js"></script>
    </body>

</html>

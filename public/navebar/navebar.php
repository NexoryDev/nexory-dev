<?php $current = $_SERVER['REQUEST_URI']; ?>
<nav class="navebar">
    <div class="logo-container">
        <a href=""><img></a>
    </div>
    <ul class="navebar-menu">
        <li><a href="" <?= str_contains($current, '/dashboard/') ? 'class="active"' : '' ?>>Home</a></li>
        <li><a href="" <?= str_contains($current, '/github/') ? 'class="active"' : '' ?>>Github</a></li>
        <li><a href="" <?= str_contains($current, '/contact/') ? 'class="active"' : '' ?>>Contact</a></li>
    </ul>

    <div class="language-switch" aria-label="">
        <a class="" href="">DE</a>
        <a class="" href="">EN</a>
    </div>

    <div class="navebar-toggle" id="navebar-toggle">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>
</nav>

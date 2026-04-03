document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('navebar-toggle');
    const menu   = document.querySelector('.navebar-menu');
    const nav    = document.querySelector('.navebar');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }
});
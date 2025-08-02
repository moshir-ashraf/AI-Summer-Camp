document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        window.location.href = '/logout';
    });
});

(function() {
    const html = document.querySelector('html');
    if (html.style.filter === 'invert(1) hue-rotate(180deg)') {
        html.style.filter = '';
    } else {
        html.style.filter = 'invert(1) hue-rotate(180deg)';
    }
})();

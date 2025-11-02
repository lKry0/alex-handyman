const sliders = document.querySelectorAll('.before-after__item');
let activeSlider = null;

sliders.forEach(slider => {
    const divider = slider.querySelector('.divider');
    const afterImg = slider.querySelector('.before-after__img--after');
    
    function updateSlider(x) {
        const rect = slider.getBoundingClientRect();
        let position = ((x - rect.left) / rect.width) * 100;
        position = Math.max(0, Math.min(100, position));
        divider.style.left = position + '%';
        afterImg.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
    }
    
    function onStart(e) {
        // Prevent default to stop scrolling when dragging divider
        e.preventDefault();
        activeSlider = { slider, updateSlider };
        const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        updateSlider(x);
    }
    
    // Only attach events to the divider, not the entire slider
    divider.addEventListener('mousedown', onStart);
    divider.addEventListener('touchstart', onStart, { passive: false });
    
    // Prevent image dragging
    divider.addEventListener('dragstart', (e) => e.preventDefault());
});

// Global move and end events
function onMove(e) {
    if (!activeSlider) return;
    e.preventDefault();
    const x = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    activeSlider.updateSlider(x);
}

function onEnd() {
    activeSlider = null;
}

document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);
document.addEventListener('touchmove', onMove, { passive: false });
document.addEventListener('touchend', onEnd);

document.addEventListener('DOMContentLoaded', function () {
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.menu');
    const body = document.body;
    
    const overlay = document.createElement('div');
    overlay.classList.add('menu-overlay');
    body.appendChild(overlay);
    
    burger.addEventListener('click', function () {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = burger.classList.contains('active') ? 'hidden' : '';
    });
    
    overlay.addEventListener('click', function () {
        burger.classList.remove('active');
        menu.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    });
    
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function () {
            burger.classList.remove('active');
            menu.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        });
    });
});
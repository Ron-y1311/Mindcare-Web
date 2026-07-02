// ============ SCROLL Y HEADER ============
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// Efecto visual del header al bajar con el mouse
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
        header.style.padding = '5px 0';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.8)';
        header.style.boxShadow = '0 1px 0px rgba(0,0,0,0.05)';
        header.style.padding = '10px 0';
    }
});

// ============ CARRUSEL LOGIC (PRECISIÓN TOTAL) ============
let currentSlide = 0;
let perView = 3;
let carouselInterval;

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const track = document.getElementById('carouselTrack');
    if (slides.length === 0 || !track) return;

    function updateView() {
        if (window.innerWidth <= 768) perView = 1;
        else if (window.innerWidth <= 1024) perView = 2;
        else perView = 3;
        
        // Ajustar currentSlide si queda fuera de rango al redimensionar
        if (currentSlide > slides.length - perView) {
            currentSlide = Math.max(0, slides.length - perView);
        }
        
        createDots();
        render();
    }

    function createDots() {
        const dotsContainer = document.getElementById('carouselDots');
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        
        const numDots = Math.ceil(slides.length / perView);
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot' + (i === Math.floor(currentSlide / perView) ? ' active' : '');
            dot.addEventListener('click', () => {
                currentSlide = i * perView;
                render();
                startAutoplay(); 
            });
            dotsContainer.appendChild(dot);
        }
    }

    function render() {
        const slideWidth = slides[0].offsetWidth;
        // Detectar el gap real del CSS
        const gap = parseInt(window.getComputedStyle(track).gap) || 24; 
        
        const offset = (slideWidth + gap) * currentSlide;
        track.style.transform = `translateX(-${offset}px)`;
        
        // Actualizar dots activos
        const dots = document.querySelectorAll('.carousel-dot');
        const activeIdx = Math.floor(currentSlide / perView);
        dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    }

    function startAutoplay() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(() => {
            const maxSlide = slides.length - perView;
            currentSlide = (currentSlide >= maxSlide) ? 0 : currentSlide + 1;
            render();
        }, 3000); // 3 segundos para una lectura más cómoda
    }

    // Pausar cuando el usuario quiere leer una tarjeta específica
    track.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    track.addEventListener('mouseleave', () => startAutoplay());

    window.addEventListener('resize', updateView);
    updateView();
    startAutoplay();
}

// ============ TILT 3D LOGIC (SUAVE) ============
function initTilt() {
    const cards = document.querySelectorAll('.problema-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const rotateX = (y - 0.5) * -20; // Inclinación vertical
            const rotateY = (x - 0.5) * 20;  // Inclinación horizontal
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });
}

// ============ FORMULARIO DE SUSCRIPCIÓN ============
function handleSubscribe() {
    const input = document.getElementById('email-input');
    const msg = document.getElementById('form-message');
    const btn = document.querySelector('.cta-form .btn-primary');

    if (input && input.value.includes('@') && input.value.length > 5) {
        // Feedback visual de carga
        const originalText = btn.innerText;
        btn.innerText = "Enviando...";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        setTimeout(() => {
            btn.innerText = "¡Registrado!";
            btn.style.background = "#10b981";
            msg.textContent = "¡Gracias! Te hemos enviado un correo de bienvenida.";
            msg.style.color = "#ffffff";
            input.value = "";

            // Resetear botón después de 3 segundos
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
                btn.style.opacity = "1";
                btn.disabled = false;
                msg.textContent = "";
            }, 3000);
        }, 1500);
    } else {
        msg.textContent = "Por favor, introduce un correo electrónico válido.";
        msg.style.color = "#ffcfcf";
    }
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initTilt();
});
// Mejora menor para documentaci�n de interacciones

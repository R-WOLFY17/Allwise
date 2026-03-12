// assets/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle body scroll
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            
            // Update icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                lucide.createIcons();
            }
        });
    }

    // Sticky header
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.setAttribute('data-lucide', 'menu');
                        lucide.createIcons();
                    }
                }
                
                // Scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Helper for animations on scroll
const observeElements = (selector, className = 'visible') => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(className);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll(selector).forEach(el => {
        observer.observe(el);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    observeElements('.animate-on-scroll');
});

// --- ADMIN DASHBOARD LOCAL STORAGE SYNC ---
// This checks if the user has saved data in the Admin Dashboard
// and overwrites the default HTML content if they have.
document.addEventListener('DOMContentLoaded', () => {
    const homeDataJSON = localStorage.getItem('awf_homeData');
    if(homeDataJSON) {
        try {
            const homeData = JSON.parse(homeDataJSON);
            
            // Home Page Updates
            const heroHeadline = document.getElementById('live-hero-headline');
            if (heroHeadline && homeData.headline) heroHeadline.innerText = homeData.headline;

            const heroSubtitle = document.getElementById('live-hero-subtitle');
            if (heroSubtitle && homeData.subtitle) heroSubtitle.innerText = homeData.subtitle;

            const statsChildren = document.getElementById('live-stats-children');
            if (statsChildren && homeData.statsChildren) statsChildren.innerText = homeData.statsChildren;

        } catch (e) {
            console.error("Error parsing Admin data from localStorage", e);
        }
    }
});

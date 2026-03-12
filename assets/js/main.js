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
    // 1. TEXT AND LINKS SYNC
    const siteDataJSON = localStorage.getItem('awf_siteData');
    if (siteDataJSON) {
        try {
            const siteData = JSON.parse(siteDataJSON);
            
            // Loop through all saved keys
            for (const key in siteData) {
                const liveId = 'live-' + key;
                const el = document.getElementById(liveId);
                
                if (el) {
                    const tagName = el.tagName.toLowerCase();
                    const value = siteData[key];

                    // Determine how to apply the value based on tag type
                    if (tagName === 'a' && value.startsWith('http')) {
                        el.href = value;
                    } else if (tagName === 'a' && value.includes('@')) {
                        el.href = 'mailto:' + value;
                        el.innerText = value;
                    } else if (tagName === 'img') {
                        el.src = value;
                    } else {
                        // Default text replacement
                        el.innerText = value;
                    }
                }
            }
        } catch (e) {
            console.error("Error parsing Admin data from localStorage", e);
        }
    }

    // 1.5 SPECIFIC IMAGES SYNC
    const specificImages = [
        'img-home-hero', 'img-home-about', 'img-about-main',
        'img-prog1', 'img-prog2', 'img-prog3', 'img-prog4'
    ];

    specificImages.forEach(imgKey => {
        const storedImg = localStorage.getItem('awf_admin-' + imgKey);
        if (storedImg) {
            const imgEl = document.getElementById('live-' + imgKey);
            if (imgEl) {
                imgEl.src = storedImg;
            }
        }
    });

    // 2. GALLERY IMAGES SYNC
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        const galleryImagesJSON = localStorage.getItem('awf_gallery_images');
        if (galleryImagesJSON) {
            try {
                const galleryImages = JSON.parse(galleryImagesJSON);
                
                // If there are custom images saved, clear out the dummy content
                if (galleryImages && galleryImages.length > 0) {
                    galleryGrid.innerHTML = ''; // Hide defaults
                    
                    galleryImages.forEach(imgBase64 => {
                        const itemHtml = `
                            <div class="gallery-item animate-on-scroll">
                                <img src="${imgBase64}" alt="Gallery Image">
                                <div class="gallery-overlay">
                                    <h4>Community Impact</h4>
                                    <p style="font-size: 0.85rem; margin-bottom: 0;">Making a difference together</p>
                                </div>
                            </div>
                        `;
                        // Using insertAdjacentHTML is safer than += for larger DOM nodes, though innerHTML is fine here
                        galleryGrid.insertAdjacentHTML('beforeend', itemHtml);
                    });
                    
                    // Re-run the observer for new elements so they fade in
                    if (typeof observeElements === 'function') {
                        observeElements('.gallery-item.animate-on-scroll');
                    }
                }
            } catch (e) {
                console.error("Error parsing Gallery data from localStorage", e);
            }
        }
    }

    // 3. CONTACT FORM INTERCEPTOR
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageObj = {
                id: Date.now(),
                firstName: document.getElementById('contact-fname').value,
                lastName: document.getElementById('contact-lname').value,
                email: document.getElementById('contact-email').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            };

            let messages = JSON.parse(localStorage.getItem('awf_messages')) || [];
            messages.unshift(messageObj); // Add to beginning
            localStorage.setItem('awf_messages', JSON.stringify(messages));

            // Show success styling
            document.getElementById('contact-success').style.display = 'block';
            contactForm.reset();
            
            setTimeout(() => {
                document.getElementById('contact-success').style.display = 'none';
            }, 5000);
        });
    }
});

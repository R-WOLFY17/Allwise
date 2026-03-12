// admin/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            // update icon
            const icon = mobileToggle.querySelector('i');
            if (sidebar.classList.contains('open')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });
    }

    // Tab Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Mobile: close sidebar when clicking a link
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.setAttribute('data-lucide', 'menu');
                    lucide.createIcons();
                }
            }

            // Remove active from all nav items and tabs
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(tab => tab.classList.remove('active'));

            // Set active to clicked nav item
            item.classList.add('active');

            // Show corresponding tab
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // File Upload Drag and Drop Logic
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewGrid = document.getElementById('preview-grid');

    if (dropZone) {
        // Highlight on drag
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        // Handle drop
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        });

        // Handle Browse Click
        fileInput.addEventListener('change', function() {
            if (this.files.length) {
                handleFiles(this.files);
            }
        });
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'preview-item';
                    
                    imgContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button class="delete-btn" onclick="this.parentElement.remove()"><i data-lucide="trash-2"></i></button>
                    `;
                    
                    previewGrid.appendChild(imgContainer);
                    lucide.createIcons(); // Re-init icons for the new trash bin
                };

                reader.readAsDataURL(file);
            } else {
                alert('Only image files are allowed for the media gallery.');
            }
        });
    }

    // --- LOCAL STORAGE FUNCTIONALITY ---
    
    // 1. Load existing data on page load
    function loadAdminData() {
        const homeData = JSON.parse(localStorage.getItem('awf_homeData'));
        if (homeData) {
            if(document.getElementById('admin-hero-headline')) document.getElementById('admin-hero-headline').value = homeData.headline || "";
            if(document.getElementById('admin-hero-subtitle')) document.getElementById('admin-hero-subtitle').value = homeData.subtitle || "";
            if(document.getElementById('admin-stats-children')) document.getElementById('admin-stats-children').value = homeData.statsChildren || "";
        }
    }

    // Call load on init
    loadAdminData();

    // 2. Handle Form Submissions (Save to LocalStorage)
    const homeForm = document.getElementById('home-form');
    if (homeForm) {
        homeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const data = {
                headline: document.getElementById('admin-hero-headline').value,
                subtitle: document.getElementById('admin-hero-subtitle').value,
                statsChildren: document.getElementById('admin-stats-children').value
            };
            localStorage.setItem('awf_homeData', JSON.stringify(data));
            
            // Visual feedback
            const btn = this.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Saved!";
            btn.style.backgroundColor = "var(--success)";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = "";
            }, 2000);
        });
    }

    // (Add forms for About, Programs, etc similarly in real environment. 
    // We demonstrate Home functionality as proof-of-concept for the public interface)
});

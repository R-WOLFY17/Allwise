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

    // --- COMPREHENSIVE LOCAL STORAGE FUNCTIONALITY ---
    
    // Helper to briefly show save success
    function showSaveSuccess(btn) {
        const originalText = btn.innerText;
        btn.innerText = "Saved!";
        btn.style.backgroundColor = "var(--success)";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "";
        }, 2000);
    }

    // 1. Load existing data on page load
    function loadAdminData() {
        const siteDataJSON = localStorage.getItem('awf_siteData');
        if (siteDataJSON) {
            const siteData = JSON.parse(siteDataJSON);
            
            // Populate all inputs if data exists
            for (const key in siteData) {
                const el = document.getElementById(`admin-${key}`);
                if (el) {
                    el.value = siteData[key];
                }
            }
        }
        
        loadGalleryImages();
        loadMessages();
        updateOverviewStats();

        // 1.5 Load Specific Images Let's just create a helper for this
        const specificImages = [
            'admin-img-home-hero', 'admin-img-home-about', 'admin-img-about-main',
            'admin-img-prog1', 'admin-img-prog2', 'admin-img-prog3', 'admin-img-prog4'
        ];

        specificImages.forEach(id => {
            const storedImg = localStorage.getItem('awf_' + id);
            const inputEl = document.getElementById(id);
            if (storedImg && inputEl) {
                 // We can't set a file input value for security reasons,
                 // but we can add a small UI hint that an image is saved.
                 let hint = inputEl.parentElement.querySelector('.saved-hint');
                 if (!hint) {
                     hint = document.createElement('span');
                     hint.className = 'saved-hint text-success';
                     hint.style.fontSize = '0.75rem';
                     hint.style.display = 'block';
                     hint.style.marginTop = '0.25rem';
                     hint.innerText = '✓ Image saved';
                     inputEl.parentElement.appendChild(hint);
                 }
            }
        });
    }

    // Call load on init
    loadAdminData();

    // 2. Comprehensive Save Function
    function saveAllData() {
        // We select EVERY input/textarea that starts with id="admin-"
        const allInputs = document.querySelectorAll('input[id^="admin-"], textarea[id^="admin-"]');
        const siteData = {};
        
        allInputs.forEach(input => {
            // Strip the "admin-" prefix to use as the key
            const key = input.id.replace('admin-', '');
            siteData[key] = input.value;
        });

        localStorage.setItem('awf_siteData', JSON.stringify(siteData));
    }

    // Attach Save Listeners to ALL forms
    const forms = document.querySelectorAll('.admin-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAllData();
            showSaveSuccess(this.querySelector('button[type="submit"]'));
        });
    });

    // --- SPECIFIC IMAGE UPLOADS ---
    const specificMediaForm = document.getElementById('specific-media-form');
    if (specificMediaForm) {
        specificMediaForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const imgInputs = [
                'admin-img-home-hero', 'admin-img-home-about', 'admin-img-about-main',
                'admin-img-prog1', 'admin-img-prog2', 'admin-img-prog3', 'admin-img-prog4'
            ];

            let promises = imgInputs.map(id => {
                return new Promise((resolve) => {
                    const input = document.getElementById(id);
                    if (input && input.files && input.files[0]) {
                        const file = input.files[0];
                        if (file.size > 2 * 1024 * 1024) {
                            alert(`File ${file.name} is too large. Max 2MB.`);
                            resolve(); // resolve anyway to not block others
                            return;
                        }

                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                localStorage.setItem('awf_' + id, e.target.result);
                                resolve();
                            } catch (err) {
                                alert("Storage limit reached! Cannot save more images.");
                                resolve();
                            }
                        };
                        reader.readAsDataURL(file);
                    } else {
                        resolve(); // no file selected
                    }
                });
            });

            Promise.all(promises).then(() => {
                showSaveSuccess(this.querySelector('button[type="submit"]'));
                loadAdminData(); // Refresh UI hints
            });
        });
    }



    // Drag and Drop Events
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleGalleryUploads(files);
        }, false);
    }

    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleGalleryUploads(this.files);
        });
    }

    function handleGalleryUploads(files) {
        let galleryImages = JSON.parse(localStorage.getItem('awf_gallery_images')) || [];
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                // Approximate check for 2MB limit
                if (file.size > 2 * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Please keep images under 2MB for local storage.`);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Data = e.target.result;
                    // Prepend new images
                    galleryImages.unshift(base64Data);
                    
                    try {
                        localStorage.setItem('awf_gallery_images', JSON.stringify(galleryImages));
                        loadGalleryImages(); // re-render grid
                    } catch (err) {
                        alert("Storage limit reached! The browser cannot store any more large images without a backend database. Please delete some images first.");
                        // Revert the array push
                        galleryImages.shift();
                    }
                };
                reader.readAsDataURL(file);
            } else {
                alert(`${file.name} is not an image file.`);
            }
        });
    }

    // Render Live Gallery Images
    function loadGalleryImages() {
        if (!previewGrid) return;
        
        previewGrid.innerHTML = '';
        const galleryImages = JSON.parse(localStorage.getItem('awf_gallery_images')) || [];
        
        if (galleryImages.length === 0) {
            previewGrid.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1;">No live images currently uploaded.</p>';
            return;
        }

        galleryImages.forEach((imgSrc, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'preview-item';
            
            imgContainer.innerHTML = `
                <img src="${imgSrc}" alt="Gallery Preview">
                <button class="delete-btn" data-index="${index}"><i data-lucide="trash-2"></i></button>
            `;
            
            previewGrid.appendChild(imgContainer);
        });
        
        lucide.createIcons();

        // Attach delete listeners
        const deleteBtns = previewGrid.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const indexToDelete = parseInt(this.getAttribute('data-index'));
                deleteGalleryImage(indexToDelete);
            });
        });
    }

    function deleteGalleryImage(index) {
        if (confirm("Are you sure you want to delete this live gallery image?")) {
            let galleryImages = JSON.parse(localStorage.getItem('awf_gallery_images')) || [];
            galleryImages.splice(index, 1);
            localStorage.setItem('awf_gallery_images', JSON.stringify(galleryImages));
            loadGalleryImages();
        }
    }

    // --- MESSAGES LOGIC ---
    function loadMessages() {
        const messagesTableBody = document.querySelector('#messages tbody');
        if (!messagesTableBody) return;

        let messages = JSON.parse(localStorage.getItem('awf_messages')) || [];
        
        // Update badge count
        const badge = document.querySelector('[data-target="messages"] .badge');
        if (badge) badge.innerText = messages.length;

        // Populate table
        if (messages.length === 0) {
            messagesTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No messages found.</td></tr>';
            return;
        }

        messagesTableBody.innerHTML = '';
        messages.forEach((msg, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${msg.firstName} ${msg.lastName}</td>
                <td><a href="mailto:${msg.email}">${msg.email}</a></td>
                <td>${msg.subject}</td>
                <td>${msg.date}</td>
                <td>
                    <button class="btn-sm btn-outline view-msg-btn" data-index="${index}">View</button>
                    <button class="btn-sm btn-outline text-primary delete-msg-btn" data-index="${index}" style="border-color: var(--primary-color);">Delete</button>
                </td>
            `;
            messagesTableBody.appendChild(tr);
        });

        // Event listeners for view and delete
        document.querySelectorAll('.view-msg-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = this.getAttribute('data-index');
                const msg = messages[idx];
                alert(`Message from ${msg.firstName} ${msg.lastName} (${msg.email}):\n\nSubject: ${msg.subject}\n\n${msg.message}`);
            });
        });

        document.querySelectorAll('.delete-msg-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if(confirm('Delete this message?')) {
                    const idx = this.getAttribute('data-index');
                    messages.splice(idx, 1);
                    localStorage.setItem('awf_messages', JSON.stringify(messages));
                    loadMessages();
                }
            });
        });
    }

    // --- OVERVIEW STATS UPDATE ---
    function updateOverviewStats() {
        const siteDataJSON = localStorage.getItem('awf_siteData');
        if (siteDataJSON) {
            const siteData = JSON.parse(siteDataJSON);
            
            // Map the targeted input IDs to the elements we want to update in the Overview tab
            const fundsEl = document.querySelector('.stat-card:nth-child(1) .stat-number');
            if (fundsEl && siteData['stats-funds']) fundsEl.innerText = siteData['stats-funds'];
            
            const volsEl = document.querySelector('.stat-card:nth-child(2) .stat-number');
            if (volsEl && siteData['stats-communities']) volsEl.innerText = siteData['stats-communities'];
            
            const projsEl = document.querySelector('.stat-card:nth-child(4) .stat-number');
            if (projsEl && siteData['stats-projects']) projsEl.innerText = siteData['stats-projects'];
        }
        
        let messages = JSON.parse(localStorage.getItem('awf_messages')) || [];
        const queriesEl = document.querySelector('.stat-card:nth-child(3) .stat-number');
        if (queriesEl) queriesEl.innerText = messages.length;
    }
});

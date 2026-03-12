const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\WOLFY TECHNOLOGIES\\Desktop\\ALL WISE\\Allwise';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // 1. Social Links
    content = content.replace(/<a([^>]*?)aria-label="Facebook">/g, (match, p1) => {
        if (p1.includes('id="live-settings-facebook"')) return match;
        return `<a id="live-settings-facebook"${p1}aria-label="Facebook">`;
    });
    content = content.replace(/<a([^>]*?)aria-label="Twitter">/g, (match, p1) => {
        if (p1.includes('id="live-settings-twitter"')) return match;
        return `<a id="live-settings-twitter"${p1}aria-label="Twitter">`;
    });
    content = content.replace(/<a([^>]*?)aria-label="Instagram">/g, (match, p1) => {
        if (p1.includes('id="live-settings-instagram"')) return match;
        return `<a id="live-settings-instagram"${p1}aria-label="Instagram">`;
    });
    content = content.replace(/<a([^>]*?)aria-label="Tiktok">/g, (match, p1) => {
        if (p1.includes('id="live-settings-tiktok"')) return match;
        return `<a id="live-settings-tiktok"${p1}aria-label="Tiktok">`;
    });

    // 2. Email
    content = content.replace(/<a href="mailto:allwisefoundation1@gmail\.com"/g, (match) => {
        return '<a id="live-settings-email" href="mailto:allwisefoundation1@gmail.com"';
    });

    // 3. Address
    content = content.replace(/(<i data-lucide="map-pin"[^>]*><\/i>\s*)(Buikwe Town Buikwe District Uganda)/g, '$1<span id="live-settings-address">$2</span>');

    // 4. Phone
    content = content.replace(/(<i data-lucide="phone"[^>]*><\/i>\s*)(\+256 702138799)/g, '$1<span id="live-settings-phone">$2</span>');

    // 5. Footer Desc
    content = content.replace(/(<p>)(Dedicated to supporting vulnerable communities and empowering the next generation across the globe\.)(<\/p>)/g, '<p id="live-settings-footer-desc">$2</p>');

    // 6. Footer Year
    content = content.replace(/&copy; 2026 AllWise/g, '&copy; <span id="live-settings-footer-year">2026</span> AllWise');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log('Successfully injected live-settings IDs to all public HTML files.');

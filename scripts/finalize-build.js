const fs = require('fs');
const path = require('path');

const PUBLIC_IMAGES = path.join(__dirname, '..', 'public', 'images');
const PUBLIC_DATA = path.join(__dirname, '..', 'public', 'data');
const BUILD_DIR = path.join(__dirname, '..', 'build');
const BUILD_IMAGES = path.join(BUILD_DIR, 'images');
const BUILD_DATA = path.join(BUILD_DIR, 'data');
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main';

console.log('========================================');
console.log('Finalizing build for CDN deployment');
console.log('========================================\n');

// Copy images directory
if (fs.existsSync(PUBLIC_IMAGES)) {
    if (!fs.existsSync(BUILD_IMAGES)) {
        fs.mkdirSync(BUILD_IMAGES, { recursive: true });
    }
    
    const images = fs.readdirSync(PUBLIC_IMAGES);
    images.forEach(img => {
        fs.copyFileSync(
            path.join(PUBLIC_IMAGES, img),
            path.join(BUILD_IMAGES, img)
        );
    });
    console.log(`Copied ${images.length} images to build/images/`);
} else {
    console.log('No images directory found');
}

// Copy data directory
if (fs.existsSync(PUBLIC_DATA)) {
    if (!fs.existsSync(BUILD_DATA)) {
        fs.mkdirSync(BUILD_DATA, { recursive: true });
    }
    
    const dataFiles = fs.readdirSync(PUBLIC_DATA);
    dataFiles.forEach(file => {
        fs.copyFileSync(
            path.join(PUBLIC_DATA, file),
            path.join(BUILD_DATA, file)
        );
    });
    console.log(`Copied ${dataFiles.length} data files to build/data/`);
}

// Update index.html to use CDN URLs
const indexPath = path.join(BUILD_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    console.log('Updating index.html with CDN URLs...');
    
    // Replace all /static/ paths (JS, CSS, media)
    html = html.replace(
        /(<script[^>]+src=")\/static\//g,
        `$1${CDN_BASE}/static/`
    );
    
    html = html.replace(
        /(<link[^>]+href=")\/static\//g,
        `$1${CDN_BASE}/static/`
    );
    
    // Also handle any src="/static/ without script tag
    html = html.replace(
        /src="\/static\//g,
        `src="${CDN_BASE}/static/`
    );
    
    html = html.replace(
        /href="\/static\//g,
        `href="${CDN_BASE}/static/`
    );
    
    // Manifest and other root files
    html = html.replace(
        /href="\/manifest\.json"/g,
        `href="${CDN_BASE}/manifest.json"`
    );
    
    html = html.replace(
        /href="\/favicon\.ico"/g,
        `href="${CDN_BASE}/favicon.ico"`
    );
    
    // Logo and image files in root
    html = html.replace(
        /(<link[^>]+href=")\/([^"]+\.(png|jpg|svg|ico))"/g,
        `$1${CDN_BASE}/$2"`
    );
    
    html = html.replace(
        /(<img[^>]+src=")\/([^"]+\.(png|jpg|svg))"/g,
        `$1${CDN_BASE}/$2"`
    );
    
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ Updated index.html with CDN URLs');
    console.log(`  All /static/ paths now point to: ${CDN_BASE}/static/`);
}

// Create README for build folder
const readmeContent = `# NSM Website - CDN Build

This folder contains the production build of the NSM website.

## CDN Configuration

All assets are served from jsDelivr CDN:
\`\`\`
${CDN_BASE}
\`\`\`

## Deployment

1. **GitHub**: Push this entire folder to https://github.com/nsmwce/webapp (main branch)
2. **FTP**: Upload only \`index.html\` to your FTP server
3. **Wait**: jsDelivr fetches from GitHub within 2-3 minutes

## Structure

- \`index.html\` → FTP server (loads everything from CDN)
- \`static/\` → CDN (JavaScript and CSS bundles)
- \`images/\` → CDN (all images)
- \`data/\` → CDN (JSON data files)

## Cache Purging

Only purge CDN cache if absolutely necessary:
https://purge.jsdelivr.net/gh/nsmwce/webapp@main

Or use the admin UI purge button.

## Note

This is an auto-generated build folder. Do not edit files here directly.
Make changes in the main project and rebuild.
`;

fs.writeFileSync(path.join(BUILD_DIR, 'README.md'), readmeContent, 'utf8');
console.log('Created build/README.md');

console.log('\n========================================');
console.log('Build finalization complete!');
console.log('========================================');
console.log('\nNext steps:');
console.log('1. cd build');
console.log('2. git add .');
console.log('3. git commit -m "Update build"');
console.log('4. git push origin main');
console.log('5. Wait 2-3 minutes');
console.log('6. Upload index.html to FTP\n');

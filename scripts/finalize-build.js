const fs = require('fs');
const path = require('path');

const PUBLIC_IMAGES = path.join(__dirname, '..', 'public', 'images');
const PUBLIC_DATA = path.join(__dirname, '..', 'public', 'data');
const PUBLIC_FILES = path.join(__dirname, '..', 'public', 'files');
const BUILD_DIR = path.join(__dirname, '..', 'build');
const BUILD_IMAGES = path.join(BUILD_DIR, 'images');
const BUILD_DATA = path.join(BUILD_DIR, 'data');
const BUILD_FILES = path.join(BUILD_DIR, 'files');
const BUILD_STATIC_JS = path.join(BUILD_DIR, 'static', 'js');
const BUILD_STATIC_CSS = path.join(BUILD_DIR, 'static', 'css');

// CDN points to build/ folder within the repo
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main/build';

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
    console.log(`✓ Copied ${images.length} images to build/images/`);
} else {
    console.log('⚠ No images directory found');
}

// Copy files directory (PDFs, documents)
if (fs.existsSync(PUBLIC_FILES)) {
    if (!fs.existsSync(BUILD_FILES)) {
        fs.mkdirSync(BUILD_FILES, { recursive: true });
    }
    
    const files = fs.readdirSync(PUBLIC_FILES);
    files.forEach(file => {
        fs.copyFileSync(
            path.join(PUBLIC_FILES, file),
            path.join(BUILD_FILES, file)
        );
    });
    console.log(`✓ Copied ${files.length} files to build/files/`);
} else {
    console.log('⚠ No files directory found');
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
    console.log(`✓ Copied ${dataFiles.length} data files to build/data/`);
}

// Rename JS and CSS files to fixed names (no hash)
console.log('\n--- Renaming static files to fixed names ---');

let jsFilename = null;
let cssFilename = null;

// Rename JS file
if (fs.existsSync(BUILD_STATIC_JS)) {
    const jsFiles = fs.readdirSync(BUILD_STATIC_JS).filter(f => f.startsWith('main.') && f.endsWith('.js'));
    if (jsFiles.length > 0) {
        const originalJs = jsFiles[0];
        jsFilename = 'main.js';
        fs.renameSync(
            path.join(BUILD_STATIC_JS, originalJs),
            path.join(BUILD_STATIC_JS, jsFilename)
        );
        console.log(`✓ Renamed ${originalJs} → ${jsFilename}`);
        
        // Also rename the .js.map file if it exists
        const mapFile = originalJs + '.map';
        if (fs.existsSync(path.join(BUILD_STATIC_JS, mapFile))) {
            fs.renameSync(
                path.join(BUILD_STATIC_JS, mapFile),
                path.join(BUILD_STATIC_JS, 'main.js.map')
            );
            console.log(`✓ Renamed ${mapFile} → main.js.map`);
        }
        
        // Also handle LICENSE files
        const licenseFiles = fs.readdirSync(BUILD_STATIC_JS).filter(f => f.endsWith('.LICENSE.txt'));
        licenseFiles.forEach(lf => {
            fs.renameSync(
                path.join(BUILD_STATIC_JS, lf),
                path.join(BUILD_STATIC_JS, 'main.js.LICENSE.txt')
            );
            console.log(`✓ Renamed ${lf} → main.js.LICENSE.txt`);
        });
    }
}

// Rename CSS file
if (fs.existsSync(BUILD_STATIC_CSS)) {
    const cssFiles = fs.readdirSync(BUILD_STATIC_CSS).filter(f => f.startsWith('main.') && f.endsWith('.css'));
    if (cssFiles.length > 0) {
        const originalCss = cssFiles[0];
        cssFilename = 'main.css';
        fs.renameSync(
            path.join(BUILD_STATIC_CSS, originalCss),
            path.join(BUILD_STATIC_CSS, cssFilename)
        );
        console.log(`✓ Renamed ${originalCss} → ${cssFilename}`);
        
        // Also rename the .css.map file if it exists
        const mapFile = originalCss + '.map';
        if (fs.existsSync(path.join(BUILD_STATIC_CSS, mapFile))) {
            fs.renameSync(
                path.join(BUILD_STATIC_CSS, mapFile),
                path.join(BUILD_STATIC_CSS, 'main.css.map')
            );
            console.log(`✓ Renamed ${mapFile} → main.css.map`);
        }
    }
}

// Update index.html to use CDN URLs with fixed filenames
const indexPath = path.join(BUILD_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    
    console.log('\n--- Updating index.html with CDN URLs ---');
    
    // Replace hashed JS filename with fixed name and CDN URL
    html = html.replace(
        /<script[^>]+src="[^"]*\/static\/js\/main\.[a-f0-9]+\.js"[^>]*><\/script>/g,
        `<script defer="defer" src="${CDN_BASE}/static/js/main.js"></script>`
    );
    
    // Replace hashed CSS filename with fixed name and CDN URL
    html = html.replace(
        /<link[^>]+href="[^"]*\/static\/css\/main\.[a-f0-9]+\.css"[^>]*>/g,
        `<link href="${CDN_BASE}/static/css/main.css" rel="stylesheet">`
    );
    
    // Replace other /static/ paths
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
    console.log(`✓ Updated index.html with fixed CDN URLs`);
    console.log(`  JS: ${CDN_BASE}/static/js/main.js`);
    console.log(`  CSS: ${CDN_BASE}/static/css/main.css`);
}

// Create README for build folder
const readmeContent = `# NSM Website - CDN Build

This folder contains the production build of the NSM website.

## CDN Configuration

All assets are served from jsDelivr CDN:
\`\`\`
${CDN_BASE}
\`\`\`

## Fixed Filenames

Static files use fixed names (no hash) so index.html never changes:
- \`static/js/main.js\`
- \`static/css/main.css\`

After updating, just push to GitHub and purge CDN cache.

## Deployment

1. **GitHub**: Push the entire project to https://github.com/nsmwce/webapp (main branch)
2. **FTP**: Upload \`build/index.html\` ONCE (never needs updating)
3. **Updates**: Just push to GitHub and purge CDN

## Structure

- \`index.html\` → FTP server (upload once, never change)
- \`static/\` → CDN (JavaScript and CSS bundles)
- \`images/\` → CDN (all images)
- \`files/\` → CDN (PDFs and documents)
- \`data/\` → CDN (JSON data files)

## Cache Purging

After pushing updates to GitHub, purge the CDN cache:
https://purge.jsdelivr.net/gh/nsmwce/webapp@main/build

Or use the admin UI purge button.

## Note

This is an auto-generated build folder. Do not edit files here directly.
Make changes in the main project and rebuild.
`;

fs.writeFileSync(path.join(BUILD_DIR, 'README.md'), readmeContent, 'utf8');
console.log('\n✓ Created build/README.md');

// Show file sizes
console.log('\n--- Build file sizes ---');
const showSize = (dir, label) => {
    if (fs.existsSync(dir)) {
        let totalSize = 0;
        const countFiles = (d) => {
            fs.readdirSync(d).forEach(f => {
                const fp = path.join(d, f);
                const stat = fs.statSync(fp);
                if (stat.isDirectory()) {
                    countFiles(fp);
                } else {
                    totalSize += stat.size;
                }
            });
        };
        countFiles(dir);
        console.log(`  ${label}: ${(totalSize / 1024).toFixed(1)} KB`);
    }
};

showSize(BUILD_STATIC_JS, 'static/js');
showSize(BUILD_STATIC_CSS, 'static/css');
showSize(BUILD_IMAGES, 'images');
showSize(BUILD_FILES, 'files');
showSize(BUILD_DATA, 'data');

console.log('\n========================================');
console.log('Build finalization complete!');
console.log('========================================');
console.log('\n✨ index.html now uses FIXED filenames!');
console.log('   You only need to upload it to FTP ONCE.');
console.log('\nFor updates:');
console.log('1. npm run build');
console.log('2. git add . && git commit -m "Update" && git push');
console.log('3. Purge CDN cache (admin UI or jsdelivr.com/tools/purge)');
console.log('4. NO need to re-upload index.html!\n');

const fs = require('fs');
const path = require('path');

const BUILD_INDEX = path.join(__dirname, '..', 'build', 'index.html');
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main/build';

console.log('========================================');
console.log('Verifying CDN URLs in build/index.html');
console.log('========================================\n');

if (!fs.existsSync(BUILD_INDEX)) {
    console.error('❌ build/index.html not found!');
    console.error('   Run: npm run build\n');
    process.exit(1);
}

const html = fs.readFileSync(BUILD_INDEX, 'utf8');

// Check for CDN URLs
const cdnJsRegex = new RegExp(`${CDN_BASE}/static/js/`, 'g');
const cdnCssRegex = new RegExp(`${CDN_BASE}/static/css/`, 'g');

const jsMatches = html.match(cdnJsRegex);
const cssMatches = html.match(cdnCssRegex);

console.log('CDN URL Check:');
console.log(`✓ JavaScript bundles: ${jsMatches ? jsMatches.length : 0} found`);
console.log(`✓ CSS bundles: ${cssMatches ? cssMatches.length : 0} found`);

// Check for local /static/ paths (should not exist)
const localStaticRegex = /(?:src|href)="\/static\//g;
const localMatches = html.match(localStaticRegex);

if (localMatches) {
    console.log('\n⚠️  WARNING: Found local /static/ paths:');
    console.log(`   Count: ${localMatches.length}`);
    console.log('   These should be CDN URLs!');
    console.log('\n   The postbuild script may not have run correctly.');
    console.log('   Try running: npm run build\n');
} else {
    console.log('✓ No local /static/ paths found (good!)');
}

// Extract and display actual CDN URLs
const scriptTags = html.match(/<script[^>]+src="[^"]+"><\/script>/g) || [];
const linkTags = html.match(/<link[^>]+href="[^"]+"[^>]*>/g) || [];

console.log('\n========================================');
console.log('Found Asset URLs:');
console.log('========================================\n');

if (scriptTags.length > 0) {
    console.log('JavaScript files:');
    scriptTags.forEach(tag => {
        const match = tag.match(/src="([^"]+)"/);
        if (match) {
            const url = match[1];
            if (url.includes('static/js/')) {
                console.log(`  ${url}`);
            }
        }
    });
}

if (linkTags.length > 0) {
    console.log('\nCSS files:');
    linkTags.forEach(tag => {
        const match = tag.match(/href="([^"]+)"/);
        if (match) {
            const url = match[1];
            if (url.includes('static/css/')) {
                console.log(`  ${url}`);
            }
        }
    });
}

console.log('\n========================================');
console.log('Verification Summary:');
console.log('========================================');

if (!localMatches && (jsMatches || cssMatches)) {
    console.log('✅ All URLs are properly configured for CDN!');
    console.log('\nNext steps:');
    console.log('1. cd build');
    console.log('2. git add .');
    console.log('3. git commit -m "Update build"');
    console.log('4. git push origin main');
    console.log('5. Wait 2-3 minutes');
    console.log('6. Upload index.html to FTP\n');
} else {
    console.log('❌ CDN URLs not properly configured');
    console.log('\nPlease run: npm run build\n');
    process.exit(1);
}

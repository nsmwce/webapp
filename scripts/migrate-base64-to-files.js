const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const FILES_DIR = path.join(__dirname, '..', 'public', 'files');

// Ensure directories exist
[IMAGES_DIR, FILES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// File mappings
const FILES = {
    coordinators: 'nsm-database.coordinators.json',
    eventphotos: 'nsm-database.eventphotos.json',
    sisternodals: 'nsm-database.sisternodals.json',
    events: 'nsm-database.events.json',
    importantlinks: 'nsm-database.importantlinks.json'
};

let imageCounter = 0;
let fileCounter = 0;

function getExtension(contentType) {
    const map = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'text/plain': 'txt'
    };
    return map[contentType] || 'bin';
}

function extractBase64ToFile(base64Data, contentType, prefix, id, isImage = true) {
    const ext = getExtension(contentType);
    const filename = `${prefix}-${id}.${ext}`;
    const dir = isImage ? IMAGES_DIR : FILES_DIR;
    const filepath = path.join(dir, filename);
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write file
    fs.writeFileSync(filepath, buffer);
    
    if (isImage) {
        imageCounter++;
    } else {
        fileCounter++;
    }
    
    return filename;
}

function migrateCoordinators() {
    console.log('\nMigrating coordinators...');
    const filepath = path.join(DATA_DIR, FILES.coordinators);
    
    if (!fs.existsSync(filepath)) {
        console.log('  File not found, skipping');
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let changed = false;
    
    const updated = data.map(item => {
        // Check if photo is still in base64 format
        if (item.photo && item.photo.data && item.photo.data.$binary) {
            const base64 = item.photo.data.$binary.base64;
            const contentType = item.photo.contentType || 'image/jpeg';
            const id = item._id.$oid;
            
            const filename = extractBase64ToFile(base64, contentType, 'coordinator', id, true);
            console.log(`  Extracted image: ${filename}`);
            changed = true;
            
            return {
                ...item,
                photo: filename
            };
        }
        return item;
    });
    
    if (changed) {
        fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    }
    console.log(`  Processed ${updated.length} items`);
}

function migrateEventPhotos() {
    console.log('\nMigrating event photos...');
    const filepath = path.join(DATA_DIR, FILES.eventphotos);
    
    if (!fs.existsSync(filepath)) {
        console.log('  File not found, skipping');
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let changed = false;
    
    const updated = data.map(item => {
        // Check if data field has base64 (old format)
        if (item.data && item.data.$binary) {
            const base64 = item.data.$binary.base64;
            const contentType = item.contentType || 'image/jpeg';
            const id = item._id.$oid;
            
            const filename = extractBase64ToFile(base64, contentType, 'event', id, true);
            console.log(`  Extracted image: ${filename}`);
            changed = true;
            
            // Change 'data' field to 'image' field
            const newItem = {
                _id: item._id,
                caption: item.caption,
                image: filename,
                createdAt: item.createdAt,
                __v: item.__v
            };
            
            return newItem;
        }
        return item;
    });
    
    if (changed) {
        fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    }
    console.log(`  Processed ${updated.length} items`);
}

function migrateSisterNodals() {
    console.log('\nMigrating sister nodals...');
    const filepath = path.join(DATA_DIR, FILES.sisternodals);
    
    if (!fs.existsSync(filepath)) {
        console.log('  File not found, skipping');
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let changed = false;
    
    const updated = data.map(item => {
        if (item.photo && item.photo.data && item.photo.data.$binary) {
            const base64 = item.photo.data.$binary.base64;
            const contentType = item.photo.contentType || 'image/jpeg';
            const id = item._id.$oid;
            
            const filename = extractBase64ToFile(base64, contentType, 'nodal', id, true);
            console.log(`  Extracted image: ${filename}`);
            changed = true;
            
            return {
                ...item,
                photo: filename
            };
        }
        return item;
    });
    
    if (changed) {
        fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    }
    console.log(`  Processed ${updated.length} items`);
}

function migrateEvents() {
    console.log('\nMigrating events (extracting PDF reports)...');
    const filepath = path.join(DATA_DIR, FILES.events);
    
    if (!fs.existsSync(filepath)) {
        console.log('  File not found, skipping');
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let changed = false;
    
    const updated = data.map(item => {
        // Check if file field has base64 data
        if (item.file && item.file.data && item.file.data.$binary) {
            const base64 = item.file.data.$binary.base64;
            const contentType = item.file.contentType || 'application/pdf';
            const id = item._id.$oid;
            
            const filename = extractBase64ToFile(base64, contentType, 'event-report', id, false);
            console.log(`  Extracted file: ${filename}`);
            changed = true;
            
            return {
                ...item,
                file: filename
            };
        }
        return item;
    });
    
    if (changed) {
        fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    }
    console.log(`  Processed ${updated.length} items`);
}

function migrateImportantLinks() {
    console.log('\nMigrating important links (extracting files)...');
    const filepath = path.join(DATA_DIR, FILES.importantlinks);
    
    if (!fs.existsSync(filepath)) {
        console.log('  File not found, skipping');
        return;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    let changed = false;
    
    const updated = data.map(item => {
        // Check if file field has base64 data
        if (item.file && item.file.data && item.file.data.$binary) {
            const base64 = item.file.data.$binary.base64;
            const contentType = item.file.contentType || 'application/pdf';
            const id = item._id.$oid;
            
            // Use title for filename if available
            const safeTitle = item.title ? 
                item.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30).toLowerCase() : 
                id;
            
            const filename = extractBase64ToFile(base64, contentType, `link-${safeTitle}`, id, false);
            console.log(`  Extracted file: ${filename}`);
            changed = true;
            
            return {
                ...item,
                file: filename
            };
        }
        return item;
    });
    
    if (changed) {
        fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    }
    console.log(`  Processed ${updated.length} items`);
}

// Run migration
console.log('========================================');
console.log('Starting Base64 to File Migration');
console.log('========================================');
console.log(`\nData directory: ${DATA_DIR}`);
console.log(`Images directory: ${IMAGES_DIR}`);
console.log(`Files directory: ${FILES_DIR}`);

try {
    migrateCoordinators();
    migrateEventPhotos();
    migrateSisterNodals();
    migrateEvents();
    migrateImportantLinks();
    
    console.log('\n========================================');
    console.log('Migration Complete!');
    console.log('========================================');
    console.log(`Images extracted: ${imageCounter}`);
    console.log(`Files extracted: ${fileCounter}`);
    console.log(`Images saved to: ${IMAGES_DIR}`);
    console.log(`Files saved to: ${FILES_DIR}`);
    
    // Show file sizes after migration
    console.log('\n--- File sizes after migration ---');
    Object.values(FILES).forEach(filename => {
        const filepath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(`  ${filename}: ${sizeKB} KB`);
        }
    });
    
    console.log('\n========================================\n');
} catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
}

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// File mappings
const FILES = {
    coordinators: 'nsm-database.coordinators.json',
    eventphotos: 'nsm-database.eventphotos.json',
    sisternodals: 'nsm-database.sisternodals.json'
};

let imageCounter = 0;

function extractBase64ToFile(base64Data, contentType, prefix, id) {
    // Get file extension from content type
    const ext = contentType.includes('png') ? 'png' : 
                contentType.includes('gif') ? 'gif' : 
                contentType.includes('webp') ? 'webp' : 'jpg';
    
    // Generate filename
    const filename = `${prefix}-${id}.${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write file
    fs.writeFileSync(filepath, buffer);
    imageCounter++;
    
    return filename;
}

function migrateCoordinators() {
    console.log('\nMigrating coordinators...');
    const filepath = path.join(DATA_DIR, FILES.coordinators);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    const updated = data.map(item => {
        if (item.photo && item.photo.data && item.photo.data.$binary) {
            const base64 = item.photo.data.$binary.base64;
            const contentType = item.photo.contentType || 'image/jpeg';
            const id = item._id.$oid;
            
            const filename = extractBase64ToFile(base64, contentType, 'coordinator', id);
            console.log(`  Extracted: ${filename}`);
            
            return {
                ...item,
                photo: filename
            };
        }
        return item;
    });
    
    fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    console.log(`Coordinators migrated: ${updated.length} items`);
}

function migrateEventPhotos() {
    console.log('\nMigrating event photos...');
    const filepath = path.join(DATA_DIR, FILES.eventphotos);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    const updated = data.map(item => {
        if (item.data && item.data.$binary) {
            const base64 = item.data.$binary.base64;
            const contentType = item.contentType || 'image/jpeg';
            const id = item._id.$oid;
            
            const filename = extractBase64ToFile(base64, contentType, 'event', id);
            console.log(`  Extracted: ${filename}`);
            
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
    
    fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    console.log(`Event photos migrated: ${updated.length} items`);
}

function migrateSisterNodals() {
    console.log('\nMigrating sister nodals...');
    const filepath = path.join(DATA_DIR, FILES.sisternodals);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    const updated = data.map(item => {
        if (item.photo && item.photo.data && item.photo.data.$binary) {
            const base64 = item.photo.data.$binary.base64;
            const contentType = item.photo.contentType || 'image/jpeg';
            const id = item._id.$oid;
            
            const filename = extractBase64ToFile(base64, contentType, 'nodal', id);
            console.log(`  Extracted: ${filename}`);
            
            return {
                ...item,
                photo: filename
            };
        }
        return item;
    });
    
    fs.writeFileSync(filepath, JSON.stringify(updated, null, 2), 'utf8');
    console.log(`Sister nodals migrated: ${updated.length} items`);
}

// Run migration
console.log('========================================');
console.log('Starting Base64 to File Migration');
console.log('========================================');

try {
    migrateCoordinators();
    migrateEventPhotos();
    migrateSisterNodals();
    
    console.log('\n========================================');
    console.log(`Migration Complete!`);
    console.log(`Total images extracted: ${imageCounter}`);
    console.log(`Images saved to: ${IMAGES_DIR}`);
    console.log('========================================\n');
} catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
}

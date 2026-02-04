const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const collection = req.body.collection || 'image';
    cb(null, `${collection}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for file uploads (PDFs, documents)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const filesDir = path.join(__dirname, 'public', 'files');
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }
    cb(null, filesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(7);
    const ext = path.extname(file.originalname);
    const collection = req.body.collection || 'file';
    cb(null, `${collection}-${uniqueSuffix}${ext}`);
  }
});

const uploadFile = multer({ 
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for documents
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (PDF, DOC, XLS, PPT, TXT)'));
    }
  }
});

// Serve admin UI
app.use(express.static(path.join(__dirname, 'admin')));

// Collection to file mapping
const COLLECTIONS = {
  coordinators: 'nsm-database.coordinators.json',
  events: 'nsm-database.events.json',
  eventphotos: 'nsm-database.eventphotos.json',
  importantlinks: 'nsm-database.importantlinks.json',
  materials: 'nsm-database.materials.json',
  sisternodals: 'nsm-database.sisternodals.json'
};

const DATA_DIR = path.join(__dirname, 'public', 'data');

// Helper to read JSON file
function readCollection(collection) {
  const filename = COLLECTIONS[collection];
  if (!filename) {
    throw new Error('Invalid collection');
  }
  const filePath = path.join(DATA_DIR, filename);
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper to write JSON file
function writeCollection(collection, data) {
  const filename = COLLECTIONS[collection];
  if (!filename) {
    throw new Error('Invalid collection');
  }
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Helper to generate MongoDB-style ObjectId
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = Math.random().toString(16).substring(2, 18);
  return (timestamp + random).substring(0, 24);
}

// GET all items from a collection
app.get('/api/data/:collection', (req, res) => {
  try {
    const data = readCollection(req.params.collection);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new item to collection
app.post('/api/data/:collection', (req, res) => {
  try {
    const data = readCollection(req.params.collection);
    const newItem = {
      _id: { $oid: generateObjectId() },
      ...req.body,
      createdAt: { $date: new Date().toISOString() },
      __v: 0
    };
    data.push(newItem);
    writeCollection(req.params.collection, data);
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update item in collection
app.put('/api/data/:collection/:id', (req, res) => {
  try {
    const data = readCollection(req.params.collection);
    const index = data.findIndex(item => item._id.$oid === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    // Keep the _id and merge with new data
    data[index] = {
      ...data[index],
      ...req.body,
      _id: data[index]._id
    };
    writeCollection(req.params.collection, data);
    res.json(data[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE item from collection
app.delete('/api/data/:collection/:id', (req, res) => {
  try {
    const data = readCollection(req.params.collection);
    const filtered = data.filter(item => item._id.$oid !== req.params.id);
    if (filtered.length === data.length) {
      return res.status(404).json({ error: 'Item not found' });
    }
    writeCollection(req.params.collection, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST upload image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      filename: req.file.filename,
      path: `/images/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve images for preview in admin UI
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// POST upload file (PDF, documents)
app.post('/api/upload-file', uploadFile.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      filename: req.file.filename,
      path: `/files/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve files for preview/download in admin UI
app.use('/files', express.static(path.join(__dirname, 'public', 'files')));

// POST trigger build
app.post('/api/build', (req, res) => {
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ 
        error: error.message,
        stderr: stderr
      });
    }
    res.json({ 
      success: true, 
      output: stdout,
      message: 'Build completed successfully'
    });
  });
});

// POST purge CDN cache (proxy to avoid CORS issues)
app.post('/api/purge-cdn', async (req, res) => {
  const https = require('https');
  
  const filesToPurge = [
    '/static/js/main.js',
    '/static/css/main.css',
    '/data/nsm-database.coordinators.json',
    '/data/nsm-database.events.json',
    '/data/nsm-database.eventphotos.json',
    '/data/nsm-database.importantlinks.json',
    '/data/nsm-database.materials.json',
    '/data/nsm-database.sisternodals.json',
    '/wce-logo.png',
    '/nsm-logo.png',
    '/favicon.ico',
  ];
  
  // Add images from public/images
  const imagesDir = path.join(__dirname, 'public', 'images');
  if (fs.existsSync(imagesDir)) {
    fs.readdirSync(imagesDir).forEach(file => {
      if (!file.startsWith('.')) {
        filesToPurge.push(`/images/${file}`);
      }
    });
  }
  
  // Add files from public/files
  const filesDir = path.join(__dirname, 'public', 'files');
  if (fs.existsSync(filesDir)) {
    fs.readdirSync(filesDir).forEach(file => {
      if (!file.startsWith('.')) {
        filesToPurge.push(`/files/${file}`);
      }
    });
  }
  
  const PURGE_BASE = 'https://purge.jsdelivr.net/gh/nsmwce/webapp@main/build';
  
  const purgeUrl = (url) => {
    return new Promise((resolve) => {
      const req = https.request(url, { method: 'GET' }, (response) => {
        resolve({ status: response.statusCode });
      });
      req.on('error', (e) => resolve({ error: e.message }));
      req.end();
    });
  };
  
  let success = 0;
  let failed = 0;
  const results = [];
  
  for (const file of filesToPurge) {
    const url = `${PURGE_BASE}${file}`;
    const result = await purgeUrl(url);
    if (result.status === 200) {
      success++;
      results.push({ file, status: 'ok' });
    } else {
      failed++;
      results.push({ file, status: 'failed', error: result.error || result.status });
    }
  }
  
  // Also purge root
  await purgeUrl(PURGE_BASE);
  
  res.json({
    success: true,
    message: `Purged ${success} files, ${failed} failed`,
    totalFiles: filesToPurge.length,
    successCount: success,
    failedCount: failed
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Admin server running at http://localhost:${PORT}`);
  console.log(`========================================`);
  console.log('\nFeatures:');
  console.log('- Manage all data collections');
  console.log('- Upload images (saved to public/images/)');
  console.log('- Upload files/PDFs (saved to public/files/)');
  console.log('- Trigger builds');
  console.log('- Purge CDN cache\n');
});

#!/usr/bin/env node

/**
 * Purge jsDelivr CDN cache for the webapp
 * Usage: node scripts/purge-cdn.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main/build';
const PURGE_BASE = 'https://purge.jsdelivr.net/gh/nsmwce/webapp@main/build';

// Core files to always purge
const coreFiles = [
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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ url, status: res.statusCode, data });
      });
    });
    req.on('error', (e) => reject({ url, error: e.message }));
    req.end();
  });
}

function getFilesFromDir(dir, prefix) {
  const files = [];
  const fullDir = path.join(__dirname, '..', 'public', dir);
  
  if (fs.existsSync(fullDir)) {
    fs.readdirSync(fullDir).forEach(file => {
      if (!file.startsWith('.')) {
        files.push(`/${prefix}/${file}`);
      }
    });
  }
  return files;
}

async function main() {
  console.log('='.repeat(50));
  console.log('jsDelivr CDN Cache Purge');
  console.log('='.repeat(50));
  console.log('\nPurging cache for:', CDN_BASE);
  
  // Build complete file list
  const filesToPurge = [
    ...coreFiles,
    ...getFilesFromDir('images', 'images'),
    ...getFilesFromDir('files', 'files'),
  ];
  
  console.log(`\nFound ${filesToPurge.length} files to purge\n`);

  let success = 0;
  let failed = 0;

  // Purge files
  for (const file of filesToPurge) {
    const url = `${PURGE_BASE}${file}`;
    process.stdout.write(`Purging ${file}... `);
    
    try {
      const result = await fetchUrl(url);
      if (result.status === 200) {
        console.log('✓');
        success++;
      } else {
        console.log(`(status: ${result.status})`);
        failed++;
      }
    } catch (err) {
      console.log(`✗ ${err.error}`);
      failed++;
    }
  }

  // Also purge the root
  console.log('\nPurging root path...');
  try {
    await fetchUrl(PURGE_BASE);
    console.log('✓ Root purged');
    success++;
  } catch (err) {
    console.log('✗ Root purge failed');
    failed++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Purge complete! ${success} succeeded, ${failed} failed`);
  console.log('='.repeat(50));
  console.log('\nNote: It may take 1-5 minutes for all CDN nodes to update.');
  console.log('You can also manually purge at: https://www.jsdelivr.com/tools/purge');
  console.log(`Enter URL: ${CDN_BASE}`);
}

main().catch(console.error);

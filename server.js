const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

const app = express();
const PORT = process.env.PORT || 3000;
const STORAGE_DIR = path.join(__dirname, 'js', 'views', 'storage.1');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));

// Ensure storage.1 directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  console.log(`✓ Created storage directory: ${STORAGE_DIR}`);
}

// API: Save data to storage.1
app.post('/api/save', (req, res) => {
  try {
    const { key, data, timestamp } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const fileName = `${key}-${Date.now()}.json`;
    const filePath = path.join(STORAGE_DIR, fileName);
    
    const payload = {
      key,
      data,
      timestamp: timestamp || new Date().toISOString(),
      savedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    console.log(`📝 Saved: ${fileName}`);
    
    res.json({ 
      success: true, 
      file: fileName,
      path: filePath
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get all saved data from storage.1
app.get('/api/load/:key', (req, res) => {
  try {
    const { key } = req.params;
    const files = fs.readdirSync(STORAGE_DIR);
    const matching = files
      .filter(f => f.startsWith(key))
      .sort()
      .reverse();

    if (matching.length === 0) {
      return res.json({ success: true, data: null, files: [] });
    }

    const latestFile = matching[0];
    const filePath = path.join(STORAGE_DIR, latestFile);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    res.json({ 
      success: true, 
      data: content,
      files: matching.slice(0, 10)
    });
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: List all saved files in storage.1
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(STORAGE_DIR);
    const fileStats = files.map(file => {
      const filePath = path.join(STORAGE_DIR, file);
      const stat = fs.statSync(filePath);
      return {
        name: file,
        size: stat.size,
        modified: stat.mtime
      };
    }).sort((a, b) => b.modified - a.modified);

    res.json({ 
      success: true, 
      count: fileStats.length,
      files: fileStats 
    });
  } catch (error) {
    console.error('Files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Clear storage (optional)
app.post('/api/clear', (req, res) => {
  try {
    const files = fs.readdirSync(STORAGE_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(STORAGE_DIR, file));
    });
    res.json({ success: true, cleared: files.length });
  } catch (error) {
    console.error('Clear error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Watch for file changes in storage.1
const watcher = chokidar.watch(STORAGE_DIR, {
  persistent: true,
  ignored: /(^|[\/\\])\./,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 100
  }
});

watcher
  .on('add', (filePath) => {
    console.log(`🆕 New file saved: ${path.basename(filePath)}`);
  })
  .on('change', (filePath) => {
    console.log(`📝 File updated: ${path.basename(filePath)}`);
  })
  .on('unlink', (filePath) => {
    console.log(`🗑️  File deleted: ${path.basename(filePath)}`);
  });

// Server startup
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         MHT-CET Interactive Learning Platform              ║
║              Development Server Ready ✓                     ║
╚════════════════════════════════════════════════════════════╝

  🌐 Local:   http://localhost:${PORT}
  📁 Storage: ${STORAGE_DIR}
  
  API Endpoints:
  ├─ POST   /api/save        → Save data with key
  ├─ GET    /api/load/:key   → Load latest data for key
  ├─ GET    /api/files       → List all saved files
  └─ POST   /api/clear       → Clear all storage files

  Ready to go! Open http://localhost:${PORT} in your browser.
`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  watcher.close();
  console.log('\n✓ Server closed gracefully');
  process.exit(0);
});

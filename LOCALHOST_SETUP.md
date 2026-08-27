# 🚀 MHT-CET Development Server Setup

Your localhost development server is now ready! Here's how to get started.

## ⚡ Quick Start

### 1. Install Dependencies
Open a terminal/PowerShell in the `f:\MHT-CET` folder and run:

```bash
npm install
```

This will install Express, CORS, body-parser, and chokidar.

### 2. Start the Server
Run the development server:

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║         MHT-CET Interactive Learning Platform              ║
║              Development Server Ready ✓                     ║
╚════════════════════════════════════════════════════════════╝

  🌐 Local:   http://localhost:3000
  📁 Storage: f:\MHT-CET\js\views\storage.1
```

### 3. Open in Browser
Visit **http://localhost:3000** in your browser

---

## 💾 Storage System

All your changes are automatically saved to `js/views/storage.1/` folder.

### Available API Endpoints

#### Save Data
```javascript
// Using the global storageClient instance
await storageClient.save(key, data, type);

// Examples:
await storageClient.saveProgress('user-123', { chapter: 1, progress: 45 });
await storageClient.saveTestResult('test-001', { score: 85, time: 3600 });
await storageClient.saveNotes('user-123', { topic: 'Kinematics', notes: '...' });
```

#### Load Data
```javascript
const progress = await storageClient.loadProgress('user-123');
const testResult = await storageClient.loadTestResult('test-001');
const notes = await storageClient.loadNotes('user-123');
```

#### List All Saved Files
```javascript
const files = await storageClient.listFiles();
```

#### Manual HTTP Requests

**POST /api/save** - Save data
```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"key": "progress-user1", "data": {...}, "timestamp": "2026-08-17T..."}'
```

**GET /api/load/:key** - Load data
```bash
curl http://localhost:3000/api/load/progress-user1
```

**GET /api/files** - List saved files
```bash
curl http://localhost:3000/api/files
```

**POST /api/clear** - Clear all storage (⚠️ be careful!)
```bash
curl -X POST http://localhost:3000/api/clear
```

---

## 📁 Storage Structure

Files are saved in `js/views/storage.1/` with this naming pattern:

```
{type}-{key}-{timestamp}.json
```

Examples:
- `progress-user-123-1692374400000.json`
- `test-result-test-001-1692374410000.json`
- `notes-user-123-1692374420000.json`

Each file is timestamped so you can track changes over time.

---

## 🔄 Auto-Save

The storage client automatically:
- ✅ Saves data every 30 seconds
- ✅ Tracks file changes in the storage folder
- ✅ Queues changes if server is offline (syncs when reconnected)

---

## 🎯 Usage Examples

### Integrating with Your App

In your JavaScript code, you can now use the global `storageClient`:

```javascript
// Save user progress
async function saveProgress() {
  await storageClient.saveProgress('user-123', {
    subject: 'physics',
    chapter: 'kinematics',
    completionPercentage: 75,
    lastAccessed: new Date().toISOString()
  });
}

// Load user progress
async function loadProgress() {
  const data = await storageClient.loadProgress('user-123');
  console.log('User progress:', data);
}

// Save test result
async function saveTestResult() {
  await storageClient.saveTestResult('test-2026-08-17', {
    userId: 'user-123',
    score: 85,
    totalQuestions: 100,
    timeSpent: 3600,
    correctAnswers: 85,
    answers: [...],
    timestamp: new Date().toISOString()
  });
}
```

### Monitor Files Being Saved

When you run the server, you'll see live updates like:
```
📝 Saved: progress-user-123-1692374400000.json
📝 Saved: test-result-test-001-1692374410000.json
🆕 New file saved: notes-user-123-1692374420000.json
📝 File updated: progress-user-123-1692374400000.json
🗑️  File deleted: old-data-1691374400000.json
```

---

## 🛠️ Troubleshooting

### Port 3000 Already in Use?
Change the port:
```bash
$env:PORT=3001; npm start
```

### Server Won't Start?
1. Check Node.js is installed: `node --version`
2. Delete `node_modules` and reinstall:
   ```bash
   Remove-Item -Recurse -Force node_modules
   npm install
   npm start
   ```

### Storage Folder Not Created?
The server auto-creates `js/views/storage.1/`. If it still doesn't work, manually create it.

### Can't Connect to http://localhost:3000?
- Make sure the server is running
- Try `http://127.0.0.1:3000` instead
- Check if Windows Firewall is blocking port 3000

---

## 📊 What Gets Saved?

Your app can save any type of data:
- ✅ User progress and completion status
- ✅ Test results and scores
- ✅ Notes and mistakes
- ✅ Custom data (pass any JSON)
- ✅ Application state
- ✅ Session data

---

## 🔗 Server Files

- **`server.js`** - Main Express server with API endpoints
- **`js/storage-client.js`** - Client library for your app to use
- **`package.json`** - Dependencies configuration
- **`js/views/storage.1/`** - Where all your data is saved

---

## ✨ Features

✅ **Zero Configuration** - Just `npm install && npm start`  
✅ **Auto-Save** - Every 30 seconds  
✅ **File Watching** - Real-time tracking of changes  
✅ **Offline Support** - Queues changes when offline  
✅ **Timestamped** - All files include creation time  
✅ **REST API** - Easy HTTP access to all data  
✅ **JSON Storage** - Human-readable file format  

---

## 🚀 Next Steps

1. Run `npm install` in `f:\MHT-CET`
2. Run `npm start`
3. Open http://localhost:3000
4. Start building! Use `storageClient.save()` to persist your data
5. Check `js/views/storage.1/` to see your saved files

Happy coding! 🎉

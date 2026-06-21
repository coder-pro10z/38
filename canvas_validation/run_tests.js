// canvas_validation/run_tests.js
// Run: node canvas_validation/run_tests.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT_DIR = path.join(__dirname, '..');

// Helper to determine Content-Type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.png': return 'image/png';
    default: return 'application/octet-stream';
  }
}

// Create native http server
const server = http.createServer((req, res) => {
  // Handle POST report endpoint
  if (req.method === 'POST' && req.url === '/report') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const report = JSON.parse(body);
        printReport(report);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'received' }));
        
        // Shut down server after a short delay
        setTimeout(() => {
          server.close(() => {
            console.log("\n🛑 Local test server stopped.");
            process.exit(report.failed === 0 ? 0 : 1);
          });
        }, 1000);
      } catch (e) {
        console.error("❌ Failed to parse report:", e.message);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end("Bad Request");
      }
    });
    return;
  }

  // Handle static file serving
  if (req.method === 'GET') {
    // Prevent directory traversal
    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/') safeUrl = '/index.html';
    
    const filePath = path.join(ROOT_DIR, safeUrl);
    
    // Check if path is within root directory
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

// Print validation report to console
function printReport(report) {
  console.log("\n==================================================");
  console.log("📊 CANVAS RENDERING INTEGRITY REPORT");
  console.log("==================================================");
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`Total Evaluated: ${report.total}`);
  console.log("--------------------------------------------------");
  
  Object.keys(report.results).forEach(idx => {
    const slideNum = parseInt(idx, 10) + 1;
    const result = report.results[idx];
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} Slide ${slideNum.toString().padStart(2, ' ')}: [${result.status.toUpperCase()}]`);
    if (result.status === 'error') {
      result.errors.forEach(err => console.log(`   └─ Error: ${err}`));
    }
  });
  console.log("==================================================");
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Validation server running at http://localhost:${PORT}/`);
  console.log(`📂 Serving workspace files from: ${ROOT_DIR}`);
  console.log(`📡 Waiting for browser client connection and test suite execution...`);
  
  const testUrl = `http://localhost:${PORT}/canvas_validation/test_harness.html`;
  console.log(`🔗 Opening test harness: ${testUrl}`);
  
  // Open in default browser based on OS
  let startCmd;
  if (process.platform === 'win32') {
    startCmd = `start ${testUrl}`;
  } else if (process.platform === 'darwin') {
    startCmd = `open ${testUrl}`;
  } else {
    startCmd = `xdg-open ${testUrl}`;
  }
  
  exec(startCmd, (err) => {
    if (err) {
      console.warn("⚠️ Could not open default browser automatically. Please visit the link manually to run the tests!");
    }
  });
});

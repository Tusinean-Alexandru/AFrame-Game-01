const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const SRC_DIR = path.join(__dirname, 'src');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(SRC_DIR, req.url);
  
  // Default to index.html for root
  if (req.url === '/' || filePath.endsWith('src') || filePath.endsWith('src' + path.sep)) {
    filePath = path.join(SRC_DIR, 'index.html');
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      console.log(`404: ${filePath}`);
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
      console.log(`200: ${filePath}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${SRC_DIR}`);
  console.log(`Press Ctrl+C to stop the server`);
});
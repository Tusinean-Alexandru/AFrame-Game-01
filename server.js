const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.gltf': 'model/gltf+json',
  '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT_DIR, req.url);
  
  // Default to index.html for root
  if (req.url === '/') {
    filePath = path.join(ROOT_DIR, 'index.html');
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      console.log(`404: ${filePath}`);
    } else {
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
      console.log(`200: ${filePath}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving files from: ${ROOT_DIR}`);
  console.log(`Press Ctrl+C to stop the server`);
});
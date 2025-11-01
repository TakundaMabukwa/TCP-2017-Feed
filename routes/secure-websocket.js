const https = require('https');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// SSL Certificate paths for DigitalOcean
const SSL_OPTIONS = {
  key: fs.readFileSync(path.join(__dirname, '../certs/private-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/certificate.pem'))
};

function createSecureWebSocketServer(httpHandler, port) {
  // Create HTTPS server
  const httpsServer = https.createServer(SSL_OPTIONS, httpHandler);
  
  // Create secure WebSocket server
  const wss = new WebSocket.Server({ 
    server: httpsServer,
    verifyClient: (info) => {
      // Add origin validation
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['https://localhost'];
      return allowedOrigins.includes(info.origin) || !info.origin; // Allow no origin for testing
    }
  });

  // Add authentication
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, 'https://localhost');
    const token = url.searchParams.get('token');
    
    if (process.env.WS_TOKEN && token !== process.env.WS_TOKEN) {
      ws.close(1008, 'Invalid token');
      return;
    }
    
    console.log('Secure WebSocket connection established');
  });

  httpsServer.listen(port, () => {
    console.log(`🔒 Secure WebSocket server running on port ${port}`);
    console.log(`📡 Secure WebSocket endpoint: wss://localhost:${port}`);
  });

  return { httpsServer, wss };
}

module.exports = { createSecureWebSocketServer };
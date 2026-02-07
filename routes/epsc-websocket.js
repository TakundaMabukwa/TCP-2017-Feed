const WebSocket = require('ws');
const http = require('http');
const { pool } = require('../config/database');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Message queue to ensure no data loss
const messageQueue = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || messageQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (messageQueue.length > 0) {
    const { data } = messageQueue.shift();
    const sends = [];
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        sends.push(
          new Promise((resolve) => {
            client.send(JSON.stringify(data), (err) => {
              if (err) console.error('WS send error:', err);
              resolve();
            });
          })
        );
      }
    });
    
    await Promise.all(sends);
  }
  
  isProcessingQueue = false;
}

async function broadcastEpscData(trackingData) {
  try {
    // Check if this vehicle belongs to EPSC-0001 account
    const result = await pool.query(
      'SELECT account_number FROM vehicles WHERE (ip_address = $1 OR reg = $2 OR plate = $3) AND account_number = $4',
      [trackingData.Pocsagstr, trackingData.Plate, trackingData.Plate, 'EPSC-0001']
    );
    
    if (result.rows.length > 0) {
      // Send data as is - no mapping or transformation
      messageQueue.push({ data: trackingData });
      
      // Process queue immediately
      processQueue();
    }
  } catch (err) {
    // Log error but don't throw - we don't want DB issues to block broadcasts
    console.error('EPSC broadcast error:', err);
  }
}

wss.on('connection', (ws) => {
  console.log('EPSC-0001 WebSocket client connected');
  
  ws.on('close', () => {
    console.log('EPSC-0001 WebSocket client disconnected');
  });
});

server.listen(8092, () => {
  console.log('⚡ EPSC-0001 WebSocket server running on port 8092');
});

module.exports = { broadcastEpscData, server };

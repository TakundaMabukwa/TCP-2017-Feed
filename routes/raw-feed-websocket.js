const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const messageQueue = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || messageQueue.length === 0) return;

  isProcessingQueue = true;

  while (messageQueue.length > 0) {
    const payload = messageQueue.shift();
    const sends = [];

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        sends.push(
          new Promise(resolve => {
            client.send(payload, err => {
              if (err) console.error('RAW feed WS send error:', err);
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

async function broadcastRawFeedData(rawData) {
  try {
    messageQueue.push(String(rawData || ''));
    await processQueue();
  } catch (err) {
    console.error('RAW feed broadcast error:', err);
  }
}

wss.on('connection', ws => {
  console.log('RAW full-feed WebSocket client connected');

  ws.on('close', () => {
    console.log('RAW full-feed WebSocket client disconnected');
  });
});

server.listen(8093, () => {
  console.log('RAW full-feed WebSocket server running on port 8093');
});

module.exports = { broadcastRawFeedData, server };

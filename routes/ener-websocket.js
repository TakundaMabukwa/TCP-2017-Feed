const WebSocket = require('ws');
const http = require('http');
const { pool } = require('../config/database');
const { parseFuelData } = require('../helpers/fuel-parser');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Message queue to ensure no data loss
const messageQueue = [];
let isProcessingQueue = false;

function mapEnerData(trackingData) {
  const fuelData = parseFuelData(trackingData.FuelData);
  
  const data = {
    Plate: trackingData.Plate || "FOURWAYS",
    Speed: trackingData.Speed || 0,
    Latitude: trackingData.Latitude || 0,
    Longitude: trackingData.Longitude || 0,
    Quality: trackingData.Pocsagstr || "121.2.0.1",
    Mileage: trackingData.Mileage || 0,
    Pocsagstr: trackingData.Pocsagstr || "SW",
    Head: "",
    Geozone: trackingData.Geozone || "",
    DriverName: trackingData.Status || "",
    NameEvent: "",
    Temperature: trackingData.FuelData || "",
    LocTime: trackingData.LocTime || new Date().toISOString().replace('T', ' ').slice(0, 19),
    message_type: 405
  };
  
  if (fuelData) {
    data.fuel_probe_1_level = fuelData.fuel_probe_1_level;
    data.fuel_probe_1_volume_in_tank = fuelData.fuel_probe_1_volume_in_tank;
    data.fuel_probe_1_temperature = fuelData.fuel_probe_1_temperature;
    data.fuel_probe_1_level_percentage = fuelData.fuel_probe_1_level_percentage;
  }
  
  return data;
}

async function processQueue() {
  if (isProcessingQueue || messageQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (messageQueue.length > 0) {
    const { mappedData } = messageQueue.shift();
    const sends = [];
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        sends.push(
          new Promise((resolve) => {
            client.send(JSON.stringify(mappedData), (err) => {
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

async function broadcastEnerData(trackingData) {
  try {
    // Check if this vehicle belongs to ENER-0001 account
    const result = await pool.query(
      'SELECT account_number FROM vehicles WHERE (ip_address = $1 OR reg = $2 OR plate = $3) AND account_number = $4',
      [trackingData.Pocsagstr, trackingData.Plate, trackingData.Plate, 'ENER-0001']
    );
    
    if (result.rows.length > 0) {
      // Broadcast ALL data for matching vehicles - regardless of what gets saved to DB
      const mappedData = mapEnerData(trackingData);
      
      // Add to queue for guaranteed delivery
      messageQueue.push({ mappedData });
      
      // Process queue immediately
      processQueue();
    }
  } catch (err) {
    // Log error but don't throw - we don't want DB issues to block broadcasts
    console.error('ENER broadcast error:', err);
  }
}

wss.on('connection', (ws) => {
  console.log('ENER-0001 WebSocket client connected');
  
  ws.on('close', () => {
    console.log('ENER-0001 WebSocket client disconnected');
  });
});

server.listen(8090, () => {
  console.log('🔋 ENER-0001 WebSocket server running on port 8090');
});

module.exports = { broadcastEnerData, server };
const WebSocket = require('ws');
const http = require('http');
const { parseFuelData } = require('../helpers/fuel-parser');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

function mapEnerData(trackingData, clientIp) {
  const fuelData = parseFuelData(trackingData.FuelData);
  
  return {
    Plate: trackingData.Plate || "FOURWAYS",
    Speed: trackingData.Speed || 0,
    Latitude: trackingData.Latitude || 0,
    Longitude: trackingData.Longitude || 0,
    Quality: clientIp || "121.2.0.1",
    Mileage: trackingData.Mileage || 0,
    Pocsagstr: trackingData.Pocsagstr || "SW",
    Head: "",
    Geozone: trackingData.Geozone || "",
    DriverName: trackingData.Status || "",
    NameEvent: "",
    Temperature: trackingData.FuelData || "",
    LocTime: trackingData.LocTime || new Date().toISOString().replace('T', ' ').slice(0, 19),
    fuel_probe_1_level: fuelData?.fuel_probe_1_level || 0,
    fuel_probe_1_volume_in_tank: fuelData?.fuel_probe_1_volume_in_tank || 0,
    fuel_probe_1_temperature: fuelData?.fuel_probe_1_temperature || 0,
    fuel_probe_1_level_percentage: fuelData?.fuel_probe_1_level_percentage || 0,
    message_type: 405
  };
}

function broadcastEnerData(trackingData, clientIp) {
  const mappedData = mapEnerData(trackingData, clientIp);
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(mappedData));
    }
  });
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
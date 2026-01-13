const net = require("net");
const fs = require("fs");
const ip = require("ip");
require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const vehicleRoutes = require('./vehicleRoutes');
const { logToConsole } = require("../helpers/logger");
const { ALLOWED_IPS } = require("../helpers/allowed-ips");

const { parseCombinedFeedMessage } = require("../helpers/parse-tracking-message");
const { isValveOpen } = require("../helpers/tcp-valve");
const { updateVehicleData } = require("../helpers/database-helper");
const { broadcastEnerData } = require("./ener-websocket");
// import { logToConsole } from "../helpers/logger";

const combinedFeedPort = process.env.PORT || 9000;
let latestTrackingData = null;

// Raw data logger
const rawLogStream = fs.createWriteStream(path.join(__dirname, '../raw_data.log'), { flags: 'a' });

const combinedFeedServer = net.createServer((socket) => {
  let clientIp = socket.remoteAddress;
  
  if (clientIp === '::1') {
    clientIp = '127.0.0.1';
  } else if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.replace('::ffff:', '');
  } else if (clientIp.includes(':') && !clientIp.includes('.')) {
    // Pure IPv6 - keep as is
  }
  logToConsole("combinedFeed","connection", `New connection from ${clientIp}`);

  // Check valve first
  if (!isValveOpen()) {
    logToConsole("combinedFeed","warning", `TCP valve closed - rejecting connection from ${clientIp}`);
    socket.destroy();
    return;
  }

  // Check IP
  if (!ALLOWED_IPS.includes(clientIp)) {
    logToConsole("combinedFeed","warning", `Blocked connection from ${clientIp}`);
    socket.destroy();
    return;
  }

  logToConsole("combinedFeed","connection", `Established connection with ${clientIp}`);

  socket.on("data", (data) => {
    const raw = data.toString();
    
    // Log raw data
    rawLogStream.write(`[${new Date().toISOString()}] ${clientIp}: ${raw}\n`);
    
    // Split messages by ^ delimiter
    const messages = raw.split('^').filter(msg => msg.trim() !== '');
    
    messages.forEach(message => {
      try {
        const parsed = parseCombinedFeedMessage(message);
        latestTrackingData = parsed;

        logToConsole("combinedFeed","info", `Parsed Message: ${JSON.stringify(parsed)}`);

        // Update database (non-blocking)
        updateVehicleData(parsed).catch(err => 
          logToConsole("combinedFeed","error", `DB update failed: ${err.message}`)
        );

        // Check if this is ENER-0001 account data and broadcast
        broadcastEnerData(parsed);

        // Broadcast to WebSocket clients
        combinedFeedwss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsed));
          }
        });
      } catch (err) {
        logToConsole("combinedFeed","error", `Failed to parse message: ${err.message}`);
      }
    });
    
    // Send acknowledgment
    socket.write("OK");
  });

  socket.on("error", (err) => {
    if (err.code !== "ECONNRESET") {
      logToConsole("combinedFeed","error", `Connection error from ${clientIp}: ${err.message}`);
    }
  });

  socket.on("end", () => {
    logToConsole("combinedFeed","connection", `Client disconnected: ${clientIp}`);
  });
});

const combinedFeedHttpServer = http.createServer();
const app = express();

app.use(express.json());
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/energyrite-sites', require('../client-routes/energy-rite'));

app.get('/latest', (req, res) => {
  res.json(latestTrackingData);
});

app.get('/raw-logs', (req, res) => {
  const logPath = path.join(__dirname, '../raw_data.log');
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  fs.readFile(logPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'Log file not found' });
    }
    
    const lines = data.split('\n').filter(line => {
      const match = line.match(/\[(.*?)\]/);
      if (!match) return false;
      return match[1] >= cutoff;
    });
    
    const tempFile = path.join(__dirname, '../raw_data_24h.log');
    fs.writeFileSync(tempFile, lines.join('\n'));
    
    res.download(tempFile, 'raw_data_24h.log', (err) => {
      fs.unlinkSync(tempFile);
      if (err) res.status(500).json({ error: 'Download failed' });
    });
  });
});

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, "public", "index.html");
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.status(500).send("Error loading frontend");
    } else {
      res.setHeader("Content-Type", "text/html");
      res.send(content);
    }
  });
});

combinedFeedHttpServer.on('request', app);

// WebSocket setup
const combinedFeedwss = new WebSocket.Server({ server: combinedFeedHttpServer });



module.exports = {
  combinedFeedServer,
  combinedFeedwss,
  combinedFeedPort,
  combinedFeedHttpServer,
};
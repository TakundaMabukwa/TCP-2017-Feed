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
const rawLogPath = path.join(__dirname, '..', 'raw_data.log');
const rawLogStream = fs.createWriteStream(rawLogPath, { flags: 'a' });

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

  socket.on("data", async (data) => {
    const raw = data.toString();
    
    // Log raw data
    rawLogStream.write(`[${new Date().toISOString()}] ${clientIp}: ${raw}\n`);
    
    // Split messages by ^ delimiter
    const messages = raw.split('^').filter(msg => msg.trim() !== '');
    
    logToConsole("combinedFeed","info", `Received ${messages.length} messages`);
    
    // Process in chunks to handle large volumes
    const CHUNK_SIZE = 100;
    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      const chunk = messages.slice(i, i + CHUNK_SIZE);
      
      const processPromises = chunk.map(async (message) => {
        try {
          const parsed = parseCombinedFeedMessage(message);
          latestTrackingData = parsed;

          // Run DB update and broadcasts in parallel
          await Promise.allSettled([
            updateVehicleData(parsed),
            broadcastEnerData(parsed),
            Promise.resolve().then(() => {
              combinedFeedwss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(parsed));
                }
              });
            })
          ]);
        } catch (err) {
          logToConsole("combinedFeed","error", `Failed to parse message: ${err.message}`);
        }
      });
      
      // Wait for chunk to complete before next chunk
      await Promise.allSettled(processPromises);
    }
    
    logToConsole("combinedFeed","info", `Completed processing ${messages.length} messages`);
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
  if (!fs.existsSync(rawLogPath)) {
    return res.status(404).json({ error: 'No log data available yet' });
  }
  
  const today = new Date().toISOString().split('T')[0];
  const readStream = fs.createReadStream(rawLogPath, { encoding: 'utf8' });
  
  res.setHeader('Content-Type', 'text/plain');
  
  let buffer = '';
  
  readStream.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop();
    
    lines.forEach(line => {
      if (line.includes(today)) {
        res.write(line + '\n');
      }
    });
  });
  
  readStream.on('end', () => {
    if (buffer && buffer.includes(today)) {
      res.write(buffer);
    }
    res.end();
  });
  
  readStream.on('error', () => {
    res.status(500).json({ error: 'Failed to read log file' });
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
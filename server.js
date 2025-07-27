const net = require("net");
const fs = require("fs");
const ip = require("ip");
require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

let latestTrackingData = { message: "No data received yet" };

// Updated Parsing Function (No Duplicate Fields)
function parseTrackingMessage(message) {
  message = message.trim();
  if (message.startsWith("^")) message = message.slice(1);
  if (message.endsWith("^")) message = message.slice(0, -1);

  const parts = message.split("|");

  return {
    Plate: parts[0],
    Speed: parseInt(parts[1], 10),
    Latitude: parseFloat(parts[2]),
    Longitude: parseFloat(parts[3]),
    LocTime: parts[4],
    Quality: parts[5],
    Mileage: parseInt(parts[6], 10),
    Pocsagstr: parts[7],
    Head: parts[8],
    Geozone: parts[9],
    DriverName: parts[10],
    NameEvent: parts[11],
    Temperature: parts[12],
    Address: parts[13],
    Statuses: parts[14],
    Rules: parts[15],
    LimMsg: parts[16],
    CustomerDriverID: parts[17],
    PlatformName: parts[18],
    EcmCode: parts[19],
    DriverAuthentication: parts[20],
    PlatformId: parts[21],
    UserId: parts[22],
    UserName: parts[23],
    CustomerId: parts[24],
    UAID: parts[25],
    UtcNowTime: parts[26],
    EngineState: parts[27],
    GeoAreaCircle: parts[28],
    GeoAreaPolygon: parts[29],
    GeoAreaRout: parts[30],
    EcmCategory: parts[31],
    EcmName: parts[32],
    DriverCode: parts[33], // Last unique field
  };
}

const httpServer = http.createServer((req, res) => {
  if (req.url === "/latest" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(latestTrackingData));
    return;
  }

  const filePath = path.join(__dirname, "public", "index.html");
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading frontend");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    }
  });
});

// WebSocket setup
const wss = new WebSocket.Server({ server: httpServer });

// Configuration
const PORT = process.env.PORT || 9000;
const LOG_FILE = "raw_data.log";
const ALLOWED_IPS = [
  process.env.ALLOWED_IP1 || "81.218.55.66",
  process.env.ALLOWED_IP2 || "212.150.50.68",
  process.env.ALLOWED_IP || "10.2.1.148",
  process.env.ALLOWED_IP_RENDI,
  "127.0.0.1",
  "143.198.204.127",
  "192.168.1.165",
  "64.227.138.235",
  "41.157.41.148",
  "10.2.1.0/24",
  "198.54.173.198",
];

const server = net.createServer();
const app = express();

// Simplified logger (no parsing)
function logToConsole(type, message) {
  const timestamp = new Date().toISOString();
  console.log(`Data - [${timestamp}] ${type.toUpperCase()}: ${message}`);
}

// Connection handler
server.on("connection", (socket) => {
  const clientIp = socket.remoteAddress.replace(/^.*:/, "");
  logToConsole("connection", `New connection from ${clientIp}`);

  socket.on("data", (data) => {
    const raw = data.toString();
    try {
      const parsed = parseTrackingMessage(raw);
      latestTrackingData = parsed;

      console.log("🧾 Parsed Message:", parsed);

      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsed));
        }
      });
    } catch (err) {
      console.error("❌ Failed to parse message:", err.message);
    }
  });

  socket.on("end", () => {
    console.log("❌ TCP Client disconnected");
  });

  const handleError = (err) => {
    if (err.code !== "ECONNRESET") {
      logToConsole(
        "error",
        `Connection error from ${clientIp}: ${err.message}`
      );
    }
    socket.destroy();
  };

  socket.once("error", handleError);

  if (!ALLOWED_IPS.includes(clientIp)) {
    logToConsole("warning", `Blocked connection from ${clientIp}`);
    socket.destroy();
    return;
  }

  logToConsole("connection", `Established connection with ${clientIp}`);

  let buffer = "";

  socket.on("end", () => {
    logToConsole("connection", `Client disconnected: ${clientIp}`);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  logToConsole("info", `TCP server started on port ${PORT}`);
  logToConsole("info", `Allowed IPs: ${ALLOWED_IPS.join(", ")}`);
});

httpServer.listen(8000, () => {
  console.log("🌐 Web dashboard + API on http://localhost:8000");
  app.listen(3000, () => {
    logToConsole("info", "HTTP server started on port 3000");
  });
});

process.on("SIGINT", () => {
  logToConsole("info", "\nShutting down servers...");
  server.close(() => process.exit(0));
});

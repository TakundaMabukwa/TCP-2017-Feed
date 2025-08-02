const net = require("net");
const fs = require("fs");
const ip = require("ip");
require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");
const { logToConsole } = require("../helpers/logger");
const { ALLOWED_IPS } = require("../helpers/allowed-ips");
const { parseTrackingMessage } = require("../helpers/parse-tracking-message");
// import { logToConsole } from "../helpers/logger";

const epsPort = process.env.EPSPORT || 9002;

const epsServer = net.createServer((socket) => {
  const clientIp = socket.remoteAddress.replace(/^.*:/, "");
  logToConsole("eps","connection", `New connection from ${clientIp}`);

  socket.on("data", (data) => {
    const raw = data.toString();
    try {
      const parsed = parseTrackingMessage(raw);
      latestTrackingData = parsed;

      logToConsole("eps","info", `Parsed Message: ${JSON.stringify(parsed)}`);

      // Broadcast to WebSocket clients
     epswss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsed));
        }
      });
    } catch (err) {
      logToConsole("eps","error", `Failed to parse message: ${err.message}`);
    }
  });

  socket.on("end", () => {
    console.log("❌ TCP Client disconnected");
  });

  const handleError = (err) => {
    if (err.code !== "ECONNRESET") {
      logToConsole("eps",
        "error",
        `Connection error from ${clientIp}: ${err.message}`
      );
    }
    socket.destroy();
  };

  socket.once("error", handleError);

  if (!ALLOWED_IPS.includes(clientIp)) {
    logToConsole("eps","warning", `Blocked connection from ${clientIp}`);
    socket.destroy();
    return;
  }

  logToConsole("eps","connection", `Established connection with ${clientIp}`);

  socket.on("end", () => {
    logToConsole("eps","connection", `Client disconnected: ${clientIp}`);
  });
});

const epsHttpServer = http.createServer((req, res) => {
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
const epswss = new WebSocket.Server({ server:epsHttpServer });

module.exports = {
 epsServer,
 epswss,
 epsPort,
 epsHttpServer,
};

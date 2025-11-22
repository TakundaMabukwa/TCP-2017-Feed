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

const { isValveOpen } = require("../helpers/tcp-valve");
// import { logToConsole } from "../helpers/logger";

const macSteelPort = process.env.MACSTEELPORT || 9000;
let latestTrackingData = null;

const macSteelServer = net.createServer((socket) => {
  let clientIp = socket.remoteAddress;
  if (clientIp === '::1') {
    clientIp = '127.0.0.1';
  } else if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.replace('::ffff:', '');
  } else if (clientIp.includes(':') && !clientIp.includes('.')) {
    // Pure IPv6 - keep as is
  }
  logToConsole("macSteel","connection", `New connection from ${clientIp}`);

  // Check valve first
  if (!isValveOpen()) {
    logToConsole("macSteel","warning", `TCP valve closed - rejecting connection from ${clientIp}`);
    socket.destroy();
    return;
  }

  // Check IP
  if (!ALLOWED_IPS.includes(clientIp)) {
    logToConsole("macSteel","warning", `Blocked connection from ${clientIp}`);
    socket.destroy();
    return;
  }

  logToConsole("macSteel","connection", `Established connection with ${clientIp}`);

  socket.on("data", (data) => {
    const raw = data.toString();
    latestTrackingData = raw;

    logToConsole("macSteel","info", `Raw Message: ${raw}`);

    // Send acknowledgment
    socket.write("OK");

    // Broadcast to WebSocket clients
    macSteelwss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  });

  socket.on("error", (err) => {
    if (err.code !== "ECONNRESET") {
      logToConsole("macSteel","error", `Connection error from ${clientIp}: ${err.message}`);
    }
  });

  socket.on("end", () => {
    logToConsole("macSteel","connection", `Client disconnected: ${clientIp}`);
  });
});

const macSteelHttpServer = http.createServer((req, res) => {
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
const macSteelwss = new WebSocket.Server({ server: macSteelHttpServer });

module.exports = {
  macSteelServer,
  macSteelwss,
  macSteelPort,
  macSteelHttpServer,
};

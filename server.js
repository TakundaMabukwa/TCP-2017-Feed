require("dotenv").config();
const pool = require('./config/database');
const { ALLOWED_IPS } = require("./helpers/allowed-ips");
const {
  combinedFeedServer,
  combinedFeedHttpServer,
  combinedFeedPort,
} = require("./routes/combinedFeed.js");
const { logToConsole } = require("./helpers/logger");

// tcp server - mac steel
combinedFeedServer.listen(combinedFeedPort, () => {
  logToConsole("info", `Mac Steel TCP server started on port ${combinedFeedPort}`);
  logToConsole("info", `Allowed IPs: ${ALLOWED_IPS.join(", ")}`);
});





// -----------------
// http servers
// -----------------
// to do - pull customer_grouped table, loop throiugh parent customers, and for each customer return a websocket.
// to do - in the droplet, ip, new_account_number. From tcp feed - match to ip, use plates as generic
// sort through based on table for droplet

// websocket server for mac steel
combinedFeedHttpServer.listen(8000, () => {
  console.log("🌐 Web dashboard + API on http://localhost:8000");
});
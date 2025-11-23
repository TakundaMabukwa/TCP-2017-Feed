require("dotenv").config();
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

// websocket server for mac steel
combinedFeedHttpServer.listen(8000, () => {
  console.log("🌐 Web dashboard + API on http://localhost:8000");
});
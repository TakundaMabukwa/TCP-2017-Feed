require("dotenv").config();
const { ALLOWED_IPS } = require("./helpers/allowed-ips");
const {
  macSteelServer,
  macSteelHttpServer,
  macSteelPort,
} = require("./routes/macSteel");
const { logToConsole } = require("./helpers/logger");
const {
  alliedSteelServer,
  alliedSteelPort,
  alliedSteelHttpServer,
} = require("./routes/alliedSteel");
// const { fidelityServer, fidelityPort, fidelityHttpServer } = require("./routes/fidelity");
// const { epsServer, epsPort, epsHttpServer } = require("./routes/eps");

// -----------------
// tcp servers
// -----------------

// tcp server - mac steel
macSteelServer.listen(macSteelPort, () => {
  logToConsole("info", `Mac Steel TCP server started on port ${macSteelPort}`);
  logToConsole("info", `Allowed IPs: ${ALLOWED_IPS.join(", ")}`);
});

// tcp server - allied
// alliedSteelServer.listen(alliedSteelPort, () => {
//   logToConsole("info", `Allied Steel TCP server started on port ${alliedSteelPort}`);
//   logToConsole("info", `Allowed IPs: ${ALLOWED_IPS.join(", ")}`);
// });

// tcp server - fidelity
// fidelityServer.listen(fidelityPort, () => {
//   logToConsole("info", `Fidelity TCP server started on port ${fidelityPort}`);
//   logToConsole("info", `Allowed IPs: ${ALLOWED_IPS.join(", ")}`);
// });

// tcp server - eps
// epsServer.listen(epsPort, () => {
//   logToConsole("info", `EPS TCP server started on port ${epsPort}`);
//   logToConsole("info", `Allowed IPs: ${ALLOWED_IPS.join(", ")}`);
// });





// -----------------
// http servers
// -----------------

// websocket server for mac steel
macSteelHttpServer.listen(8000, () => {
  console.log("🌐 Web dashboard + API on http://localhost:8000");
});

// WebSocket server for allied steel
// alliedSteelHttpServer.listen(8001, () => {
//   console.log("🌐 Web dashboard + API on http://localhost:8001");
// });

// //websocket server for fidelity
// fidelityHttpServer.listen(8002, () => {
//   console.log("🌐 Web dashboard + API on http://localhost:8002");
// });

//websocket server for eps
// epsHttpServer.listen(8003, () => {
//   console.log("🌐 Web dashboard + API on http://localhost:8003");
// });
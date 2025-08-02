// Simplified logger (no parsing)
function logToConsole(client, type, message) {
  const timestamp = new Date().toISOString();
  console.log(`${client} - Data - [${timestamp}] ${type.toUpperCase()}: ${message}`);
}

module.exports = { logToConsole };
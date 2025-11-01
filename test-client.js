const net = require('net');

const PORT = 9000; // Mac Steel port
const HOST = 'localhost';

// Test data - single vehicle
const singleVehicleData = '^ABC123|45|40.7128|-74.0060|2024-01-15 10:30:00|12500|192.168.1.100|GPS|Downtown|John Doe|123 Main St|Engine On~GPS Valid|Speed Limit|DRV001|MacSteel^';

// Test data - multiple vehicles
const multiVehicleData = '^XYZ789|60|34.0522|-118.2437|2024-01-15 10:35:00|15000|192.168.1.101|GPS|Highway|Jane Smith|456 Oak Ave|Engine On~GPS Valid|Normal|DRV002|MacSteel^\n^DEF456|30|41.8781|-87.6298|2024-01-15 10:40:00|8500|192.168.1.102|GPS|City Center|Bob Johnson|789 Pine St|Engine Off~GPS Valid|Idle Alert|DRV003|MacSteel^';

function sendTestData(data, label) {
  const client = new net.Socket();
  
  client.connect(PORT, HOST, () => {
    console.log(`\n📡 Sending ${label}:`);
    console.log(data);
    client.write(data);
  });

  client.on('data', (response) => {
    console.log(`✅ Server response: ${response}`);
    client.destroy();
  });

  client.on('error', (err) => {
    console.log(`❌ Connection error: ${err.message}`);
  });

  client.on('close', () => {
    console.log(`🔌 Connection closed for ${label}`);
  });
}

// Send test data
console.log('🚀 Starting TCP client tests...');

setTimeout(() => sendTestData(singleVehicleData, 'Single Vehicle'), 1000);
setTimeout(() => sendTestData(multiVehicleData, 'Multiple Vehicles'), 3000);
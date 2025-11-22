// Simplified parser for single or multiple vehicle records
function parseMacSteelFeedSimple(message) {
  message = message.trim();
  if (message.startsWith("^")) message = message.slice(1);
  if (message.endsWith("^")) message = message.slice(0, -1);

  // Check if this is a multi-vehicle message
  if (message.includes('^\n^')) {
    // Multiple vehicles - split and parse each one
    const vehicleRecords = message.split('^\n^');
    const vehicles = [];

    for (const record of vehicleRecords) {
      if (record.trim()) {
        try {
          const parsed = parseSingleVehicleRecord(record);
          vehicles.push(parsed);
        } catch (error) {
          console.log(`Failed to parse vehicle record: ${record.substring(0, 50)}...`);
        }
      }
    }

    return vehicles; // Return array of vehicle objects
  } else {
    // Single vehicle
    return parseSingleVehicleRecord(message);
  }
}

// Parse a single vehicle record
function parseSingleVehicleRecord(record) {
  const parts = record.split("|");

  const result = {
    Plate: parts[0] || '',
    Speed: parseInt(parts[1], 10) || 0,
    Latitude: parseFloat(parts[2]) || 0,
    Longitude: parseFloat(parts[3]) || 0,
    LocTime: parts[4] || '',
    Mileage: parseInt(parts[5], 10) || 0,
    IP: parts[6] || '',
    Quality: parts[7] || '',
    Geozone: parts[8] || '',
    DriverName: parts[9] || '',
    Address: parts[10] || '',
    Statuses: parts[11] || '',
    Rules: parts[12] || '',
    CustomerDriverID: parts[13] || '',
    PlatformName: parts[14] || ''
  };

  // Parse statuses if present
  if (result.Statuses) {
    result.StatusDetails = result.Statuses.split('~').map(status => status.trim());
  }

  return result;
}

module.exports = { parseMacSteelFeedSimple };
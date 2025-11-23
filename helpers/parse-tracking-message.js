// MacSteel parser using standard format: plate|speed|latitude|longitude|locTime|mileage|pocsagstr|status|geozone|fuel_data|item_installed|driver_name
function parseMacSteelMessage(message) {
  message = message.trim();
  if (message.startsWith("^")) message = message.slice(1);
  if (message.endsWith("^")) message = message.slice(0, -1);

  // Check for multiple vehicles separated by ^\n^
  if (message.includes('^\n^')) {
    const vehicleRecords = message.split('^\n^');
    const vehicles = [];

    for (const record of vehicleRecords) {
      if (record.trim()) {
        const parsed = parseSingleVehicle(record);
        vehicles.push(parsed);
      }
    }

    return { vehicles, vehicleCount: vehicles.length };
  } else {
    return parseSingleVehicle(message);
  }
}

function parseSingleVehicle(record) {
  const parts = record.split("|");
  
  return {
    Plate: parts[0] || '',
    Speed: parseInt(parts[1], 10) || 0,
    Latitude: parseFloat(parts[2]) || 0,
    Longitude: parseFloat(parts[3]) || 0,
    LocTime: parts[4] || '',
    Mileage: parseInt(parts[5], 10) || 0,
    Pocsagstr: parts[6] || '',
    Status: parts[7] || '',
    Geozone: parts[10] || '',
    FuelData: parts[8] || '',
    ItemInstalled: parts[9] || '',
    DriverName: parts[11] || '',
    rawMessage: record,
    fieldCount: parts.length
  };
}

module.exports = { parseMacSteelMessage };
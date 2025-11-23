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

// Enhanced MacSteel parser for detailed format with comprehensive geozone information
function parseEnhancedMacSteelFeed(message) {
  message = message.trim();
  if (message.startsWith("^")) message = message.slice(1);
  if (message.endsWith("^")) message = message.slice(0, -1);

  const parts = message.split("|");

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
    PlatformName: parts[14] || '',
    EcmCode: parts[15] || '',
    DriverAuthentication: parts[16] || '',
    PlatformId: parts[17] || '',
    UserId: parts[18] || '',
    UserName: parts[19] || '',
    CustomerId: parts[20] || '',
    UAID: parts[21] || '',
    UtcNowTime: parts[22] || '',
    EngineState: parts[23] || '',
    GeoAreaCircle: parts[24] || '',
    GeoAreaPolygon: parts[25] || '',
    GeoAreaRout: parts[26] || '',
    EcmCategory: parts[27] || '',
    EcmName: parts[28] || '',
    DriverCode: parts[29] || ''
  };

  if (result.Geozone) {
    const geozoneParts = result.Geozone.split(', ');
    result.GeozoneDetails = {
      primary: geozoneParts[0] || '',
      secondary: geozoneParts[1] || '',
      distributionArea: geozoneParts[2] || '',
      overlays: geozoneParts.filter(part => part.includes('OVERLAY')),
      regions: geozoneParts.filter(part => part.startsWith('GAU-')),
      companies: geozoneParts.filter(part => part.includes('Macsteel')),
      all: geozoneParts
    };
  }

  if (result.Statuses) {
    result.StatusDetails = result.Statuses.split('~').map(status => status.trim());
  }

  result.parseMethod = 'Enhanced MacSteel format';
  result.timestamp = new Date().toISOString();
  result.rawMessage = message;
  result.fieldCount = parts.length;

  return result;
}

// Custom EPS parser with field mappings and fuel data conversion
function parseEPSFeed(message) {
  message = message.trim();
  if (message.startsWith("^")) message = message.slice(1);
  if (message.endsWith("^")) message = message.slice(0, -1);

  const parts = message.split("|");
  
  if (parts.length < 10) {
    console.log('⚠️ Warning: Not enough parts in EPS data, expected at least 10, got:', parts.length);
    return {
      Plate: 'UNKNOWN',
      Speed: 0,
      Latitude: 0,
      Longitude: 0,
      LocTime: new Date().toISOString(),
      Quality: '',
      Mileage: 0,
      Pocsagstr: '',
      Head: '',
      Geozone: '',
      DriverName: 'UNKNOWN',
      NameEvent: '',
      Temperature: '',
      Address: '',
      Statuses: '',
      Rules: '',
      parseMethod: 'EPS custom field mapping - INVALID DATA',
      timestamp: new Date().toISOString(),
      rawMessage: message,
      fieldCount: parts.length
    };
  }

  const mappedResult = {
    Plate: parts[0] || 'UNKNOWN',
    Speed: parseInt(parts[1], 10) || 0,
    Latitude: parseFloat(parts[2]) || 0,
    Longitude: parseFloat(parts[3]) || 0,
    LocTime: parts[4] || '',
    Quality: '',
    Mileage: parseInt(parts[5], 10) || 0,
    Pocsagstr: parts[6] || '',
    Head: parts[7] || '',
    Geozone: parts[8] || '',
    DriverName: parts[9] || 'UNKNOWN',
    NameEvent: parts[11] || '',
    Temperature: parts[12] || '',
    Address: parts[10] || '',
    Statuses: parts[14] || '',
    Rules: parts[15] || '',
    IP: parts[6] || ''
  };

  console.log(`🔍 EPS Message parts count: ${parts.length}`);
  console.log(`🔍 EPS Message parts[13]: ${parts[13]}`);
  console.log(`🔍 EPS Message last part: ${parts[parts.length - 1]}`);
  
  let hexFuelData = null;
  let fuelDataPosition = -1;
  
  const positionsToCheck = [13, 12, parts.length - 1];
  for (const pos of positionsToCheck) {
    if (parts[pos] && parts[pos].includes(',') && parts[pos].split(',').length >= 10) {
      hexFuelData = parts[pos];
      fuelDataPosition = pos;
      break;
    }
  }
  
  if (hexFuelData && hexFuelData.trim() !== '') {
    console.log(`🔍 EPS Fuel data found at position ${fuelDataPosition}: ${hexFuelData}`);
    const fuelData = parseEPSFuelData(hexFuelData);
    if (fuelData) {
      mappedResult.fuel_level = fuelData.fuel_level;
      mappedResult.fuel_volume = fuelData.fuel_volume;
      mappedResult.fuel_temperature = fuelData.fuel_temperature;
    }
  }

  mappedResult.parseMethod = 'EPS custom field mapping';
  mappedResult.timestamp = new Date().toISOString();
  mappedResult.rawMessage = message;
  mappedResult.fieldCount = parts.length;

  return mappedResult;
}

function parseEPSFuelData(hexString) {
  try {
    const parts = hexString.split(',');
    if (parts.length < 10) return null;

    const fuel_level = parseInt(parts[0], 16) || 0;
    const fuel_volume = parseInt(parts[1], 16) || 0;
    const fuel_temperature = parseInt(parts[2], 16) || 0;

    return {
      fuel_level,
      fuel_volume,
      fuel_temperature
    };
  } catch (error) {
    console.log('Error parsing EPS fuel data:', error.message);
    return null;
  }
}

// Enhanced MacSteel parser based on EPS structure with documented field mapping
function parseMacSteelMessage(message) {
  message = message.trim();
  if (message.startsWith("^")) message = message.slice(1);
  if (message.endsWith("^")) message = message.slice(0, -1);

  const parts = message.split("|");
  
  // Documented format: Plate|Speed|Latitude|Longitude|LocTime|Mileage|Pocsagstr|Head|Geozone|DriverName|Address|Statuses|Rules
  const result = {
    Plate: parts[0] || '', // Platform Name
    Speed: parseInt(parts[1], 10) || 0, // Last Speed
    Latitude: parseFloat(parts[2]) || 0, // Last Latitude
    Longitude: parseFloat(parts[3]) || 0, // Last Longitude
    LocTime: parts[4] || '', // Last Location Time
    Mileage: parseInt(parts[5], 10) || 0, // Last Mileage
    Pocsagstr: parts[6] || '', // Platform IP
    Head: parts[7] || '', // Last Heading
    Geozone: parts[8] || '', // Last Geo zones
    DriverName: parts[9] || '', // Last Driver Name
    Address: parts[10] || '', // Last Address
    Statuses: parts[11] || '', // Last Status that got active
    Rules: parts[12] || '', // Last Rules that got active
    DriverAuthentication: parts[13] || '' // Last driver code id
  };

  console.log(`🔍 MacSteel Message parts count: ${parts.length}`);
  console.log(`🔍 MacSteel Geozone: ${result.Geozone}`);
  
  // Enhanced geozone processing
  if (result.Geozone && result.Geozone.trim() !== '') {
    // Check if it's hex fuel data (like: 25,405,1007,2020,04D1,2021,0D78,2022,15,2023,48)
    if (/^[0-9A-Fa-f,]+$/.test(result.Geozone)) {
      console.log(`🔍 MacSteel Hex fuel data detected: ${result.Geozone}`);
      const fuelData = parseMacSteelFuelData(result.Geozone);
      if (fuelData) {
        result.fuel_level = fuelData.fuel_level;
        result.fuel_volume = fuelData.fuel_volume;
        result.fuel_temperature = fuelData.fuel_temperature;
        result.FuelData = fuelData;
      }
    } else if (result.Geozone.includes(',')) {
      // Complex geozone data (like: 320,22/11/2025 21:25:07,2,6,-26.324211,28.447510,1648.40,0,0,247554.6,65535,1,655001,197:16533@-97,1,,23,0)
      console.log(`🔍 MacSteel Complex geozone data: ${result.Geozone.substring(0, 50)}...`);
      result.GeozoneData = {
        raw: result.Geozone,
        parsed: result.Geozone.split(','),
        type: 'complex_tracking_data'
      };
    }
  }

  // Parse statuses if present
  if (result.Statuses && result.Statuses.trim() !== '') {
    result.StatusDetails = result.Statuses.split('~').map(status => status.trim());
  }

  result.parseMethod = 'Enhanced MacSteel format';
  result.timestamp = new Date().toISOString();
  result.rawMessage = message;
  result.fieldCount = parts.length;

  return result;
}

// Enhanced fuel data parser for MacSteel
function parseMacSteelFuelData(hexString) {
  try {
    const parts = hexString.split(',');
    if (parts.length < 4) return null;

    console.log(`🔍 MacSteel Parsing fuel data parts: ${parts.length}`);
    
    // Convert hex values to decimal
    const parsed = {
      raw: hexString,
      values: parts.map((part, index) => {
        const hex = part.trim();
        const decimal = parseInt(hex, 16) || 0;
        console.log(`🔍 MacSteel Part ${index}: ${hex} = ${decimal}`);
        return { hex, decimal };
      })
    };

    // Extract fuel data based on common patterns
    if (parts.length >= 8) {
      parsed.fuel_level = parseInt(parts[0], 16) || 0;
      parsed.fuel_volume = parseInt(parts[2], 16) || 0;
      parsed.fuel_temperature = parseInt(parts[4], 16) || 0;
    }

    return parsed;
  } catch (error) {
    console.log('🔍 MacSteel Error parsing fuel data:', error.message);
    return { raw: hexString, error: error.message };
  }
}

// Parse fuel data from hex string format like: 25,405,1007,2020,04D1,2021,0D78,2022,15,2023,48
function parseFuelData(hexString) {
  try {
    const parts = hexString.split(',');
    if (parts.length < 4) return null;

    // Convert hex values to decimal
    const parsed = {
      raw: hexString,
      values: parts.map(part => {
        const hex = part.trim();
        return {
          hex: hex,
          decimal: parseInt(hex, 16) || 0
        };
      })
    };

    // Try to extract meaningful fuel data if pattern matches
    if (parts.length >= 8) {
      parsed.fuel_level = parseInt(parts[0], 16) || 0;
      parsed.fuel_volume = parseInt(parts[2], 16) || 0;
      parsed.fuel_temperature = parseInt(parts[4], 16) || 0;
    }

    return parsed;
  } catch (error) {
    console.log('Error parsing fuel data:', error.message);
    return { raw: hexString, error: error.message };
  }
}

module.exports = { parseMacSteelFeedSimple, parseEnhancedMacSteelFeed, parseEPSFeed, parseMacSteelMessage, parseMacSteelFuelData };
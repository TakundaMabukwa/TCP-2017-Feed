function parseFuelData(fuelDataString) {
  if (!fuelDataString || fuelDataString.trim() === '') {
    return null;
  }

  try {
    const parts = fuelDataString.split(',');
    
    if (parts.length < 11) {
      return null;
    }

    // Parse hex values and convert to decimal (positions 4, 6, 8, 10 are hex fuel data)
    const fuelProbe1LevelHex = parts[4];
    const fuelProbe1VolumeHex = parts[6];
    const fuelProbe1TempHex = parts[8];
    const fuelProbe1PercentageHex = parts[10];
        
    // Convert hex to decimal
    const fuelProbe1LevelDecimal = parseInt(fuelProbe1LevelHex, 16);
    const fuelProbe1VolumeDecimal = parseInt(fuelProbe1VolumeHex, 16);
    const fuelProbe1TempDecimal = parseInt(fuelProbe1TempHex, 16);
    const fuelProbe1PercentageDecimal = parseInt(fuelProbe1PercentageHex, 16);
        
    // Apply calculations and convert to strings
    const fuelProbe1Level = (fuelProbe1LevelDecimal / 10).toFixed(1);
    const fuelProbe1Volume = (fuelProbe1VolumeDecimal / 10).toFixed(1);
    const fuelProbe1Temperature = fuelProbe1TempDecimal.toString();
    const fuelProbe1Percentage = Math.min(fuelProbe1PercentageDecimal, 100).toString();
    
    return {
      fuel_probe_1_level: fuelProbe1Level,
      fuel_probe_1_volume_in_tank: fuelProbe1Volume,
      fuel_probe_1_temperature: fuelProbe1Temperature,
      fuel_probe_1_level_percentage: fuelProbe1Percentage
    };
  } catch (error) {
    return null;
  }
}

module.exports = { parseFuelData };
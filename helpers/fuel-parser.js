function parseProbe(parts, baseIndex, probeNumber) {
  const levelHex = parts[baseIndex];
  const volumeHex = parts[baseIndex + 2];
  const temperatureHex = parts[baseIndex + 4];
  const percentageHex = parts[baseIndex + 6];

  if (!levelHex || !volumeHex || !temperatureHex || !percentageHex) {
    return null;
  }

  const levelDecimal = parseInt(levelHex, 16);
  const volumeDecimal = parseInt(volumeHex, 16);
  const temperatureDecimal = parseInt(temperatureHex, 16);
  const percentageDecimal = parseInt(percentageHex, 16);

  if (
    Number.isNaN(levelDecimal) ||
    Number.isNaN(volumeDecimal) ||
    Number.isNaN(temperatureDecimal) ||
    Number.isNaN(percentageDecimal)
  ) {
    return null;
  }

  return {
    [`fuel_probe_${probeNumber}_level`]: (levelDecimal / 10).toFixed(1),
    [`fuel_probe_${probeNumber}_volume_in_tank`]: (volumeDecimal / 10).toFixed(1),
    [`fuel_probe_${probeNumber}_temperature`]: temperatureDecimal.toString(),
    [`fuel_probe_${probeNumber}_level_percentage`]: Math.min(percentageDecimal, 100).toString()
  };
}

function parseFuelData(fuelDataString) {
  if (!fuelDataString || fuelDataString.trim() === '') {
    return null;
  }

  try {
    const parts = fuelDataString.split(',');

    if (parts.length < 11) {
      return null;
    }

    const fuelProbe1 = parseProbe(parts, 4, 1);
    const fuelProbe2 = parseProbe(parts, 12, 2);

    if (!fuelProbe1 && !fuelProbe2) {
      return null;
    }

    return {
      ...(fuelProbe1 || {}),
      ...(fuelProbe2 || {})
    };
  } catch (error) {
    return null;
  }
}

module.exports = { parseFuelData };

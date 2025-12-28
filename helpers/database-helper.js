const pool = require('../config/database');

async function updateVehicleData(trackingData) {
  try {
    // First try to find by IP address (Pocsagstr)
    let result = await pool.query(
      'UPDATE vehicles SET speed = $1, latitude = $2, longitude = $3, loctime = $4, mileage = $5 WHERE ip_address = $6 RETURNING id',
      [trackingData.Speed, trackingData.Latitude, trackingData.Longitude, trackingData.LocTime, trackingData.Mileage, trackingData.Pocsagstr]
    );

    // If no rows updated by IP, try by reg (Plate)
    if (result.rowCount === 0 && trackingData.Plate) {
      result = await pool.query(
        'UPDATE vehicles SET speed = $1, latitude = $2, longitude = $3, loctime = $4, mileage = $5, ip_address = $6 WHERE reg = $7 RETURNING id',
        [trackingData.Speed, trackingData.Latitude, trackingData.Longitude, trackingData.LocTime, trackingData.Mileage, trackingData.Pocsagstr, trackingData.Plate]
      );
    }

    return result.rowCount > 0;
  } catch (err) {
    console.error('Database update error:', err);
    return false;
  }
}

module.exports = { updateVehicleData };
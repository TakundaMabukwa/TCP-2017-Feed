const pool = require('../config/database');

async function updateVehicleData(trackingData) {
  try {
    // First try to find by IP address (Pocsagstr)
    let result = await pool.query(
      'UPDATE vehicles SET plate = $1, speed = $2, latitude = $3, longitude = $4, loctime = $5, mileage = $6, status = $7, geozone = $8, fueldata = $9, driver_name = $10, iteminstalled = $11 WHERE ip_address = $12 RETURNING id',
      [trackingData.Plate, trackingData.Speed, trackingData.Latitude, trackingData.Longitude, trackingData.LocTime, trackingData.Mileage, trackingData.Status, trackingData.Geozone, trackingData.FuelData, trackingData.DriverName, trackingData.ItemInstalled, trackingData.Pocsagstr]
    );

    // If no rows updated by IP, try by reg (Plate)
    if (result.rowCount === 0 && trackingData.Plate) {
      result = await pool.query(
        'UPDATE vehicles SET plate = $1, speed = $2, latitude = $3, longitude = $4, loctime = $5, mileage = $6, status = $7, geozone = $8, fueldata = $9, driver_name = $10, iteminstalled = $11, ip_address = $12 WHERE reg = $13 RETURNING id',
        [trackingData.Plate, trackingData.Speed, trackingData.Latitude, trackingData.Longitude, trackingData.LocTime, trackingData.Mileage, trackingData.Status, trackingData.Geozone, trackingData.FuelData, trackingData.DriverName, trackingData.ItemInstalled, trackingData.Pocsagstr, trackingData.Plate]
      );
    }

    return result.rowCount > 0;
  } catch (err) {
    console.error('Database update error:', err);
    return false;
  }
}

module.exports = { updateVehicleData };
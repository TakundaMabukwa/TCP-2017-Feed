const pool = require('../config/database');
const { parseFuelData } = require('./fuel-parser');

async function updateVehicleData(trackingData) {
  try {
    // Build dynamic query based on non-empty fields
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (trackingData.Plate) {
      fields.push(`plate = $${paramCount++}`);
      values.push(trackingData.Plate);
    }
    if (trackingData.Speed !== undefined) {
      fields.push(`speed = $${paramCount++}`);
      values.push(trackingData.Speed);
    }
    if (trackingData.Latitude) {
      fields.push(`latitude = $${paramCount++}`);
      values.push(trackingData.Latitude);
    }
    if (trackingData.Longitude) {
      fields.push(`longitude = $${paramCount++}`);
      values.push(trackingData.Longitude);
    }
    if (trackingData.Mileage) {
      fields.push(`mileage = $${paramCount++}`);
      values.push(trackingData.Mileage);
    }
    if (trackingData.Status && trackingData.Status.trim() !== '') {
      fields.push(`status = $${paramCount++}`);
      values.push(trackingData.Status);
      // Update loctime when status changes
      if (trackingData.LocTime) {
        fields.push(`loctime = $${paramCount++}`);
        values.push(trackingData.LocTime);
      }
    }
    if (trackingData.Geozone) {
      fields.push(`geozone = $${paramCount++}`);
      values.push(trackingData.Geozone);
    }
    if (trackingData.FuelData) {
      fields.push(`fueldata = $${paramCount++}`);
      values.push(trackingData.FuelData);
      
      // Parse fuel data and add individual fields
      const parsedFuel = parseFuelData(trackingData.FuelData);
      if (parsedFuel) {
        fields.push(`fuel_probe_1_level = $${paramCount++}`);
        values.push(parsedFuel.fuel_probe_1_level);
        
        fields.push(`fuel_probe_1_volume_in_tank = $${paramCount++}`);
        values.push(parsedFuel.fuel_probe_1_volume_in_tank);
        
        fields.push(`fuel_probe_1_temperature = $${paramCount++}`);
        values.push(parsedFuel.fuel_probe_1_temperature);
        
        fields.push(`fuel_probe_1_level_percentage = $${paramCount++}`);
        values.push(parsedFuel.fuel_probe_1_level_percentage);
      }
    }
    if (trackingData.DriverName) {
      fields.push(`driver_name = $${paramCount++}`);
      values.push(trackingData.DriverName);
    }
    if (trackingData.ItemInstalled) {
      fields.push(`iteminstalled = $${paramCount++}`);
      values.push(trackingData.ItemInstalled);
    }

    if (fields.length === 0) return false;

    // First try to find by IP address (Pocsagstr)
    let result = await pool.query(
      `UPDATE vehicles SET ${fields.join(', ')} WHERE ip_address = $${paramCount} RETURNING id`,
      [...values, trackingData.Pocsagstr]
    );

    // If no rows updated by IP, try by reg (Plate)
    if (result.rowCount === 0 && trackingData.Plate) {
      fields.push(`ip_address = $${paramCount++}`);
      values.push(trackingData.Pocsagstr);
      
      result = await pool.query(
        `UPDATE vehicles SET ${fields.join(', ')} WHERE reg = $${paramCount} RETURNING id`,
        [...values, trackingData.Plate]
      );
    }

    return result.rowCount > 0;
  } catch (err) {
    console.error('Database update error:', err);
    return false;
  }
}

module.exports = { updateVehicleData };
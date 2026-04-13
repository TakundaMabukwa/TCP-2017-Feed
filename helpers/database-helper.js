const { pool } = require('../config/database');
const { parseFuelData } = require('./fuel-parser');

function normalizeVehicleKey(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .trim();
}

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
      const statusUpper = trackingData.Status.toUpperCase();
      const allowedStatuses = ['PTO ON', 'PTO OFF', 'ENGINE ON', 'ENGINE OFF'];
      if (allowedStatuses.includes(statusUpper)) {
        fields.push(`status = $${paramCount++}`);
        values.push(trackingData.Status);
        // Update loctime when status changes
        if (trackingData.LocTime) {
          fields.push(`loctime = $${paramCount++}`);
          values.push(trackingData.LocTime);
        }
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
        const fuelFields = [
          'fuel_probe_1_level',
          'fuel_probe_1_volume_in_tank',
          'fuel_probe_1_temperature',
          'fuel_probe_1_level_percentage',
          'fuel_probe_2_level',
          'fuel_probe_2_volume_in_tank',
          'fuel_probe_2_temperature',
          'fuel_probe_2_level_percentage'
        ];

        for (const fieldName of fuelFields) {
          if (parsedFuel[fieldName] !== undefined) {
            fields.push(`${fieldName} = $${paramCount++}`);
            values.push(parsedFuel[fieldName]);
          }
        }
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

    let result = { rowCount: 0 };

    if (trackingData.Pocsagstr) {
      result = await pool.query(
        `UPDATE vehicles SET ${fields.join(', ')} WHERE ip_address = $${paramCount} RETURNING id`,
        [...values, trackingData.Pocsagstr]
      );
    }

    // If no rows updated by IP, try by normalized reg/plate.
    if (result.rowCount === 0 && trackingData.Plate) {
      const normalizedPlate = normalizeVehicleKey(trackingData.Plate);
      fields.push(`ip_address = $${paramCount++}`);
      values.push(trackingData.Pocsagstr);
      
      result = await pool.query(
        `UPDATE vehicles
         SET ${fields.join(', ')}
         WHERE regexp_replace(UPPER(COALESCE(reg, '')), '\s+', '', 'g') = $${paramCount}
            OR regexp_replace(UPPER(COALESCE(plate, '')), '\s+', '', 'g') = $${paramCount}
         RETURNING id`,
        [...values, normalizedPlate]
      );
    }

    return result.rowCount > 0;
  } catch (err) {
    console.error('Database update error:', err);
    return false;
  }
}

module.exports = { updateVehicleData };

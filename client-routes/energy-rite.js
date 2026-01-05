const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Cache
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30000;

// Get all ENER-0001 vehicles
router.get('/', async (req, res) => {
  const now = Date.now();
  
  if (cache && (now - cacheTime) < CACHE_TTL) {
    return res.json(cache);
  }
  
  try {
    const result = await pool.query(
      `SELECT plate, reg, speed, latitude, longitude, ip_address, status, 
       fuel_probe_1_level, fuel_probe_1_volume_in_tank, 
       fuel_probe_1_temperature, fuel_probe_1_level_percentage, 
       cost_code, color_codes, client_notes
       FROM vehicles WHERE account_number = $1 
       ORDER BY loctime DESC LIMIT 100`,
      ['ENER-0001']
    );
    
    cache = result.rows.map(row => ({
      Plate: row.plate || row.reg,
      Speed: row.speed || 0,
      Latitude: row.latitude || 0,
      Longitude: row.longitude || 0,
      Quality: row.pocsagstr || row.ip_address,
      Mileage: row.mileage || 0,
      Pocsagstr: row.pocsagstr,
      Head: "",
      Geozone: row.geozone || "",
      DriverName: row.status || "",
      NameEvent: "",
      Temperature: row.fueldata || "",
      LocTime: row.loctime,
      fuel_probe_1_level: row.fuel_probe_1_level || 0,
      fuel_probe_1_volume_in_tank: row.fuel_probe_1_volume_in_tank || 0,
      fuel_probe_1_temperature: row.fuel_probe_1_temperature || 0,
      fuel_probe_1_level_percentage: row.fuel_probe_1_level_percentage || 0,
      message_type: 405,
      cost_code: row.cost_code || null,
      color_codes: row.color_codes || {},
      client_notes: row.client_notes || null
    }));
    
    cacheTime = now;
    res.json(cache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific ENER-0001 vehicle by plate
router.get('/:plate', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT plate, reg, speed, latitude, longitude, pocsagstr, ip_address, 
       mileage, geozone, status, fueldata, loctime, 
       fuel_probe_1_level, fuel_probe_1_volume_in_tank, 
       fuel_probe_1_temperature, fuel_probe_1_level_percentage,
       cost_code, color_codes, client_notes
       FROM vehicles WHERE account_number = $1 AND (plate = $2 OR reg = $2)`,
      ['ENER-0001', req.params.plate]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const row = result.rows[0];
    res.json({
      Plate: row.plate || row.reg,
      Speed: row.speed || 0,
      Latitude: row.latitude || 0,
      Longitude: row.longitude || 0,
      Quality: row.pocsagstr || row.ip_address,
      Mileage: row.mileage || 0,
      Pocsagstr: row.pocsagstr,
      Head: "",
      Geozone: row.geozone || "",
      DriverName: row.status || "",
      NameEvent: "",
      Temperature: row.fueldata || "",
      LocTime: row.loctime,
      fuel_probe_1_level: row.fuel_probe_1_level || 0,
      fuel_probe_1_volume_in_tank: row.fuel_probe_1_volume_in_tank || 0,
      fuel_probe_1_temperature: row.fuel_probe_1_temperature || 0,
      fuel_probe_1_level_percentage: row.fuel_probe_1_level_percentage || 0,
      message_type: 405,
      cost_code: row.cost_code || null,
      color_codes: row.color_codes || {},
      client_notes: row.client_notes || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update color_codes and client_notes for a vehicle
router.patch('/:plate', async (req, res) => {
  try {
    const { color_codes, client_notes } = req.body;
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    if (color_codes !== undefined) {
      fields.push(`color_codes = $${paramCount++}`);
      values.push(JSON.stringify(color_codes));
    }
    
    if (client_notes !== undefined) {
      fields.push(`client_notes = $${paramCount++}`);
      values.push(client_notes);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push('ENER-0001');
    values.push(req.params.plate);
    
    const result = await pool.query(
      `UPDATE vehicles SET ${fields.join(', ')} 
       WHERE account_number = $${paramCount++} AND (plate = $${paramCount} OR reg = $${paramCount}) 
       RETURNING plate, cost_code, color_codes, client_notes`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    cache = null;
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

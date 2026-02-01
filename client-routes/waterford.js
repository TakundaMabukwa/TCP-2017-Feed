const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Cache
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30000;

// Get all WACA-0001 vehicles
router.get('/', async (req, res) => {
  const now = Date.now();
  
  if (cache && (now - cacheTime) < CACHE_TTL) {
    return res.json(cache);
  }
  
  try {
    const result = await pool.query(
      `SELECT id, plate, reg, speed, latitude, longitude, ip_address, pocsagstr, 
       mileage, geozone, status, fueldata, loctime, 
       fuel_probe_1_level, fuel_probe_1_volume_in_tank, 
       fuel_probe_1_temperature, fuel_probe_1_level_percentage, 
       cost_code, color_codes, client_notes, updated_at
       FROM vehicles WHERE account_number = $1 
       ORDER BY loctime DESC LIMIT 100`,
      ['WACA-0001']
    );
    
    cache = result.rows.map(row => ({
      Id: row.id,
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
      client_notes: row.client_notes || null,
      updated_at: row.updated_at
    }));
    
    cacheTime = now;
    res.json(cache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific WACA-0001 vehicle by plate
router.get('/:plate', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, plate, reg, speed, latitude, longitude, pocsagstr, ip_address, 
       mileage, geozone, status, fueldata, loctime, 
       fuel_probe_1_level, fuel_probe_1_volume_in_tank, 
       fuel_probe_1_temperature, fuel_probe_1_level_percentage,
       cost_code, color_codes, client_notes, updated_at
       FROM vehicles WHERE account_number = $1 AND (plate = $2 OR reg = $2)`,
      ['WACA-0001', req.params.plate]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const row = result.rows[0];
    res.json({
      Id: row.id,
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
      client_notes: row.client_notes || null,
      updated_at: row.updated_at
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
    
    values.push('WACA-0001');
    values.push(req.params.plate);
    
    const result = await pool.query(
      `UPDATE vehicles SET ${fields.join(', ')} 
       WHERE account_number = $${paramCount++} AND (plate = $${paramCount} OR reg = $${paramCount}) 
       RETURNING plate, cost_code, color_codes, client_notes, updated_at`,
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

// Add new vehicle with WACA-0001 account
router.post('/', async (req, res) => {
  try {
    const { plate, reg, ip_address, cost_code } = req.body;
    
    if (!plate && !reg) {
      return res.status(400).json({ error: 'plate or reg is required' });
    }
    
    if (!ip_address) {
      return res.status(400).json({ error: 'ip_address is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO vehicles (plate, reg, ip_address, account_number, cost_code, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, plate, reg, ip_address, account_number, cost_code, created_at`,
      [plate || '', reg || '', ip_address, 'WACA-0001', cost_code || null]
    );
    
    cache = null;
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM vehicles WHERE account_number = $1 AND id = $2 RETURNING id, plate',
      ['WACA-0001', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    cache = null;
    res.json({ message: 'Vehicle deleted', id: result.rows[0].id, plate: result.rows[0].plate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

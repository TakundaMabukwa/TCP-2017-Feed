const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Cache for ENER-0001 data
let energyriteCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

// Fast query for ENER-0001 data with caching
async function getEnergyriteData() {
  const now = Date.now();
  
  if (energyriteCache && (now - cacheTimestamp) < CACHE_TTL) {
    return energyriteCache;
  }
  
  try {
    const result = await pool.query(
      `SELECT plate, reg, speed, latitude, longitude, pocsagstr, ip_address, 
       mileage, geozone, status, fueldata, loctime, 
       fuel_probe_1_level, fuel_probe_1_volume_in_tank, 
       fuel_probe_1_temperature, fuel_probe_1_level_percentage
       FROM vehicles WHERE account_number = $1 
       ORDER BY loctime DESC LIMIT 100`,
      ['ENER-0001']
    );
    
    energyriteCache = result.rows.map(row => ({
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
      message_type: 405
    }));
    
    cacheTimestamp = now;
    return energyriteCache;
  } catch (err) {
    console.error('Energyrite query error:', err);
    return energyriteCache || [];
  }
}

module.exports = { pool, getEnergyriteData };
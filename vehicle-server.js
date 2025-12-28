const express = require('express');
const { Pool } = require('pg');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vehicles',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

// Initialize database
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      reg VARCHAR(20) PRIMARY KEY,
      fleet_number VARCHAR(50),
      new_account_number VARCHAR(50),
      column_name VARCHAR(50),
      ip_address INET
    )
  `);
  
  await pool.query('CREATE INDEX IF NOT EXISTS idx_ip ON vehicles(ip_address)');
  
  // Import CSV data
  fs.createReadStream('./vehicles.csv')
    .pipe(csv())
    .on('data', async (row) => {
      await pool.query(
        'INSERT INTO vehicles VALUES ($1, $2, $3, $4, $5) ON CONFLICT (reg) DO UPDATE SET ip_address = $5',
        [row.reg, row.fleet_number, row.new_account_number, row.column_name, row.ip_address || null]
      );
    });
}

initDB();

// Vehicle lookup endpoint
app.get('/vehicle/:reg', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE reg = $1', [req.params.reg]);
    res.json(result.rows[0] || { error: 'Vehicle not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IP lookup endpoint
app.get('/ip/:ip', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE ip_address = $1', [req.params.ip]);
    res.json(result.rows[0] || { error: 'IP not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSocket for real-time data
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    // Broadcast to all clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.VEHICLE_PORT || 3001;

server.listen(PORT, () => {
  console.log(`Vehicle server running on port ${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
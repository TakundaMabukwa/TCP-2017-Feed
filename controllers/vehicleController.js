const pool = require('../config/database');

class VehicleController {
  static async getByAccountNumber(req, res) {
    try {
      const { accountNumber } = req.params;
      const result = await pool.query(
        'SELECT * FROM vehicles WHERE account_number = $1', 
        [accountNumber]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByReg(req, res) {
    try {
      const { reg } = req.params;
      const result = await pool.query(
        'SELECT * FROM vehicles WHERE reg = $1', 
        [reg]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = VehicleController;
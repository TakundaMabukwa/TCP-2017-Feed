const express = require('express');
const VehicleController = require('../controllers/vehicleController');

const router = express.Router();

// GET /api/vehicles - All vehicles
router.get('/', VehicleController.getAll);

// GET /api/vehicles/account/:accountNumber
router.get('/account/:accountNumber', VehicleController.getByAccountNumber);

// GET /api/vehicles/reg/:reg
router.get('/reg/:reg', VehicleController.getByReg);

module.exports = router;
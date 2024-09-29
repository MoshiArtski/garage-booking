const express = require('express');
const garageController = require('../controllers/garageController');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();


router.post('/create', roleMiddleware('garage'), garageController.createGarage);

module.exports = router;

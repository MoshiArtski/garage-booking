const express = require('express');
const serviceController = require('../controllers/serviceController');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

// Only garages can create categories and services
router.post('/category', roleMiddleware('garage'), serviceController.createCategory);
router.post('/item', roleMiddleware('garage'), serviceController.createItem);

module.exports = router;

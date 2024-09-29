const express = require('express');
const bookingController = require('../controllers/bookingController');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

// Only customers can create bookings
router.post('/create', roleMiddleware('customer'), bookingController.createBooking);

module.exports = router;

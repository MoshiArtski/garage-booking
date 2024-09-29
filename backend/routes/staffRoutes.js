const express = require('express');
const staffController = require('../controllers/staffController');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

// Only garages can manage staff
router.post('/create', roleMiddleware('garage'), staffController.createStaff);
router.get('/:garage_id', roleMiddleware('garage'), staffController.getAllStaff);
router.get('/availability/:staff_id', roleMiddleware('garage'), staffController.getStaffAvailability);
router.put('/update/:staff_id', roleMiddleware('garage'), staffController.updateStaff);
router.delete('/delete/:staff_id', roleMiddleware('garage'), staffController.deleteStaff);
router.post('/availability', roleMiddleware('garage'), staffController.setStaffAvailability);

module.exports = router;

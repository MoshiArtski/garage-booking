const express = require('express');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const garageRoutes = require('./routes/garageRoutes');  // Adjust path accordingly

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/garages', garageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

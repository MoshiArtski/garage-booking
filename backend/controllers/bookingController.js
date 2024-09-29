const supabase = require('../config/supabase');

// Function to check staff availability for a specific time slot
const checkAvailability = async (garage_id, item_id, booking_date, booking_time) => {
    // Get the duration of the item (service)
    const { data: item, error: itemError } = await supabase
        .from('items')
        .select('duration')
        .eq('id', item_id)
        .single();

    if (itemError || !item) {
        throw new Error('Item not found');
    }

    const itemDuration = item.duration;

    // Find the day of the week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(booking_date).getDay();

    // Check if staff is available for the selected time slot on that day
    const { data: availableStaff, error: staffError } = await supabase
        .from('staff_availability')
        .select('staff_id')
        .eq('day_of_week', dayOfWeek)
        .gte('available_start', booking_time)
        .lte('available_end', new Date(new Date(`1970-01-01T${booking_time}`).getTime() + itemDuration * 60000).toISOString().slice(11, 16));

    if (staffError || availableStaff.length === 0) {
        throw new Error('No staff available for the selected time slot');
    }

    return availableStaff[0].staff_id; // Return the first available staff member's ID
};

// Create a booking
exports.createBooking = async (req, res) => {
    const { item_id, garage_id, booking_date, booking_time } = req.body;
    const user = req.user; // Authenticated customer

    // Check if staff is available for the selected item and time
    const staffId = await checkAvailability(garage_id, item_id, booking_date, booking_time);

    if (!staffId) {
        return res.status(400).json({ error: 'No staff available for this time slot' });
    }

    // Get the duration of the item
    const { data: item, error: itemError } = await supabase
        .from('items')
        .select('duration')
        .eq('id', item_id)
        .single();

    if (itemError || !item) {
        return res.status(400).json({ error: 'Service not found' });
    }

    const { data, error } = await supabase
        .from('bookings')
        .insert([{
            user_id: user.id,
            item_id,
            staff_id: staffId,
            booking_date,
            booking_time,
            duration: item.duration
        }]);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Booking created', data });
};

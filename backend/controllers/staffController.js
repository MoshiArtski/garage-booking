const supabase = require('../config/supabase');

// Helper function to check if the logged-in user is authorized to manage the staff member
const checkGarageOwnership = async (user_id, staff_id) => {
    // Fetch the staff member's garage ID
    const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('garage_id')
        .eq('id', staff_id)
        .single();

    if (staffError || !staffData) {
        return { error: 'Staff member not found', status: 404 };
    }

    // Fetch the user's garage ID from the profile
    const { data: userData, error: userError } = await supabase
        .from('garages')
        .select('id')
        .eq('user_id', user_id)
        .single();

    if (userError || !userData) {
        return { error: 'Garage not found for this user', status: 403 };
    }

    // Check if the staff's garage ID matches the user's garage ID
    if (staffData.garage_id !== userData.id) {
        return { error: 'Unauthorized to manage this staff member', status: 403 };
    }

    return { success: true };
};

// Create a new staff member for the garage
exports.createStaff = async (req, res) => {
    const { name, garage_id } = req.body;

    const { data, error } = await supabase
        .from('staff')
        .insert([{ name, garage_id }])
        .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: 'Staff created', staff: data[0] });
};

// Get all staff members for a garage
exports.getAllStaff = async (req, res) => {
    const { garage_id } = req.params;

    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('garage_id', garage_id);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ staff: data });
};

// Get a single staff member by ID
exports.getStaffById = async (req, res) => {
    const { staff_id } = req.params;

    const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staff_id)
        .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ staff: data });
};

// Update a staff member's details
exports.updateStaff = async (req, res) => {
    const { staff_id } = req.params;
    const { name } = req.body;

    // Check if the logged-in user is authorized to edit this staff
    const ownershipCheck = await checkGarageOwnership(req.user.id, staff_id);
    if (!ownershipCheck.success) {
        return res.status(ownershipCheck.status).json({ error: ownershipCheck.error });
    }

    const { data, error } = await supabase
        .from('staff')
        .update({ name })
        .eq('id', staff_id)
        .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: 'Staff updated', staff: data[0] });
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
    const { staff_id } = req.params;

    // Check if the logged-in user is authorized to delete this staff
    const ownershipCheck = await checkGarageOwnership(req.user.id, staff_id);
    if (!ownershipCheck.success) {
        return res.status(ownershipCheck.status).json({ error: ownershipCheck.error });
    }

    const { data, error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staff_id)
        .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: 'Staff deleted', staff: data[0] });
};

// Set staff availability with broken time slots
exports.setStaffAvailability = async (req, res) => {
    const { staff_id, day_of_week, available_start, available_end } = req.body;

    // Check if the logged-in user is authorized to edit this staff's availability
    const ownershipCheck = await checkGarageOwnership(req.user.id, staff_id);
    if (!ownershipCheck.success) {
        return res.status(ownershipCheck.status).json({ error: ownershipCheck.error });
    }

    const { data, error } = await supabase
        .from('staff_availability')
        .insert([{ staff_id, day_of_week, available_start, available_end }]);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: 'Staff availability set', availability: data[0] });
};

// Get availability of a specific staff member
exports.getStaffAvailability = async (req, res) => {
    const { staff_id } = req.params;

    const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staff_id);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ availability: data });
};

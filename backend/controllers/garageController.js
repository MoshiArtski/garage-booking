// garageController.js
const supabase = require('../config/supabase');

// Create a new garage for an authenticated user
exports.createGarage = async (req, res) => {
    const { name } = req.body;

    // Insert garage into the database
    const { data, error } = await supabase
        .from('garages')
        .insert([{ name, user_id: req.user.id }])
        .select();  // Ensure it returns the inserted data

    // Handle errors
    if (error) return res.status(400).json({ error: error.message });

    // Respond with the created garage
    res.status(200).json({ message: 'Garage created', garage: data[0] });
};

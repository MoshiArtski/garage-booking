const supabase = require('../config/supabase');

// Create a new category
exports.createCategory = async (req, res) => {
    const { name } = req.body;

    const { data, error } = await supabase
        .from('categories')
        .insert([{ name }]);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Category created', data });
};

// Create a new item (service)
exports.createItem = async (req, res) => {
    const { category_id, garage_id, name, duration, price } = req.body;

    const { data, error } = await supabase
        .from('items')
        .insert([{ category_id, garage_id, name, duration, price }]);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Item created', data });
};

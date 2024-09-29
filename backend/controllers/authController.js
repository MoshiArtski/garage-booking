const supabase = require('../config/supabase');

// Register a user and create a garage if the role is 'garage'
exports.registerUser = async (req, res) => {
    const { email, password, role = 'customer', garage_name } = req.body;

    // Supabase sign-up process
    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) return res.status(400).json({ error: error.message });

    // Insert the user profile with the given role
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: user.id, role }]);

    if (profileError) return res.status(400).json({ error: profileError.message });

    // If the role is 'garage', create a garage and link it to the user
    if (role === 'garage' && garage_name) {
        const { data: garageData, error: garageError } = await supabase
            .from('garages')
            .insert([{ name: garage_name, user_id: user.id }]);

        if (garageError) return res.status(400).json({ error: garageError.message });
    }

    res.status(200).json({ message: 'User registered successfully', user });
};

// Login a user and fetch their profile and garage (if garage owner)
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return res.status(401).json({ error: 'Invalid credentials' });

    // Fetch user profile and role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

    if (profileError) return res.status(500).json({ error: 'Error fetching user profile' });

    // Fetch garage data associated with the user if the role is 'garage'
    let garage = null;
    if (profile.role === 'garage') {
        const { data: garageData, error: garageError } = await supabase
            .from('garages')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

        if (garageError) return res.status(500).json({ error: 'Error fetching garage' });
        garage = garageData;
    }

    res.status(200).json({
        message: 'Logged in successfully',
        token: data.session.access_token,
        role: profile.role,
        garage,  // Include garage data if the user is a garage owner
    });
};

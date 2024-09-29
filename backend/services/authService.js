const supabase = require('../config/supabase');

// Register a new user with email and password
exports.registerUser = async (email, password) => {
    const { user, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    return user;
};

// Login a user with email and password
exports.loginUser = async (email, password) => {
    const { session, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    return session.access_token;
};

// Social login using OAuth (Google, Facebook, etc.)
exports.socialLogin = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });

    if (error) {
        throw new Error(error.message);
    }

    return data.url;
};

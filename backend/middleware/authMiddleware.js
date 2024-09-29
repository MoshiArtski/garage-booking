const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authorization token required' });

    const { data: userData, error } = await supabase.auth.getUser(token);
    if (error || !userData.user) return res.status(401).json({ error: 'Invalid token' });

    req.user = userData.user;  // Attach user info to the request
    next();
};

module.exports = authMiddleware;

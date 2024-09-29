const supabase = require('../config/supabase');

const roleMiddleware = (requiredRole) => {
    return async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Authorization token required' });

        const { data: userData, error } = await supabase.auth.getUser(token);
        if (error || !userData.user) return res.status(401).json({ error: 'Invalid token' });

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userData.user.id)
            .single();

        if (profileError || profile.role !== requiredRole) {
            return res.status(403).json({ error: `Access denied. Must be ${requiredRole}` });
        }

        req.user = userData.user;
        next();
    };
};

module.exports = roleMiddleware;

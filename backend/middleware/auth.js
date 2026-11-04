const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { mockUsers } = require('../utils/mockData');

/**
 * Authentication Middleware
 * Validates Supabase JWT Bearer token or mock demo session
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authentication token provided in Authorization header.'
            });
        }

        const token = authHeader.split(' ')[1];

        // 1. Live Supabase Authentication Mode
        if (isSupabaseConfigured() && supabase) {
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid, expired or revoked authentication token.',
                    error: error ? error.message : null
                });
            }

            // Retrieve profile to ascertain role from database
            const { data: profile, error: profileErr } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileErr || !profile) {
                return res.status(403).json({
                    success: false,
                    message: 'User profile record not found in system database.'
                });
            }

            req.user = {
                id: user.id,
                email: user.email,
                role: profile.role,
                full_name: profile.full_name,
                profile
            };
            return next();
        }

        // 2. Demonstration / Local Mock Mode
        // Token could be mock-token-<role> or user ID
        const matchedUser = mockUsers.find(u => 
            token === `mock-token-${u.role}` || 
            token === u.id || 
            token === `token-${u.email}`
        ) || mockUsers[0]; // fallback to admin in mock mode if recognized prefix

        if (token.startsWith('mock-token-') || token.startsWith('demo-token-')) {
            const role = token.split('-')[2] || 'admin';
            const userForRole = mockUsers.find(u => u.role === role) || mockUsers[0];
            req.user = userForRole;
            return next();
        }

        if (matchedUser) {
            req.user = matchedUser;
            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid session token.'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal error during authentication verification.',
            error: err.message
        });
    }
};

/**
 * Role-Based Authorization Middleware
 * Enforces strict privilege segregation (admin, faculty, student)
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: Missing user authorization role.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access forbidden: Role '${req.user.role}' lacks permission for this resource. Required: [${allowedRoles.join(', ')}]`
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRoles
};


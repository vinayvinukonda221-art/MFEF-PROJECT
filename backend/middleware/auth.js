const fs = require('fs');
const path = require('path');
const { supabase, getUserScopedClient, isSupabaseConfigured, hasAnonKey } = require('../config/supabase');
const { mockUsers } = require('../utils/mockData');

// Server-side persistent token revocation storage (blacklist for logged-out / revoked JWTs)
const REVOKED_STORAGE_DIR = path.join(__dirname, '../data');
const REVOKED_STORAGE_FILE = path.join(REVOKED_STORAGE_DIR, 'revoked_tokens.json');

const revokedTokens = new Set();

// Load persisted revocations on server initialization
const initRevokedTokens = () => {
    try {
        if (!fs.existsSync(REVOKED_STORAGE_DIR)) {
            fs.mkdirSync(REVOKED_STORAGE_DIR, { recursive: true });
        }
        if (fs.existsSync(REVOKED_STORAGE_FILE)) {
            const raw = fs.readFileSync(REVOKED_STORAGE_FILE, 'utf8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                parsed.forEach(t => revokedTokens.add(t));
            }
        }
    } catch (err) {
        console.warn('Notice: Could not load persisted token blacklist:', err.message);
    }
};

initRevokedTokens();

const persistRevocations = () => {
    try {
        if (!fs.existsSync(REVOKED_STORAGE_DIR)) {
            fs.mkdirSync(REVOKED_STORAGE_DIR, { recursive: true });
        }
        fs.writeFileSync(REVOKED_STORAGE_FILE, JSON.stringify(Array.from(revokedTokens), null, 2), 'utf8');
    } catch (err) {
        console.warn('Notice: Could not persist token blacklist to disk:', err.message);
    }
};

/**
 * Revoke an active session token upon logout and persist across restarts
 */
const revokeToken = (token) => {
    if (token) {
        revokedTokens.add(token);
        persistRevocations();
    }
};

/**
 * Check if a token has been revoked
 */
const isTokenRevoked = (token) => {
    return Boolean(token && revokedTokens.has(token));
};

/**
 * Clear revocation cache (utility for testing)
 */
const clearRevocations = () => {
    revokedTokens.clear();
    persistRevocations();
};

/**
 * Authentication Middleware
 * Validates Supabase JWT Bearer token or mock demo session,
 * enforces revocation checks, verifies account status (active/inactive),
 * and attaches a user-scoped Supabase client (without falling back to service-role).
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

        // Check if token has been explicitly revoked via logout
        if (isTokenRevoked(token)) {
            return res.status(401).json({
                success: false,
                message: 'Session has been invalidated or logged out. Please sign in again.'
            });
        }

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

            // Retrieve profile to ascertain role and active status from database
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

            // Strict Security Requirement: Reject Inactive Accounts
            if (profile.is_active === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated. Please contact your institutional administrator.'
                });
            }

            // User-scoped client: strictly user-scoped (no service-role fallback)
            const userClient = getUserScopedClient(token);
            req.supabase = userClient; // Enforces database RLS with auth.uid() = user.id
            req.token = token;
            req.user = {
                id: user.id,
                email: user.email,
                role: profile.role,
                full_name: profile.full_name,
                is_active: profile.is_active,
                profile
            };
            return next();
        }

        // 2. Demonstration / Local Mock Mode
        // Token format: mock-token-<role> or user ID
        const matchedUser = mockUsers.find(u =>
            token === `mock-token-${u.role}` ||
            token === u.id ||
            token === `token-${u.email}`
        ) || (token.startsWith('mock-token-') ? mockUsers.find(u => u.role === token.split('-')[2]) : null);

        if (matchedUser) {
            if (matchedUser.is_active === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated. Please contact your institutional administrator.'
                });
            }

            req.user = { ...matchedUser };
            req.token = token;
            req.supabase = null;
            return next();
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid, expired or unrecognized session token.'
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
    authorizeRoles,
    revokeToken,
    isTokenRevoked,
    clearRevocations
};

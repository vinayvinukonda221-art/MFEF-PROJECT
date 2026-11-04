const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { mockUsers, mockFaculty, mockStudents } = require('../utils/mockData');

/**
 * Handle User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Both email and password are required.'
            });
        }

        // Live Supabase Auth
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error || !data.user || !data.session) {
                return res.status(401).json({
                    success: false,
                    message: error ? error.message : 'Invalid credentials provided.'
                });
            }

            // Retrieve profile to fetch explicit role
            const { data: profile, error: profErr } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profErr || !profile) {
                return res.status(403).json({
                    success: false,
                    message: 'Authentication successful, but user profile was not found.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Login successful.',
                token: data.session.access_token,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    role: profile.role,
                    full_name: profile.full_name,
                    phone: profile.phone,
                    avatar_url: profile.avatar_url
                }
            });
        }

        // Local / Demonstration Mock Mode
        const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Demo logins: admin@sms.edu (Admin@123), faculty@sms.edu (Faculty@123), student@sms.edu (Student@123)'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Demo login successful.',
            token: `mock-token-${user.role}`,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                phone: user.phone,
                avatar_url: null,
                isDemo: true
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal error during authentication.',
            error: err.message
        });
    }
};

/**
 * Handle User Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        if (isSupabaseConfigured() && supabase) {
            await supabase.auth.signOut();
        }

        return res.status(200).json({
            success: true,
            message: 'Successfully logged out.'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Logout failed.',
            error: err.message
        });
    }
};

/**
 * Get Current User Profile Details
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (isSupabaseConfigured() && supabase) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                return res.status(404).json({
                    success: false,
                    message: 'User profile not found.'
                });
            }

            let roleSpecificData = null;
            if (role === 'student') {
                const { data: student } = await supabase
                    .from('students')
                    .select('*, departments(code, name)')
                    .eq('profile_id', userId)
                    .single();
                roleSpecificData = student;
            } else if (role === 'faculty') {
                const { data: faculty } = await supabase
                    .from('faculty')
                    .select('*, departments(code, name)')
                    .eq('profile_id', userId)
                    .single();
                roleSpecificData = faculty;
            }

            return res.status(200).json({
                success: true,
                profile,
                details: roleSpecificData
            });
        }

        // Mock profile lookup
        const user = mockUsers.find(u => u.id === userId || u.role === role) || mockUsers[0];
        let roleSpecificData = null;
        if (role === 'student') {
            roleSpecificData = mockStudents[0];
        } else if (role === 'faculty') {
            roleSpecificData = mockFaculty[0];
        }

        return res.status(200).json({
            success: true,
            profile: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                phone: user.phone
            },
            details: roleSpecificData
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching profile.',
            error: err.message
        });
    }
};

module.exports = {
    login,
    logout,
    getProfile
};


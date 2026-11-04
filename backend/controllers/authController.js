const { supabase, supabaseAuth, isSupabaseConfigured } = require('../config/supabase');
const { revokeToken } = require('../middleware/auth');
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
            const authClient = supabaseAuth;
            if (!authClient) {
                return res.status(500).json({
                    success: false,
                    message: 'Authentication client not initialized. Anon key required.'
                });
            }

            const { data, error } = await authClient.auth.signInWithPassword({
                email,
                password
            });

            if (error || !data.user || !data.session) {
                return res.status(401).json({
                    success: false,
                    message: error ? error.message : 'Invalid credentials provided.'
                });
            }

            // Retrieve profile to fetch role and active status
            const { data: profile, error: profErr } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profErr || !profile) {
                return res.status(403).json({
                    success: false,
                    message: 'Authentication successful, but user profile was not found in institutional database.'
                });
            }

            // Reject inactive accounts
            if (profile.is_active === false) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated. Please contact your institutional administrator.'
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
                    avatar_url: profile.avatar_url,
                    is_active: profile.is_active
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

        if (user.is_active === false) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact your institutional administrator.'
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
                is_active: user.is_active !== false,
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
 * Security: Revokes the caller's session token and invalidates active session.
 */
const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

        // Explicitly revoke token server-side
        if (token) {
            revokeToken(token);
        }

        if (isSupabaseConfigured() && supabase) {
            try {
                if (req.supabase) {
                    await req.supabase.auth.signOut();
                } else if (supabaseAuth) {
                    await supabaseAuth.auth.signOut();
                }
            } catch (signOutErr) {
                console.warn('[Logout] Remote signout notice:', signOutErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Successfully logged out. Session token has been revoked.'
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
            const client = req.supabase || supabase;
            const { data: profile, error } = await client
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
                const { data: student } = await client
                    .from('students')
                    .select('*, departments(code, name)')
                    .eq('profile_id', userId)
                    .single();
                roleSpecificData = student;
            } else if (role === 'faculty') {
                const { data: faculty } = await client
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
                phone: user.phone,
                is_active: user.is_active !== false
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

/**
 * Update Current User Profile
 * PUT /api/auth/profile
 * Security Requirement (BUG-03): Protected authorization fields (role, is_active, id, email, department_id)
 * CANNOT be modified by users. Explicit allowlist is enforced.
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const bodyKeys = Object.keys(req.body);

        // Strict Protected Fields Blacklist
        const protectedFields = ['role', 'is_active', 'id', 'email', 'institution_id', 'department_id', 'semester', 'roll_number', 'status', 'batch', 'academic_year'];
        for (const field of protectedFields) {
            if (bodyKeys.includes(field)) {
                if (field === 'role' && req.body[field] !== req.user.role) {
                    return res.status(403).json({
                        success: false,
                        message: "Access forbidden: Modifying user role is strictly restricted to institutional administrators."
                    });
                }
                if (field !== 'role') {
                    return res.status(403).json({
                        success: false,
                        message: `Access forbidden: Modification of protected field '${field}' is not permitted.`
                    });
                }
            }
        }

        // Explicit Allowed Fields Whitelist
        const { full_name, phone, avatar_url, address, emergency_contact } = req.body;

        const profileUpdates = {};
        if (full_name !== undefined) {
            if (typeof full_name !== 'string' || full_name.trim().length < 2) {
                return res.status(400).json({ success: false, message: 'Valid full_name is required (min 2 characters).' });
            }
            profileUpdates.full_name = full_name.trim();
        }
        if (phone !== undefined) profileUpdates.phone = String(phone).trim();
        if (avatar_url !== undefined) profileUpdates.avatar_url = String(avatar_url).trim();
        profileUpdates.updated_at = new Date().toISOString();

        if (isSupabaseConfigured() && supabase) {
            const client = req.supabase || supabase;
            const { data: updatedProfile, error: profErr } = await client
                .from('profiles')
                .update(profileUpdates)
                .eq('id', userId)
                .select()
                .single();

            if (profErr) {
                return res.status(400).json({ success: false, message: profErr.message });
            }

            // If student, allow updating student address / emergency_contact
            if (req.user.role === 'student' && (address !== undefined || emergency_contact !== undefined)) {
                const studentUpdates = {};
                if (address !== undefined) studentUpdates.address = address;
                if (emergency_contact !== undefined) studentUpdates.emergency_contact = emergency_contact;
                studentUpdates.updated_at = new Date().toISOString();

                await client.from('students').update(studentUpdates).eq('profile_id', userId);
            }

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully.',
                profile: updatedProfile
            });
        }

        // Mock mode update
        const userIdx = mockUsers.findIndex(u => u.id === userId || u.role === req.user.role);
        if (userIdx !== -1) {
            mockUsers[userIdx] = { ...mockUsers[userIdx], ...profileUpdates };
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            profile: { ...req.user, ...profileUpdates }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error updating profile.',
            error: err.message
        });
    }
};

module.exports = {
    login,
    logout,
    getProfile,
    updateProfile
};

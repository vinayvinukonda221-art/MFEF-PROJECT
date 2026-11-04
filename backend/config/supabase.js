const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if valid credentials (not placeholder) are present
const hasUrl = Boolean(supabaseUrl && !supabaseUrl.includes('placeholder'));
const hasAnon = Boolean(supabaseAnonKey && !supabaseAnonKey.includes('placeholder'));
const hasService = Boolean(supabaseServiceKey && !supabaseServiceKey.includes('placeholder'));

const isConfigured = hasUrl && hasService && hasAnon;

// 1. Admin service-role client: strictly for trusted server-side administrative operations
// (such as provisioning Auth users or deleting Auth users).
// NEVER exposed to clients or used as a fallback for user-level queries.
let adminClient = null;
if (hasUrl && hasService) {
    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// 2. Public auth client: uses anon key for user sign-in and password verification ONLY.
// If anon key is missing, publicAuthClient remains null (no automatic fallback to adminClient!).
let publicAuthClient = null;
if (hasUrl && hasAnon) {
    publicAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// 3. User-scoped client factory: attaches the caller's verified JWT Bearer token
// so PostgREST enforces database-level Row Level Security (RLS) based on auth.uid().
// SECURITY RULE: Under no circumstances does this fall back to adminClient if token or anon key is missing!
const getUserScopedClient = (token) => {
    if (!hasUrl || !hasAnon || !token) {
        // Fail securely: do not provide an unauthenticated or privileged client
        return null;
    }
    
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

if (isConfigured) {
    console.log('[Supabase] Initialized: User-Scoped RLS enabled (Anon client) + Isolated Admin operations.');
} else {
    console.warn('[Supabase] Note: Full live credentials not detected; running in secure demonstration/fallback mode.');
}

module.exports = {
    supabase: adminClient,
    supabaseAuth: publicAuthClient,
    getUserScopedClient,
    isSupabaseConfigured: () => isConfigured,
    hasAnonKey: () => hasAnon,
    hasServiceKey: () => hasService
};

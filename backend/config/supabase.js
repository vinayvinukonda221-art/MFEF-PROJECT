const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = 
    Boolean(supabaseUrl && supabaseServiceKey && 
    !supabaseUrl.includes('placeholder') && 
    !supabaseServiceKey.includes('placeholder'));

let supabaseClient = null;

if (isConfigured) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    console.log('[Supabase] Initialized successfully with configured PostgreSQL credentials.');
} else {
    console.warn('[Supabase] Warning: Live Supabase credentials not found or set to placeholder.');
    console.warn('[Supabase] Running in demonstration fallback mode. Update backend/.env with your real Supabase URL & Key to query live database.');
}

module.exports = {
    supabase: supabaseClient,
    isSupabaseConfigured: () => isConfigured
};


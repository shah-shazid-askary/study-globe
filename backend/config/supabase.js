const { createClient } = require('@supabase/supabase-js');

let client;

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { supabaseUrl, supabaseServiceKey };
}

function getSupabase() {
  if (!client) {
    const { supabaseUrl, supabaseServiceKey } = getSupabaseConfig();
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables');
    }
    client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return client;
}

function isSupabaseConfigured() {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseConfig();
  return Boolean(supabaseUrl && supabaseServiceKey);
}

module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === 'isConfigured') return isSupabaseConfigured;
      if (prop === 'getClient') return getSupabase;
      const value = getSupabase()[prop];
      return typeof value === 'function' ? value.bind(getSupabase()) : value;
    },
  }
);

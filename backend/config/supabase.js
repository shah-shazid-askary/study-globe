const { createClient } = require('@supabase/supabase-js');

let client;

function getSupabase() {
  if (!client) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables');
    }
    client = createClient(supabaseUrl, supabaseServiceKey);
  }
  return client;
}

module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = getSupabase()[prop];
      return typeof value === 'function' ? value.bind(getSupabase()) : value;
    },
  }
);

const url = process.env.SUPABASE_URL?.trim();
const key = (
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();

if (!url || !key) {
  console.error('\n❌ Backend build blocked — missing Supabase environment variables:\n');
  if (!url) console.error('   • SUPABASE_URL');
  if (!key) console.error('   • SUPABASE_SERVICE_KEY  (your Supabase service role key)\n');
  console.error('Add them in Vercel → Project → Settings → Environment Variables');
  console.error('Enable Production + Preview + Development, then redeploy.\n');
  process.exit(1);
}

console.log('✓ Supabase environment variables detected');

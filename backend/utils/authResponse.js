async function fetchUserMeta(supabase, userId) {
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (!userErr && userRow) return userRow;

  if (userErr) {
    console.error('users table lookup failed:', userErr.message);
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, is_admin')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) return null;

  return {
    full_name: profile.full_name,
    role: profile.is_admin ? 'admin' : 'student',
  };
}

function buildUserPayload(authUser, customUser) {
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: customUser?.full_name || authUser.user_metadata?.full_name || '',
    role: customUser?.role || 'student',
    user_metadata: authUser.user_metadata || {},
  };
}

function buildSessionPayload(session, userPayload) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: userPayload,
  };
}

function buildAuthResponse(session, authUser, customUser, message) {
  const userPayload = buildUserPayload(authUser, customUser);
  return {
    message,
    user: userPayload,
    session: buildSessionPayload(session, userPayload),
  };
}

module.exports = {
  fetchUserMeta,
  buildAuthResponse,
};

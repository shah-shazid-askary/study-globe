const supabase = require('../config/supabase');
const { ollama, fetchContext, buildContextString } = require('../utils/ragHelper');

// user_profiles.user_id is FK → users.id (custom users table)
// So we must ensure a row in `users` exists for this auth user before touching user_profiles

const ensureUserRow = async (authUser) => {
  // Only INSERT if the row doesn't exist yet — never overwrite existing full_name
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!existing) {
    // First time: create the row with a derived name
    const { error } = await supabase.from('users').insert({
      id: authUser.id,
      email: authUser.email,
      password_hash: 'supabase_auth_managed',
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
      role: 'student',
      is_verified: !!authUser.email_confirmed_at,
    });
    if (error) console.error('ensureUserRow insert error:', error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    await ensureUserRow(req.user);

    // Fetch user_profiles row
    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    // Also fetch full_name from the users table
    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', req.user.id)
      .maybeSingle();

    res.json({ ...(profileData || {}), full_name: userData?.full_name || '' });
  } catch (err) {
    console.error('getProfile error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

const updateProfile = async (req, res) => {
  const {
    full_name,
    date_of_birth, phone, current_education_level,
    field_of_interest, preferred_countries, budget_range, target_intake,
  } = req.body;

  // preferred_countries is TEXT[] in DB — convert comma-separated string to array if needed
  const parseCountries = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    return val.split(',').map(s => s.trim()).filter(Boolean);
  };

  const updates = {
    date_of_birth: date_of_birth || null,
    phone: phone || null,
    current_education_level: current_education_level || null,
    field_of_interest: field_of_interest || null,
    preferred_countries: parseCountries(preferred_countries),
    budget_range: budget_range || null,
    target_intake: target_intake || null,
    updated_at: new Date().toISOString(),
  };

  try {
    // Ensure the user row exists (FK dependency)
    await ensureUserRow(req.user);

    // Update full_name in the users table if provided
    if (full_name && full_name.trim()) {
      const { error: nameErr } = await supabase
        .from('users')
        .update({ full_name: full_name.trim() })
        .eq('id', req.user.id);
      if (nameErr) console.error('full_name update error:', nameErr.message);
    }

    // Check if profile row exists
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', req.user.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('user_profiles')
        .insert({ user_id: req.user.id, ...updates })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json({ message: 'Profile updated successfully', profile: result.data });
  } catch (err) {
    console.error('updateProfile error:', err.message, err);
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (!profile) {
      return res.status(400).json({ error: 'Please save your profile first before generating recommendations.' });
    }

    // Require at least some core criteria to prevent hallucinated/generic recommendations
    if (!profile.field_of_interest && (!profile.preferred_countries || profile.preferred_countries.length === 0) && !profile.current_education_level) {
      return res.status(400).json({ error: 'Your profile is too empty! Please fill out at least your Field of Interest or Preferred Countries to generate a personalized plan.' });
    }

    const queryStr = `
      Field: ${profile.field_of_interest || 'Any'}
      Countries: ${(profile.preferred_countries || []).join(', ') || 'Any'}
      Education limit: ${profile.current_education_level || 'Any'}
      Budget: ${profile.budget_range || 'Any'}
    `;

    const context = await fetchContext(queryStr);
    const contextStr = buildContextString(context);

    const systemPrompt = `You are an expert StudyGlobe Academic Advisor. 
    A user wants university and program recommendations based on their profile:
    ${queryStr}

    Using ONLY the following dataset, recommend 2-3 specific programs that best match their criteria.
    Format your response in Markdown with clear headings for each university/program.
    CRITICAL RULE FOR OUTPUT: You must NEVER output raw database IDs (e.g., "university_id: 3", "country_id: 1", or "degree_level_id"). You MUST cross-reference those IDs within the provided datasets and ONLY output the actual human-readable names (e.g., "Harvard University", "United Kingdom", "Master's Degree").
    Do NOT invent information that is not inside the dataset!

    ${contextStr}`;

    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || 'gemma4:31b',
      messages: [{ role: 'system', content: systemPrompt }]
    });

    res.json({ recommendations: response.message.content });
  } catch (err) {
    console.error('getRecommendations error:', err.message);
    const detail = err.message || '';
    if (detail.includes('429') || detail.includes('524') || detail.includes('timeout')) {
      return res.status(503).json({ error: 'AI advisor is currently busy. Please try again in a few moments.' });
    }
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

module.exports = { getProfile, updateProfile, getRecommendations };

const supabase = require('../config/supabase');

const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['student', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role assignment' });
  }

  try {
    const { data, error } = await supabase.from('users').update({ role }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[User Controller] Failed to update role:', err);
    res.status(500).json({ error: JSON.stringify(err, Object.getOwnPropertyNames(err)) });
  }
};

module.exports = { getAllUsers, updateUserRole };

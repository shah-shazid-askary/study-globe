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
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'User not found or you do not have permission to modify this user. (If running locally, please restart your backend server to ensure the service role key is loaded)' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error('[User Controller] Failed to update role:', err);
    res.status(500).json({ error: err.message || 'Failed to update user role' });
  }
};

module.exports = { getAllUsers, updateUserRole };

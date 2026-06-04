const supabase = require('../config/supabase');

const getPreDeparture = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_predeparture')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getPreDeparture error:', err);
    res.status(500).json({ error: 'Failed to retrieve pre-departure status' });
  }
};

const updatePreDeparture = async (req, res) => {
  const { item_key, is_completed } = req.body;

  if (!item_key) {
    return res.status(400).json({ error: 'Item key is required' });
  }

  try {
    // Check if record exists
    const { data: existing, error: findErr } = await supabase
      .from('user_predeparture')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('item_key', item_key)
      .maybeSingle();

    if (findErr) throw findErr;

    let result;
    if (existing) {
      result = await supabase
        .from('user_predeparture')
        .update({
          is_completed: !!is_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('user_predeparture')
        .insert({
          user_id: req.user.id,
          item_key,
          is_completed: !!is_completed
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (err) {
    console.error('updatePreDeparture error:', err);
    res.status(500).json({ error: err.message || 'Failed to update pre-departure checklist' });
  }
};

module.exports = { getPreDeparture, updatePreDeparture };

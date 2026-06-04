const supabase = require('../config/supabase');

const getGuidelines = async (req, res) => {
  const { country_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('country_guidelines')
      .select('*')
      .eq('country_id', country_id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Return empty defaults so the frontend doesn't crash and has form inputs ready
      return res.json({
        country_id: parseInt(country_id, 10),
        visa_rules: '',
        work_permit_rules: '',
        living_costs: '',
        general_requirements: ''
      });
    }

    res.json(data);
  } catch (err) {
    console.error('getGuidelines error:', err);
    res.status(500).json({ error: 'Failed to retrieve country guidelines' });
  }
};

const updateGuidelines = async (req, res) => {
  const { country_id } = req.params;
  const { visa_rules, work_permit_rules, living_costs, general_requirements } = req.body;

  try {
    // Check if record already exists
    const { data: existing, error: findErr } = await supabase
      .from('country_guidelines')
      .select('id')
      .eq('country_id', country_id)
      .maybeSingle();

    if (findErr) throw findErr;

    let result;
    if (existing) {
      result = await supabase
        .from('country_guidelines')
        .update({
          visa_rules: visa_rules || '',
          work_permit_rules: work_permit_rules || '',
          living_costs: living_costs || '',
          general_requirements: general_requirements || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('country_guidelines')
        .insert({
          country_id: parseInt(country_id, 10),
          visa_rules: visa_rules || '',
          work_permit_rules: work_permit_rules || '',
          living_costs: living_costs || '',
          general_requirements: general_requirements || ''
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (err) {
    console.error('updateGuidelines error:', err);
    res.status(500).json({ error: err.message || 'Failed to update country guidelines' });
  }
};

module.exports = { getGuidelines, updateGuidelines };

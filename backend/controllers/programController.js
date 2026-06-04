const supabase = require('../config/supabase');

// Real schema: programs(id, university_id, degree, field, duration_years, tuition_per_year, degree_level_id)
const getAllPrograms = async (req, res) => {
  const { university_id, degree_level, field } = req.query;
  try {
    // Join universities using real column 'Name' (capital N)
    let query = supabase.from('programs').select('*, universities(Name, id)');
    if (university_id) query = query.eq('university_id', university_id);
    // programs table uses 'degree' column, not 'degree_level'
    if (degree_level) query = query.ilike('degree', `%${degree_level}%`);
    if (field) query = query.ilike('field', `%${field}%`);
    const { data, error } = await query.order('field');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getAllPrograms error:', err);
    res.status(500).json({ error: 'Failed to retrieve programs' });
  }
};

const getProgramsByUniversity = async (req, res) => {
  const { degree_level, field } = req.query;
  try {
    let query = supabase.from('programs').select('*').eq('university_id', req.params.university_id);
    if (degree_level) query = query.ilike('degree', `%${degree_level}%`);
    if (field) query = query.ilike('field', `%${field}%`);
    const { data, error } = await query.order('field');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getProgramsByUniversity error:', err);
    res.status(500).json({ error: 'Failed to retrieve programs' });
  }
};

const createProgram = async (req, res) => {
  const { university_id } = req.body;
  if (!university_id) return res.status(400).json({ error: 'University ID required' });
  try {
    const { data, error } = await supabase.from('programs').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create program' });
  }
};

const updateProgram = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('programs').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Program not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update program' });
  }
};

const deleteProgram = async (req, res) => {
  try {
    const { error } = await supabase.from('programs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Program deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete program' });
  }
};

module.exports = { getAllPrograms, getProgramsByUniversity, createProgram, updateProgram, deleteProgram };

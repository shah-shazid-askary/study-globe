const supabase = require('../config/supabase');

// Real DB schema:
// universities: id, Name (capital N), country_id, city, type, website, description
// countries: id, name
// programs: id, university_id, degree, field, duration_years, tuition_per_year, degree_level_id
// intakes: id, university_id, intake_name, start_month
// language_requirements: id, university_id, test_name, min_score
// scholarship_eligibility: id, university_id, degree_level_id, eligibility_basis, minimum_gpa, additional_notes

const getAllUniversities = async (req, res) => {
  const { country_id, search } = req.query;
  try {
    let query = supabase.from('universities').select('*, countries(name)');
    if (country_id) query = query.eq('country_id', country_id);
    if (search && search.trim()) query = query.ilike('Name', `%${search.trim()}%`);
    const { data, error } = await query.order('Name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getAllUniversities error:', err);
    res.status(500).json({ error: 'Failed to retrieve universities' });
  }
};

const getUniversityById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select(`
        *,
        countries(name),
        programs(*),
        intakes(*),
        language_requirements(*),
        scholarship_eligibility(*)
      `)
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'University not found' });
    res.json(data);
  } catch (err) {
    console.error('getUniversityById error:', err);
    res.status(500).json({ error: 'Failed to retrieve university' });
  }
};

const createUniversity = async (req, res) => {
  const { id, Name, country_id, city, type, website, description } = req.body;
  if (!Name || !country_id) return res.status(400).json({ error: 'Name and country are required' });
  
  try {
    // Check for duplicates
    if (id) {
      const { data: existingId } = await supabase.from('universities').select('id').eq('id', id).maybeSingle();
      if (existingId) return res.status(400).json({ error: `University ID ${id} already exists.` });
    }

    const { data: existingName } = await supabase.from('universities').select('id').ilike('Name', Name).maybeSingle();
    if (existingName) return res.status(400).json({ error: `University name '${Name}' already exists in the database.` });

    const insertPayload = { Name, country_id, city, type, website, description };
    if (id) {
      insertPayload.id = id;
    } else {
      // Fix for busted postgres sequences: manually compute next ID
      const { data: maxRecord } = await supabase.from('universities')
        .select('id').order('id', { ascending: false }).limit(1).maybeSingle();
      if (maxRecord) {
        insertPayload.id = maxRecord.id + 1;
      }
    }

    const { data, error } = await supabase.from('universities').insert(insertPayload).select().single();
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('createUniversity error:', err);
    res.status(500).json({ error: err.message || err.details || 'Failed to create university' });
  }
};

const updateUniversity = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('universities').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'University not found' });
    res.json(data);
  } catch (err) {
    console.error('updateUniversity error:', err);
    res.status(500).json({ error: err.message || 'Failed to update university' });
  }
};

const deleteUniversity = async (req, res) => {
  const { id } = req.params;
  try {
    // Manual Cascade: Delete all dependent records first
    await Promise.all([
      supabase.from('programs').delete().eq('university_id', id),
      supabase.from('intakes').delete().eq('university_id', id),
      supabase.from('language_requirements').delete().eq('university_id', id),
      supabase.from('scholarship_eligibility').delete().eq('university_id', id)
    ]);

    // Finally delete the university
    const { error } = await supabase.from('universities').delete().eq('id', id);
    if (error) throw error;
    
    res.json({ message: 'University and all associated data deleted successfully' });
  } catch (err) {
    console.error('deleteUniversity error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete university' });
  }
};

module.exports = { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity };

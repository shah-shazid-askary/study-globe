const supabase = require('../config/supabase');

const getAllCountries = async (req, res) => {
  try {
    const { data, error } = await supabase.from('countries').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve countries' });
  }
};

const getCountryById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('countries').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Country not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve country' });
  }
};

const createCountry = async (req, res) => {
  const { id, name } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Country name is required' });
  
  try {
    // Check for duplicates
    if (id) {
      const { data: existingId } = await supabase.from('countries').select('id').eq('id', id).maybeSingle();
      if (existingId) return res.status(400).json({ error: `Country ID ${id} already exists.` });
    }
    
    const { data: existingName } = await supabase.from('countries').select('id').ilike('name', name).maybeSingle();
    if (existingName) return res.status(400).json({ error: `Country name '${name}' already exists in the database.` });

    const insertPayload = { name };
    if (id) {
      insertPayload.id = id;
    } else {
      // Fix for busted postgres sequences: manually compute next ID
      const { data: maxRecord } = await supabase.from('countries')
        .select('id').order('id', { ascending: false }).limit(1).maybeSingle();
      if (maxRecord) {
        insertPayload.id = maxRecord.id + 1;
      }
    }

    const { data, error } = await supabase
      .from('countries').insert(insertPayload).select().single();
      
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (err) {
    console.error('createCountry error:', err);
    res.status(500).json({ error: err.message || err.details || 'Failed to create country' });
  }
};

const updateCountry = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('countries').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Country not found' });
    res.json(data);
  } catch (err) {
    console.error('updateCountry error:', err);
    res.status(500).json({ error: err.message || 'Failed to update country' });
  }
};

const deleteCountry = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get all university IDs for this country
    const { data: unis } = await supabase.from('universities').select('id').eq('country_id', id);
    const uniIds = unis?.map(u => u.id) || [];

    if (uniIds.length > 0) {
      // 2. Clear all children of those universities
      await Promise.all([
        supabase.from('programs').delete().in('university_id', uniIds),
        supabase.from('intakes').delete().in('university_id', uniIds),
        supabase.from('language_requirements').delete().in('university_id', uniIds),
        supabase.from('scholarship_eligibility').delete().in('university_id', uniIds)
      ]);

      // 3. Delete the universities
      await supabase.from('universities').delete().in('id', uniIds);
    }

    // 4. Finally delete the country
    const { error } = await supabase.from('countries').delete().eq('id', id);
    if (error) throw error;

    res.json({ message: 'Country and all associated data deleted successfully' });
  } catch (err) {
    console.error('deleteCountry error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete country' });
  }
};

module.exports = { getAllCountries, getCountryById, createCountry, updateCountry, deleteCountry };

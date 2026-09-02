const supabase = require('../config/supabase');

const getResources = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('resource_library')
      .select('*')
      .order('category')
      .order('title');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getResources error:', err);
    res.status(500).json({ error: 'Failed to retrieve resources' });
  }
};

const createResource = async (req, res) => {
  const { category, title, description, external_url, file_path } = req.body;

  if (!category || !title) {
    return res.status(400).json({ error: 'Category and Title are required' });
  }

  try {
    console.log('[createResource] Request to insert resource:', req.body);
    const { data, error } = await supabase
      .from('resource_library')
      .insert({
        category,
        title,
        description: description || '',
        external_url: external_url || '',
        file_path: file_path || ''
      })
      .select()
      .single();

    if (error) {
      console.error('[createResource] Supabase insert error:', error);
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    console.error('[createResource] Catch block error:', err);
    res.status(500).json({ error: err.message || 'Failed to create resource' });
  }
};

const updateResource = async (req, res) => {
  const { id } = req.params;
  const { category, title, description, external_url, file_path } = req.body;

  try {
    console.log(`[updateResource] Request to update resource ${id}:`, req.body);
    const { data, error } = await supabase
      .from('resource_library')
      .update({
        category,
        title,
        description,
        external_url,
        file_path
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateResource] Supabase update error:', error);
      throw error;
    }
    if (!data) {
      console.log('[updateResource] Resource not found for ID:', id);
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('[updateResource] Catch block error:', err);
    res.status(500).json({ error: err.message || 'Failed to update resource' });
  }
};

const deleteResource = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('resource_library')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error('deleteResource error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete resource' });
  }
};

module.exports = { getResources, createResource, updateResource, deleteResource };

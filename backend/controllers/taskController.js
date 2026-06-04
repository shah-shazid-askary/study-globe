const supabase = require('../config/supabase');

const getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('application_tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('due_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve application tasks' });
  }
};

const createTask = async (req, res) => {
  const { title, description, due_date, status } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  try {
    const { data, error } = await supabase
      .from('application_tasks')
      .insert({
        user_id: req.user.id,
        title,
        description: description || '',
        due_date: due_date || null,
        status: status || 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: err.message || 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status } = req.body;

  try {
    // Verify ownership
    const { data: existing, error: findErr } = await supabase
      .from('application_tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!existing) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const { data, error } = await supabase
      .from('application_tasks')
      .update({
        title,
        description,
        due_date,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ error: err.message || 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Verify ownership
    const { data: existing, error: findErr } = await supabase
      .from('application_tasks')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!existing) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const { error } = await supabase
      .from('application_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete task' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };

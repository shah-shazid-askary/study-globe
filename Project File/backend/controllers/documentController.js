const supabase = require('../config/supabase');

const getDocuments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('getDocuments error:', err);
    res.status(500).json({ error: 'Failed to retrieve documents list' });
  }
};

const submitDocument = async (req, res) => {
  const { document_type, google_drive_url } = req.body;

  if (!document_type) {
    return res.status(400).json({ error: 'Document type is required' });
  }
  if (!google_drive_url) {
    return res.status(400).json({ error: 'Google Drive URL is required' });
  }

  // Basic Google Drive URL check to satisfy user request
  if (!google_drive_url.includes('drive.google.com')) {
    return res.status(400).json({ error: 'Please enter a valid Google Drive sharing URL' });
  }

  try {
    // Check if document already exists
    const { data: existing, error: findErr } = await supabase
      .from('user_documents')
      .select('id, status')
      .eq('user_id', req.user.id)
      .eq('document_type', document_type)
      .maybeSingle();

    if (findErr) throw findErr;

    let result;
    if (existing) {
      // If it is already verified, do not reset status unless specified, but usually updating file resets status to uploaded
      const newStatus = existing.status === 'verified' ? 'verified' : 'uploaded';
      result = await supabase
        .from('user_documents')
        .update({
          google_drive_url,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('user_documents')
        .insert({
          user_id: req.user.id,
          document_type,
          google_drive_url,
          status: 'uploaded'
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    res.json(result.data);
  } catch (err) {
    console.error('submitDocument error:', err);
    res.status(500).json({ error: err.message || 'Failed to submit document' });
  }
};

const verifyDocument = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'verified' or 'missing'

  if (!status || !['verified', 'missing', 'uploaded'].includes(status)) {
    return res.status(400).json({ error: 'Invalid document status update' });
  }

  try {
    const { data, error } = await supabase
      .from('user_documents')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Document record not found' });

    res.json(data);
  } catch (err) {
    console.error('verifyDocument error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify document' });
  }
};

module.exports = { getDocuments, submitDocument, verifyDocument };

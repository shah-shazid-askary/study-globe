const supabase = require('../config/supabase');

// FIX: Validate Supabase JWT via SDK — jwt.verify() with static secret does NOT work for Supabase
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    console.log('[requireAdmin] No user on request object');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: customUser, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('[requireAdmin] Database error looking up user:', error);
      return res.status(500).json({ error: `Internal query error: ${error.message}` });
    }

    if (!customUser) {
      console.log('[requireAdmin] No user found in users table for ID:', req.user.id);
      return res.status(403).json({ error: 'Forbidden: Admin profile not found' });
    }

    if (customUser.role !== 'admin') {
      console.log(`[requireAdmin] User role is ${customUser.role}, not admin`);
      return res.status(403).json({ error: `Forbidden: Admin access required (Your role is ${customUser.role})` });
    }
    
    next();
  } catch (err) {
    console.error('[requireAdmin] Caught exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 

module.exports = { authenticateUser, requireAdmin };
 
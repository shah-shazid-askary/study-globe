const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const countryRoutes = require('./routes/countries');
const universityRoutes = require('./routes/universities');
const programRoutes = require('./routes/programs');
const profileRoutes = require('./routes/profile');
const chatRoutes = require('./routes/chat');
const usersRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const taskRoutes = require('./routes/tasks');
const documentRoutes = require('./routes/documents');
const predepartureRoutes = require('./routes/predeparture');
const resourceRoutes = require('./routes/resources');
const guidelineRoutes = require('./routes/guidelines');
const sopReviewRoutes = require('./routes/sopReview');

const app = express();

// CORS: allow Vercel, Netlify, preview deploys, and local dev
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.DEPLOY_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8888',
  ].filter(Boolean)
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
    if (/^https:\/\/([a-z0-9-]+\.)*netlify\.app$/.test(origin)) return callback(null, true);
    if (/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/.test(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));

// FIX: express.json() middleware was missing
app.use(express.json());

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/countries', countryRoutes);
apiRouter.use('/universities', universityRoutes);
apiRouter.use('/programs', programRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/predeparture', predepartureRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/guidelines', guidelineRoutes);
apiRouter.use('/ai/review-sop', sopReviewRoutes);

apiRouter.get('/health', (req, res) => {
  const supabase = require('./config/supabase');
  res.json({
    status: 'OK',
    supabaseConfigured: supabase.isConfigured(),
  });
});

// /api — local dev | /_/backend — Vercel Services | / — Netlify function proxy
app.use('/api', apiRouter);
app.use('/_/backend', apiRouter);
app.use('/', apiRouter);

// FIX: Added 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// FIX: Added global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start HTTP server when running server.js directly (not as a Netlify function import)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

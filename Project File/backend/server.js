require('dotenv').config();
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

// FIX: CORS must be configured before routes
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow FRONTEND_URL or reflect origin if not set
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

apiRouter.get('/health', (req, res) => res.json({ status: 'OK' }));

// Mount at /api for local dev; also at / for Netlify function proxy (strips /api prefix)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// FIX: Added 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// FIX: Added global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

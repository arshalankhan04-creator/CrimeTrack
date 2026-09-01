const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const firRoutes = require('./routes/firRoutes');
const caseRoutes = require('./routes/caseRoutes');
const crimeRoutes = require('./routes/crimeRoutes');
const criminalRoutes = require('./routes/criminalRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// CORS Configuration
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Base Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/firs', firRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/crimes', crimeRoutes);
app.use('/api/criminals', criminalRoutes);

// Fallback for 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

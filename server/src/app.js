const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
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

// Fallback for 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const proxyRoutes = require('./routes/proxyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend dev server
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Ascendix API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api', proxyRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Gateway Unhandled Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Gateway Error',
    message: err.message,
  });
});

// Boot Gateway server
async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Ascendix Express Gateway running on port ${PORT}`);
      console.log(` Routing authenticated requests to Django at: ${process.env.DJANGO_URL || 'http://127.0.0.1:8000'}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start Gateway server:', error.message);
    process.exit(1);
  }
}

startServer();

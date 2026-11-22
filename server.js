/**
 * ============================================================================
 * CampusConnect - Full Stack Node & Express Server
 * Author: Senior Full Stack Developer (for Chaitanya Aggarwal)
 * Parameters Addressed:
 *   1. Fetching and showing data via External APIs calls (Weather, Quotes, Holidays)
 *   2. Node and Express setup (Configuration, Middleware, Static files, Graceful shutdown)
 *   3. Express APIs creation to save/fetch data to local JSON files (/api/local/*)
 *   4. CRUD operations using Express APIs to manage data in MongoDB (/api/events, /api/registrations, /api/clubs)
 * ============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Internal Config & Middlewares
const { connectDB, isMongoConnected } = require('./backend/config/db');
const requestLogger = require('./backend/middleware/logger');
const { errorHandler, notFoundHandler } = require('./backend/middleware/errorHandler');

// Route Handlers
const externalRoutes = require('./backend/routes/externalRoutes');
const jsonRoutes = require('./backend/routes/jsonRoutes');
const eventRoutes = require('./backend/routes/eventRoutes');
const registrationRoutes = require('./backend/routes/registrationRoutes');
const clubRoutes = require('./backend/routes/clubRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ----------------------------------------------------
// 1. Core Express Middleware Configuration
// ----------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(requestLogger);

// ----------------------------------------------------
// 2. Static File Serving (Frontend & API Documentation)
// ----------------------------------------------------
// Serve workspace root for all HTML pages and styles
app.use(express.static(path.join(__dirname)));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Root route redirect to home index
app.get('/', (req, res) => {
  const rootIndex = path.join(__dirname, 'index.html');
  const subIndex = path.join(__dirname, 'index', 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  } else if (fs.existsSync(subIndex)) {
    return res.sendFile(subIndex);
  }
  res.status(200).json({ message: 'CampusConnect API Server is running' });
});

// Interactive API Documentation and Testing Hub
app.get('/api-docs', (req, res) => {
  const docsPath = path.join(__dirname, 'public', 'api-docs.html');
  if (fs.existsSync(docsPath)) {
    return res.sendFile(docsPath);
  }
  res.status(200).send('<h1>CampusConnect API Hub</h1><p>Documentation page initializing...</p>');
});

// ----------------------------------------------------
// 3. API Health & System Status Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    application: 'CampusConnect Full-Stack API Hub',
    environment: NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    parameters: {
      parameter1_externalApis: 'Operational (/api/external/weather, /api/external/quote, /api/external/holidays)',
      parameter2_nodeExpressSetup: 'Operational (Port ' + PORT + ')',
      parameter3_localJsonStorage: 'Operational (/api/local/events, /api/local/registrations, /api/local/clubs, /api/local/feedback)',
      parameter4_mongoDbCrud: isMongoConnected() ? 'Connected & Operational (MongoDB Live ODM)' : 'Offline / Local JSON Fallback Active'
    },
    database: {
      provider: isMongoConnected() ? 'MongoDB (Live ODM)' : 'Local JSON File Storage (Resilient Fallback Mode)',
      isConnected: isMongoConnected()
    }
  });
});

// ----------------------------------------------------
// 4. API Route Registrations
// ----------------------------------------------------

// Parameter 1: External APIs Integration
app.use('/api/external', externalRoutes);

// Parameter 3: Local JSON File Storage APIs
app.use('/api/local', jsonRoutes);

// Parameter 4: MongoDB CRUD Operations (with automated resilient fallback)
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/clubs', clubRoutes);

// ----------------------------------------------------
// 5. Error Handling Middlewares
// ----------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// ----------------------------------------------------
// 6. Server Initialization & Graceful Shutdown
// ----------------------------------------------------
let server;

async function startServer() {
  // Connect to Database (with non-blocking fallback if offline)
  await connectDB();

  server = app.listen(PORT, () => {
    console.log('================================================================');
    console.log(`⚡ CampusConnect Server running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`🌐 Local Application URL:  http://localhost:${PORT}`);
    console.log(`📖 Interactive API Docs:   http://localhost:${PORT}/api-docs`);
    console.log(`🩺 Health & Diagnostic:   http://localhost:${PORT}/api/health`);
    console.log('================================================================');
  });
}

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Gracefully shutting down...');
  if (server) {
    server.close(() => {
      console.log('[Server] Process terminated cleanly.');
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT (Ctrl+C) received. Closing connections...');
  if (server) {
    server.close(() => {
      console.log('[Server] Server closed cleanly.');
      process.exit(0);
    });
  }
});

// Start the server
startServer();

module.exports = app;

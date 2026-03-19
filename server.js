const express = require('express');
const morgan = require('morgan');
const config = require('./config/env');

const app = express();
const PORT = config.port;

// Middleware
app.use(express.json());
app.use(morgan('combined'));

// Trust proxy setting (important for correct IP in production)
app.set('trust proxy', config.trustProxy);

// Basic route with environment info
app.get('/', (req, res) => {
  res.json({
    message: 'IP Rate Limiting Testbed API',
    environment: config.nodeEnv,
    clientIp: req.ip,
    trustProxy: config.trustProxy
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`Trust proxy: ${config.trustProxy}`);
  console.log(`Rate limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs}ms`);
});
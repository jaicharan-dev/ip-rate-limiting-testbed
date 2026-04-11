const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

// Log file path
const logFilePath = path.join(__dirname, '../logs/access.log');

// Clear log file at server start
fs.writeFileSync(logFilePath, '');
console.log('Log file cleared for new run');

// Rate limiter — updated for NAT simulation
// Rate limiter — updated for Dynamic NAT simulation
const limiter = rateLimit({
  windowMs: 60 * 1000, // 60 second window
  
  // DYNAMIC LIMIT: Read the requested limit from the simulation's headers
  max: (req, res) => {
    const requestedLimit = parseInt(req.headers['x-test-limit']);
    return requestedLimit || 60; // Fallback to 60 if header is missing
  },
  
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    const log = {
      timestamp: new Date().toISOString(),
      scenario: req.headers['x-scenario'] || "nat",
      attackType: req.headers['x-attack-type'] || "normal",
      ip: req.ip,
      limitApplied: req.headers['x-test-limit'] || 60, // Log what limit was used
      userId: req.headers['x-user-id'] || "unknown",
      userType: req.headers['x-user-type'] || "unknown",
      rateLimited: true
    };

    console.log(`[BLOCKED] User: ${log.userId} | Limit applied: ${log.limitApplied}`);
    fs.appendFileSync(logFilePath, JSON.stringify(log) + '\n');

    res.status(429).json({ message: "Too many requests" });
  }
});
// Test route
app.get('/test', limiter, (req, res) => {
  const log = {
    timestamp: new Date().toISOString(),
    scenario: req.headers['x-scenario'] || "nat",
    attackType: req.headers['x-attack-type'] || "normal",
    ip: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'] || null,
    method: req.method,
    endpoint: req.originalUrl,
    userId: req.headers['x-user-id'] || "unknown",
    userType: req.headers['x-user-type'] || "unknown",
    rateLimited: false
  };

  console.log("ALLOWED:", JSON.stringify(log));
  fs.appendFileSync(logFilePath, JSON.stringify(log) + '\n');

  res.json({
    message: "Request successful",
    data: log
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dynamic rate limit enabled`);
  console.log(`Logging to: ${logFilePath}`);
});
const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit'); 
const app = express();
const PORT = 3000;

//  log file path
const logFilePath = path.join(__dirname, '../logs/access.log');

//  limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    const log = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      xForwardedFor: req.headers['x-forwarded-for'] || null,
      method: req.method,
      endpoint: req.originalUrl,
      rateLimited: true
    };

    // log to console
    console.log("RATE LIMITED:", JSON.stringify(log, null, 2));

    // save to file
    fs.appendFileSync(logFilePath, JSON.stringify(log) + '\n');

    res.status(429).json({
      message: "Too many requests, please try again later."
    });
  }
});

//  route 
app.get('/test', limiter, (req, res) => {
  const log = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'] || null,
    method: req.method,
    endpoint: req.originalUrl,
    rateLimited: false
  };

  console.log(JSON.stringify(log, null, 2));
  fs.appendFileSync(logFilePath, JSON.stringify(log) + '\n');

  res.json({
    message: "Test endpoint working",
    data: log
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit'); 

const app = express();
const PORT = 3000;

// log file path
const logFilePath = path.join(__dirname, '../logs/access.log');

// limiter 
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// route 
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
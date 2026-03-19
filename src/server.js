const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '../logs/access.log');
const express = require('express');
const app = express();
const PORT = 3000;

// Test endpoint
app.get('/test', (req, res) => {
  const log = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'] || null,
    method: req.method,
    endpoint: req.originalUrl,
    rateLimited: false
  };

  // Console log
  console.log(JSON.stringify(log, null, 2));
  
  console.log("Writing to:", logFilePath);
  // Write to file (append)
  fs.appendFileSync(logFilePath, JSON.stringify(log) + '\n');

  res.json({
    message: "Test endpoint working",
    data: log
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
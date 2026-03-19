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
    rateLimited: false // placeholder (we’ll use this later)
  };

  console.log(JSON.stringify(log, null, 2));

  res.json({
    message: "Test endpoint working",
    data: log
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
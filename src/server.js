const express = require('express');
const app = express();
const PORT = 3000;

// Test endpoint
app.get('/test', (req, res) => {
  const log = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'] || null
  };

  console.log(log);

  res.json({
    message: "Test endpoint working",
    data: log
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
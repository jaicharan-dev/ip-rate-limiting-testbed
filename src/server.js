const express = require('express');
const app = express();
const PORT = 3000;

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
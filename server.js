const express = require('express');
const morgan = require('morgan');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('combined')); // HTTP request logging

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'IP Rate Limiting Testbed API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
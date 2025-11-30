const express = require('express');
const { calculateSum, calculateProduct } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Home endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Sample Node.js App',
    version: '1.0.0',
    endpoints: ['/health', '/calculate/sum', '/calculate/product']
  });
});

// Calculate sum endpoint
app.post('/calculate/sum', (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({ error: 'Both a and b must be numbers' });
  }
  const result = calculateSum(a, b);
  res.json({ operation: 'sum', a, b, result });
});

// Calculate product endpoint
app.post('/calculate/product', (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({ error: 'Both a and b must be numbers' });
  }
  const result = calculateProduct(a, b);
  res.json({ operation: 'product', a, b, result });
});

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

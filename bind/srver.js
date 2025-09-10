const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const token = process.env.SEC1;

// Middleware
app.use(cors({
  origin: 'https://11tdlong.github.io'
}));
// Allow requests from GitHub Pages
app.use(express.json()); // Parse JSON bodies

// Safe token check
console.log('✅ GitHub token loaded:', !!token);

// Trigger GitHub Actions workflow
app.post('/trigger-workflow', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com/repos/11tdlong/repo1/actions/workflows/cypress.yml/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: 'main' })
    });

    if (response.ok) {
      res.send({ status: '✅ Workflow triggered successfully' });
    } else {
      const error = await response.text();
      console.error('❌ GitHub API error:', error);
      res.status(500).send({ error });
    }
  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

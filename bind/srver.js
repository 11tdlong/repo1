// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

app.post('/trigger-workflow', async (req, res) => {
  const response = await fetch('https://api.github.com/repos/11tdlong/repo1/actions/workflows/cypress.yml/dispatches', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer YOUR_GITHUB_PAT`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ref: 'main' })
  });

  if (response.ok) {
    res.send({ status: 'Workflow triggered' });
  } else {
    const error = await response.text();
    res.status(500).send({ error });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

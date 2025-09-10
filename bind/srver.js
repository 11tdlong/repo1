const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const stripAnsi = require('strip-ansi');
const unzipper = require('unzipper');

const app = express();
const token = process.env.SEC1;

// Middleware
app.use(cors({
  origin: 'https://11tdlong.github.io'
}));
app.use(express.json());

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

// Serve logs from GitHub artifact
app.get('/logs', async (req, res) => {
  try {
    const listRes = await fetch('https://api.github.com/repos/11tdlong/repo1/actions/artifacts', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const listData = await listRes.json();
    const artifact = listData.artifacts.find(a => a.name === 'cypress-logs');

    if (!artifact) {
      return res.send({ logs: '⚠️ No artifact named "cypress-logs" found.' });
    }

    const zipRes = await fetch(artifact.archive_download_url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const zipBuffer = await zipRes.buffer();
    const directory = await unzipper.Open.buffer(zipBuffer);
    const file = directory.files.find(f => f.path === 'output.txt');

    if (!file) {
      return res.send({ logs: '⚠️ output.txt not found in artifact.' });
    }

    const content = await file.buffer();
    const cleaned = stripAnsi(content.toString());

    res.send({ logs: cleaned });
  } catch (err) {
    console.error('❌ Error fetching logs:', err.message);
    res.status(500).send({ error: 'Failed to retrieve logs.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const stripAnsi = require('strip-ansi').default;
const unzipper = require('unzipper');

const app = express();
const token = process.env.SEC1;

// Middleware
app.use(cors({
  origin: 'https://11tdlong.github.io'
}));
app.use(express.json());

console.log('✅ GitHub token loaded:', !!token);

// 🔧 Trigger GitHub Actions workflow
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

// 🔧 Trigger Robot Tests workflow
app.post('/trigger-robot-tests', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com/repos/11tdlong/repo1/actions/workflows/robot.yml/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ref: 'main' })
    });

    if (response.ok) {
      res.send({ status: '✅ Robot Tests workflow triggered successfully' });
    } else {
      const error = await response.text();
      console.error('❌ GitHub API error (Robot Tests):', error);
      res.status(500).send({ error });
    }
  } catch (err) {
    console.error('❌ Server error (Robot Tests):', err.message);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// 🔍 Serve logs from GitHub artifact
app.get('/logs/cypress', async (req, res) => {
  await fetchAndSendArtifactLogs('cypress-logs', res);
});

app.get('/logs/robot', async (req, res) => {
  await fetchAndSendArtifactLogs('robot-logs', res);
});

async function fetchAndSendArtifactLogs(artifactName, res) {
  try {
    const listRes = await fetch('https://api.github.com/repos/11tdlong/repo1/actions/artifacts', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const listData = await listRes.json();
    const artifact = listData.artifacts.find(a => a.name === artifactName);

    if (!artifact) {
      return res.send({ logs: `⚠️ No artifact named "${artifactName}" found.` });
    }

    const zipRes = await fetch(artifact.archive_download_url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const zipBuffer = await zipRes.buffer();
    const directory = await unzipper.Open.buffer(zipBuffer);

    const targetFile =
      artifactName === 'robot-logs'
        ? directory.files.find(f => f.path === 'log.html')
        : directory.files.find(f => f.path === 'output.txt');

    if (!targetFile) {
      return res.send({ logs: `⚠️ Expected file not found in "${artifactName}".` });
    }

    const content = await targetFile.buffer();
    const cleaned = stripAnsi(content.toString());

    res.send({ logs: cleaned });
  } catch (err) {
    console.error(`❌ Error fetching logs for ${artifactName}:`, err.message);
    res.status(500).send({ error: `Failed to retrieve logs for ${artifactName}.` });
  }
}

// 🆕 FireAnt proxy route to bypass CORS
app.get('/fireant/:code', async (req, res) => {
  const code = req.params.code;

  try {
    const tokenRes = await fetch(`https://fireant.vn/ma-chung-khoan/${code}`);
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.accessToken;

    if (!accessToken) {
      return res.status(400).send({ error: 'No accessToken found in response.' });
    }

    const quotesRes = await fetch(`https://restv2.fireant.vn/symbols/${code}/historical-quotes?startDate=2022-08-08&endDate=2025-12-12&offset=0&limit=30`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const quotesData = await quotesRes.json();
    res.send({ quotes: quotesData });
  } catch (err) {
    console.error('❌ FireAnt error:', err.message);
    res.status(500).send({ error: 'Failed to fetch FireAnt data.' });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

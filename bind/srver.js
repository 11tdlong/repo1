const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const stripAnsi = require('strip-ansi').default;
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');

const app = express();
const token = process.env.SEC1;

// ✅ Middleware
app.use(cors({
  origin: 'https://11tdlong.github.io'
}));
app.use(express.json());

console.log('✅ GitHub token loaded:', !!token);

// ✅ Health check route
app.get('/ping', (req, res) => {
  res.send({ status: '✅ Backend is alive' });
});

// ✅ Trigger GitHub Actions workflow
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

// ✅ Trigger Robot Tests workflow
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

// ✅ Serve logs from GitHub artifact
app.get('/logs/cypress', async (req, res) => {
  await fetchAndSendArtifactLogs('cypress-logs', res);
});

app.get('/logs/robot', async (req, res) => {
  try {
    const xmlUrl = 'https://raw.githubusercontent.com/11tdlong/repo1/main/tmp/output.xml';
    const xmlResponse = await fetch(xmlUrl);

    if (!xmlResponse.ok) {
      throw new Error(`Failed to fetch output.xml: ${xmlResponse.statusText}`);
    }

    const xmlData = await xmlResponse.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    const stats = result.robot.statistics[0].total[0].$;
    const summary = `Tests: ${stats.total}, Passed: ${stats.pass}, Failed: ${stats.fail}`;

    res.json({
      status: '✅ Robot Tests completed',
      summary,
      logUrl: 'https://11tdlong.github.io/repo1/tmp/log.html'
    });
  } catch (err) {
    console.error('❌ Error fetching/parsing output.xml:', err.message);
    res.status(500).json({ error: 'Failed to extract summary from output.xml' });
  }
});

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '');
}

async function fetchAndSendArtifactLogs(artifactName, res) {
  try {
    const safeName = sanitizeName(artifactName);
    const listRes = await fetch(`https://api.github.com/repos/11tdlong/repo1/actions/artifacts`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const listData = await listRes.json();
    const artifact = listData.artifacts.find(a => a.name === safeName);

    if (!artifact) {
      console.warn(`⚠️ Artifact "${safeName}" not found.`);
      return res.send({ logs: `⚠️ No artifact named "${safeName}" found.` });
    }

    const zipRes = await fetch(artifact.archive_download_url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    const zipBuffer = await zipRes.buffer();
    const directory = await unzipper.Open.buffer(zipBuffer);

    const targetFile = directory.files.find(f =>
      f.path === 'log.html' || f.path === 'output.txt'
    );

    if (!targetFile) {
      return res.send({ logs: `⚠️ Expected file not found in "${safeName}".` });
    }

    const content = await targetFile.buffer();
    const cleaned = stripAnsi(content.toString());

    res.send({ logs: cleaned });
  } catch (err) {
    console.error(`❌ Error fetching logs for ${artifactName}:`, err.message);
    res.status(500).send({ error: `Failed to retrieve logs for ${artifactName}.` });
  }
}


// ✅ FireAnt proxy route with debug logging
app.get('/fireant/:code', async (req, res) => {
  const code = req.params.code;
  console.log(`🔍 Requesting token for: ${code}`);

  try {
    const tokenRes = await fetch(`https://fireant.vn/ma-chung-khoan/${code}`);
    const html = await tokenRes.text();

    // ✅ Extract JSON from <script id="__NEXT_DATA__" type="application/json">
    const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!scriptMatch || !scriptMatch[1]) {
      console.error('❌ __NEXT_DATA__ script not found');
      return res.status(500).send({ error: 'Failed to locate embedded token script.' });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(scriptMatch[1]);
    } catch (err) {
      console.error('❌ Failed to parse embedded JSON:', scriptMatch[1].slice(0, 300));
      return res.status(500).send({ error: 'Invalid embedded JSON in FireAnt response.' });
    }

    const accessToken = jsonData?.props?.pageProps?.initialState?.auth?.accessToken;
    if (!accessToken) {
      console.error('❌ accessToken not found in parsed JSON:', jsonData);
      return res.status(400).send({ error: 'accessToken not found in FireAnt data.' });
    }

    console.log(`🔑 Extracted accessToken: ${accessToken}`);

    // ✅ Fetch historical quotes using the token
    const quotesRes = await fetch(`https://restv2.fireant.vn/symbols/${code}/historical-quotes?startDate=2022-08-08&endDate=2025-12-12&offset=0&limit=30`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const quotesText = await quotesRes.text();

    let quotesData;
    try {
      quotesData = JSON.parse(quotesText);
    } catch (err) {
      console.error('❌ Failed to parse quotes response:', quotesText.slice(0, 300));
      return res.status(500).send({ error: 'Invalid quotes response from FireAnt.' });
    }

    console.log(`📊 Quotes received for ${code}:`, quotesData);
    res.send({ quotes: quotesData });
  } catch (err) {
    console.error('❌ FireAnt error:', err.message);
    res.status(500).send({ error: 'Failed to fetch FireAnt data.' });
  }
});



// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

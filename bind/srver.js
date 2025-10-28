const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const stripAnsi = require('strip-ansi').default;
const unzipper = require('unzipper');
const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');
const { exec } = require('child_process');

const app = express();
const token = process.env.SEC1;

app.use(cors({ origin: 'https://11tdlong.github.io' }));
app.options('*', cors({ origin: 'https://11tdlong.github.io' }));
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send({ status: '✅ Backend is alive' });
});

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
	  res.setHeader('Access-Control-Allow-Origin', 'https://11tdlong.github.io');
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

app.post('/trigger-robot-tests', async (req, res) => {
  try {
	  res.setHeader('Access-Control-Allow-Origin', 'https://11tdlong.github.io');
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

app.get('/logs/cypress', async (req, res) => {
  await fetchAndSendArtifactLogs('cypress-logs', res);
});

app.get('/logs/robot', async (req, res) => {
  res.json({
    status: '✅ Robot Tests completed',
    message: 'Click below to view detailed logs',
    logUrl: 'https://11tdlong.github.io/repo1/tmp/log.html'
  });
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

  app.get('/fireant/:code', async (req, res) => {
  const code = req.params.code;
  const userAgent = 'curl/7.79.1';
  const corsOrigin = 'https://11tdlong.github.io';

  res.setHeader('Access-Control-Allow-Origin', corsOrigin);

  try {
    // Initial request to FireAnt
    const initialRes = await fetch(`https://fireant.vn/ma-chung-khoan/${code}`, {
      headers: { 'User-Agent': userAgent }
    });
    let html = await initialRes.text();

    // 🔁 Detect and follow JS redirect
    const redirectMatch = html.match(/window\.location\.href\s*=\s*"([^"]+)"/);
    if (redirectMatch && redirectMatch[1]) {
      const redirectedUrl = redirectMatch[1];
      console.log(`🔁 Following redirect to: ${redirectedUrl}`);

      const redirectedRes = await fetch(redirectedUrl, {
        headers: { 'User-Agent': userAgent }
      });
      html = await redirectedRes.text();
    }

    // 🔍 Extract embedded __NEXT_DATA__ script
    const scriptMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/);
    if (!scriptMatch || !scriptMatch[1]) {
      const debugPath = path.join(__dirname, 'fireant_debug.html');
      fs.writeFileSync(debugPath, html);

      const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      console.error('\n==> ///////////////////////////////////////////////////////////');
      console.error('❌ __NEXT_DATA__ script not found — HTML saved to fireant_debug.html');
      console.error(`📄 Found ${scriptTags.length} <script> tags. Here's a preview:`);

      scriptTags.forEach((tag, i) => {
        if (tag.includes('__NEXT_DATA__') || i < 3) {
          console.error(`🔍 Script ${i + 1}:\n${tag.slice(0, 300)}\n`);
        }
      });

      console.error('==> ///////////////////////////////////////////////////////////\n');
      return res.status(500).send({ error: 'Failed to locate embedded token script. Debug file saved.' });
    }

    // 🧠 Parse embedded JSON
    let jsonData;
    try {
      jsonData = JSON.parse(scriptMatch[1]);
    } catch (err) {
      console.error('❌ Failed to parse embedded JSON:', scriptMatch[1].slice(0, 300));
      return res.status(500).send({ error: 'Invalid embedded JSON in FireAnt response.' });
    }

    // 🔐 Extract access token
    const accessToken = jsonData?.props?.pageProps?.initialState?.auth?.accessToken;
    if (!accessToken) {
      console.error('❌ accessToken not found in parsed JSON:', jsonData);
      return res.status(400).send({ error: 'accessToken not found in FireAnt data.' });
    }

    // 📈 Fetch historical quotes
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

    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.send({ quotes: quotesData });
  } catch (err) {
    console.error('❌ FireAnt error:', err.message);
    res.status(500).send({ error: 'Failed to fetch FireAnt data.' });
  }
});

const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/quotes/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol;
  const symbol = rawSymbol.replace(/[^a-zA-Z0-9]/g, '');
  const url = `https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN`;

  console.log('📥 Incoming symbol:', rawSymbol);
  console.log('🔒 Sanitized symbol:', symbol);
  console.log('🌐 Fetching from:', url);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      const html = await response.text();
      console.error('❌ Non-JSON response:', html.slice(0, 300));
      return res.status(response.status).send({ error: 'Non-JSON response from SSI API.' });
    }

    const data = await response.json();

    const bid = {};
    const bidVol = {};
    const offer = {};
    const offerVol = {};

    Object.entries(data).forEach(([key, value]) => {
      const bidMatch = key.match(/^best(\d+)Bid$/);
      const bidVolMatch = key.match(/^best(\d+)BidVol$/);
      const offerMatch = key.match(/^best(\d+)Offer$/);
      const offerVolMatch = key.match(/^best(\d+)OfferVol$/);

      if (bidMatch) bid[bidMatch[1]] = value;
      if (bidVolMatch) bidVol[bidVolMatch[1]] = value;
      if (offerMatch) offer[offerMatch[1]] = value;
      if (offerVolMatch) offerVol[offerVolMatch[1]] = value;
    });

    let formatted = 'Bid       Vol       Offer     Vol\n';
    for (let i = 1; i <= 10; i++) {
      const b = bid[i] ?? '—';
      const bv = bidVol[i] ?? '—';
      const o = offer[i] ?? '—';
      const ov = offerVol[i] ?? '—';
      formatted += `${b.padEnd(10)}${bv.padEnd(10)} ${o.padEnd(10)}${ov.padEnd(10)}\n`;
    }

    res.setHeader('Access-Control-Allow-Origin', 'https://11tdlong.github.io');
    res.type('text/plain').send(formatted);
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    res.status(500).send({ error: 'Failed to fetch stock data.' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

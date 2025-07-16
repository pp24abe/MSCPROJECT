import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin || // allow requests without origin (like curl/Postman)
        origin === 'http://localhost:3000' || // optional if you use this for dev React frontend
        origin.startsWith('vscode-webview://') // allow VS Code Webview origin
      ) {
        callback(null, true);
      } else {
        callback(new Error(`❌ Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json()); // ✅ To parse JSON bodies

// --- GitHub OAuth Routes ---
app.get('/auth/github', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const redirect_uri = `${process.env.BACKEND_URL}/auth/github/callback`;

  const authorizeUrl =
    `https://github.com/login/oauth/authorize?client_id=${client_id}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&scope=repo`;
  res.redirect(authorizeUrl);
});

app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing "code" query parameter.');

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.BACKEND_URL}/auth/github/callback`,
      },
      { headers: { Accept: 'application/json' } }
    );

    if (tokenResponse.data.error) {
      return res
        .status(400)
        .send(tokenResponse.data.error_description || 'OAuth error');
    }

    const accessToken = tokenResponse.data.access_token;
    const vscodeUri = `vscode://ppp.code-generator-vscode/auth?github_token=${encodeURIComponent(accessToken)}`;
    return res.redirect(vscodeUri);
  } catch (err) {
    console.error('Error exchanging code for token:', err.response?.data || err.message);
    return res.status(500).send('OAuth exchange failed');
  }
});
// ✅ New Route: Deploy HTML to GitHub Pages
app.post('/deployForm', async (req, res) => {
  const { token, owner, repo, htmlContent } = req.body;

  if (!token || !owner || !repo || !htmlContent) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const content = Buffer.from(htmlContent).toString('base64');

  try {
    // Check if gh-pages branch exists
    const branches = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: { Authorization: `token ${token}` },
    });

    const ghPagesExists = branches.data.some((b) => b.name === 'gh-pages');
    if (!ghPagesExists) {
      const mainSha = branches.data.find((b) => b.name === 'main' || b.name === 'master')?.commit.sha;
      if (!mainSha) throw new Error('No base branch to create gh-pages from.');
      await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          ref: 'refs/heads/gh-pages',
          sha: mainSha,
        },
        {
          headers: { Authorization: `token ${token}` },
        }
      );
    }

    // Check if index.html exists
    let sha;
    try {
      const fileRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/index.html?ref=gh-pages`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      sha = fileRes.data.sha;
    } catch {
      sha = undefined;
    }

    // Upload (or update) index.html
    await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/index.html`,
      {
        message: '🚀 Deploy form to GitHub Pages',
        content,
        branch: 'gh-pages',
        ...(sha ? { sha } : {}),
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const deployedURL = `https://${owner}.github.io/${repo}/`;
    return res.json({ success: true, url: deployedURL });
  } catch (err) {
    console.error('GitHub Deploy Error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'GitHub Deploy Failed', details: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('GitHub OAuth + Form Deploy backend is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening at http://localhost:${PORT}`);
});

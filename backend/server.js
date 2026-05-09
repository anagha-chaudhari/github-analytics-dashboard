const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
console.log("CLIENT_ID:", process.env.GITHUB_CLIENT_ID);
console.log("SECRET exists:", !!process.env.GITHUB_CLIENT_SECRET);

// Create app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// OAuth callback route
app.post("/auth/github/callback", async (req, res) => {
  const { code } = req.body;
  console.log("Received code from frontend : ", code);
  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    // exchange code for access token
    console.log("Exchanging code...");

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Github Response: ", tokenResponse.data);

    res.json({
      success: true,
      access_token: tokenResponse.data.access_token,
    });
  } catch (error) {
    console.error("❌ Full error:", error);
    console.error("❌ Error response:", error.response?.data);
    console.error("❌ Error status:", error.response?.status);

    res.status(500).json({
      error: "Failed to exchange code",
      details: error.response?.data,
    });
  }
});

// Get GitHub user data
app.get("/api/github/user", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  console.log("📨 Received request for user data");
  console.log("🔑 Token:", token ? token.substring(0, 10) + "..." : "Missing");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    console.log("✅ GitHub user data:", response.data.login);

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching user:", error.response?.data);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Get user's repositories
app.get('/api/github/repos', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('🔄 Fetching repositories...');

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        sort: 'updated',
        per_page: 10, // Get 10 most recent repos
      },
    });

    console.log(`✅ Found ${response.data.length} repositories`);

    // Send simplified data
    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      updated_at: repo.updated_at,
    }));

    res.json(repos);

  } catch (error) {
    console.error('❌ Error fetching repos:', error.response?.data);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get commit activity for a specific repo
app.get('/api/github/commits/:owner/:repo', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { owner, repo } = req.params;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log(`🔄 Fetching commits for ${owner}/${repo}...`);

    // Get last 30 commits
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          per_page: 30,
        },
      }
    );

    console.log(`✅ Found ${response.data.length} commits`);

    // Group commits by date
    const commitsByDate = {};
    
    response.data.forEach(commit => {
      const date = commit.commit.author.date.split('T')[0]; // Get just the date (YYYY-MM-DD)
      commitsByDate[date] = (commitsByDate[date] || 0) + 1;
    });

    // Convert to array format for charts
    const chartData = Object.keys(commitsByDate)
      .sort()
      .map(date => ({
        date,
        commits: commitsByDate[date],
      }));

    res.json(chartData);

  } catch (error) {
    console.error('❌ Error fetching commits:', error.response?.data);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
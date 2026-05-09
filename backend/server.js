const express = require('express');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');
require("dotenv").config();
const app = express();

//startup-validation

const REQUIRED_ENV = ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "SESSION_SECRET"];
const missing = REQUIRED_ENV.filter(env => !process.env[env]);

if(missing.length){
  console.error(`Missing required environment variables: ${missing.join(", ")}.Exiting`);
  process.exit(1);
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, 
  })
);
 
app.use(express.json());
 
//session middleware

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, //prevents js from reading the cookie          
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", //reduces cross-site request forgery
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
);

//regex-based validation for ensuring only safe github repository identifiers are accepted before api requests.

const SAFE_PARAM = /^[a-zA-Z0-9_.-]+$/;
function validateRepoParams(req, res) {
  const { owner, repo } = req.params;
  if (!SAFE_PARAM.test(owner) || !SAFE_PARAM.test(repo)) {
    res.status(400).json({ error: "Invalid owner or repo name" });
    return false;
  }
  return true;
}

// error handling for github api interactions

function handleGitHubError(error, res) {
  const status = error.response?.status || 500;
  const remaining = error.response?.headers?.["x-ratelimit-remaining"];
  const resetTime = error.response?.headers?.["x-ratelimit-reset"];
 
  if (status === 403 && remaining === "0") {
    const resetDate = resetTime
      ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString()
      : "~1 hour";
    return res.status(429).json({
      error: "GitHub API rate limit reached",
      message: `Resets at ${resetDate}`,
    });
  }
 
  if (status === 401) {
    return res.status(401).json({ error: "GitHub token expired or invalid" });
  }
 
  if (status === 404) {
    return res.status(404).json({ error: "Repository not found" });
  }
 
  console.error("GitHub API error:", error.response?.data?.message || error.message);
  return res.status(500).json({
    error: "GitHub API error",
    message: error.response?.data?.message || "Unknown error",
  });
}

function requireAuth(req, res) {
  const token = req.session?.githubToken;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return token;
}
 
// shared github api headers

const githubHeaders = (token) => ({
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
});

// route

app.get("/", (_req, res) => {
  res.json({ message: "DevPulse API running", version: "2.0.0" });
});

// auth

app.post("/auth/github/callback", async (req, res) => {
  const { code } = req.body;
 
  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }
 
  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
 
    const accessToken = tokenResponse.data.access_token;
 
    if (!accessToken) {
      return res.status(400).json({
        error: "GitHub did not return a token",
        detail: tokenResponse.data.error_description || "Invalid or expired code",
      });
    }
 
    // Store token in server-side session — never sent to client
    req.session.githubToken = accessToken;
 
    return res.json({ success: true });
  } catch (error) {
    console.error("OAuth exchange error:", error.message);
    return res.status(500).json({ error: "Failed to exchange code for token" });
  }
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

app.get("/auth/status", (req, res) => {
  res.json({ authenticated: !!req.session?.githubToken });
});

app.get("/api/github/user", async (req, res) => {
  const token = requireAuth(req, res);
  if (!token) return;
 
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: githubHeaders(token),
    });
    res.json(response.data);
  } catch (error) {
    handleGitHubError(error, res);
  }
});

app.get("/api/github/repos", async (req, res) => {
  const token = requireAuth(req, res);
  if (!token) return;
 
  const perPage = Math.min(parseInt(req.query.per_page) || 20, 100);
 
  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: githubHeaders(token),
      params: {
        sort: "updated",
        per_page: perPage,
        affiliation: "owner,collaborator",
      },
    });
 
    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      visibility: repo.visibility,
      is_fork: repo.fork,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
    }));
     res.set("X-RateLimit-Remaining", response.headers["x-ratelimit-remaining"]);
    res.set("X-RateLimit-Reset", response.headers["x-ratelimit-reset"]);
 
    res.json(repos);
  } catch (error) {
    handleGitHubError(error, res);
  }
});

app.get("/api/github/commits/:owner/:repo", async (req, res) => {
  const token = requireAuth(req, res);
  if (!token) return;
  if (!validateRepoParams(req, res)) return;
 
  const { owner, repo } = req.params;
  const perPage = Math.min(parseInt(req.query.per_page) || 100, 100);
 
  // Default: last 90 days
  const since =
    req.query.since ||
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
 
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: githubHeaders(token),
        params: { per_page: perPage, since },
      }
    );
 
    // Group commits by date
    const commitsByDate = {};
    response.data.forEach((commit) => {
      const date = commit.commit.author.date.split("T")[0];
      commitsByDate[date] = (commitsByDate[date] || 0) + 1;
    });
 
    const chartData = Object.keys(commitsByDate)
      .sort()
      .map((date) => ({ date, commits: commitsByDate[date] }));
 
    res.json({
      repo: `${owner}/${repo}`,
      total_commits: response.data.length,
      since,
      chart_data: chartData,
    });
  } catch (error) {
    handleGitHubError(error, res);
  }
});

app.get("/api/github/prs/:owner/:repo", async (req, res) => {
  const token = requireAuth(req, res);
  if (!token) return;
  if (!validateRepoParams(req, res)) return;
 
  const { owner, repo } = req.params;
 
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: githubHeaders(token),
        params: { state: "all", per_page: 50, sort: "updated", direction: "desc" },
      }
    );
 
    const prs = response.data;
    const open = prs.filter((pr) => pr.state === "open");
    const closed = prs.filter((pr) => pr.state === "closed");
    const merged = closed.filter((pr) => pr.merged_at !== null);
 
    // Average cycle time: time from open to merge in hours
    const cycleTimes = merged
      .map((pr) => {
        const opened = new Date(pr.created_at);
        const mergedAt = new Date(pr.merged_at);
        return (mergedAt - opened) / (1000 * 60 * 60); // hours
      })
      .filter((h) => h > 0);
 
    const avgCycleTimeHours =
      cycleTimes.length > 0
        ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
        : 0;
 
    // Merge rate: merged / closed
    const mergeRate =
      closed.length > 0
        ? Math.round((merged.length / closed.length) * 100)
        : 0;
 
    // Recent PRs list for display
    const recentPRs = prs.slice(0, 10).map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.merged_at ? "merged" : pr.state,
      author: pr.user.login,
      created_at: pr.created_at,
      merged_at: pr.merged_at,
      closed_at: pr.closed_at,
    }));
 
    res.json({
      summary: {
        total: prs.length,
        open: open.length,
        merged: merged.length,
        closed_unmerged: closed.length - merged.length,
        merge_rate_percent: mergeRate,
        avg_cycle_time_hours: avgCycleTimeHours,
        avg_cycle_time_display:
          avgCycleTimeHours >= 24
            ? `${Math.round(avgCycleTimeHours / 24)}d`
            : `${avgCycleTimeHours}h`,
      },
      recent_prs: recentPRs,
    });
  } catch (error) {
    handleGitHubError(error, res);
  }
});

app.get("/api/github/contributors/:owner/:repo", async (req, res) => {
  const token = requireAuth(req, res);
  if (!token) return;
  if (!validateRepoParams(req, res)) return;
 
  const { owner, repo } = req.params;
 
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors`,
      {
        headers: githubHeaders(token),
        params: { per_page: 10 },
      }
    );
 
    const total = response.data.reduce((sum, c) => sum + c.contributions, 0);
 
    const contributors = response.data.map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      contributions: c.contributions,
      percentage: total > 0 ? Math.round((c.contributions / total) * 100) : 0,
      profile_url: c.html_url,
    }));
 
    res.json({ total_contributions: total, contributors });
  } catch (error) {
    handleGitHubError(error, res);
  }
});

app.get("/api/github/languages/:owner/:repo", async (req, res) => {
  const token = requireAuth(req, res);
  if (!token) return;
  if (!validateRepoParams(req, res)) return;
 
  const { owner, repo } = req.params;
 
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers: githubHeaders(token) }
    );
 
    const total = Object.values(response.data).reduce((a, b) => a + b, 0);
    const languages = Object.entries(response.data).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: total > 0 ? Math.round((bytes / total) * 100) : 0,
    }));
 
    res.json({ languages });
  } catch (error) {
    handleGitHubError(error, res);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`DevPulse API running on http://localhost:${PORT}`);
});
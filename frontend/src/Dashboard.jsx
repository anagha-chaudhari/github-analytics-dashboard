import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RepoList from "./components/RepoList";
import CommitChart from "./components/CommitChart";
import PRMetrics from "./components/PRMetrics";
import styles from "./Dashboard.module.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    // AbortController: if backend is down, stop after 8 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${API}/api/github/user`, {
        credentials: "include", // sends the httpOnly session cookie — no token in JS
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.status === 401) {
        // Session expired or never created — redirect to login
        navigate("/");
        return;
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      clearTimeout(timeout);

      if (err.name === "AbortError") {
        setError("Request timed out. Is the backend running?");
      } else {
        setError("Failed to load your profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/");
    }
  };

  const handleSelectRepo = (repo) => {
    setSelectedRepo(repo);
  };

  const statIcons = {
    repos: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
    followers: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    following: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
        <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M19 11v6" />
        <path d="M16 14h6" />
      </svg>
    ),
    gists: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6" />
        <path d="M10 13h4" />
        <path d="M10 17h4" />
      </svg>
    ),
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.centerScreen}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading your dashboard…</p>
      </div>
    );
  }

  // error state
  if (error) {
    return (
      <div className={styles.centerScreen}>
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Something went wrong</p>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchUserData} className={styles.retryButton}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  // dashboard view
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19h16" />
                <path d="M4 14h10" />
                <path d="M4 9h16" />
                <path d="M4 4h6" />
              </svg>
            </span>
            <span className={styles.logoText}>DevPulse</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17H3a2 2 0 01-2-2V3a2 2 0 012-2h4M12 13l5-5-5-5M17 8H7" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        {/* Profile card */}
        <section className={styles.profileCard} aria-label="GitHub profile">
          <div className={styles.profileHeader}>
            {userData?.avatar_url && (
              <img
                src={userData.avatar_url}
                alt={`${userData.login}'s avatar`}
                className={styles.avatar}
              />
            )}
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>
                {userData?.name || userData?.login}
              </h1>
              {userData?.bio && (
                <p className={styles.profileBio}>{userData.bio}</p>
              )}
              {userData?.location && (
                <p className={styles.profileMeta}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ marginRight: "6px", verticalAlign: "middle" }}
                  >
                    <path d="M12 21s-6-5.333-6-10a6 6 0 1112 0c0 4.667-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                  {userData.location}
                </p>
              )}
            </div>
          </div>

          <div className={styles.statsGrid}>
            <StatCard icon={statIcons.repos} value={userData?.public_repos ?? 0} label="Repositories" />
            <StatCard icon={statIcons.followers} value={userData?.followers ?? 0} label="Followers" />
            <StatCard icon={statIcons.following} value={userData?.following ?? 0} label="Following" />
            <StatCard icon={statIcons.gists} value={userData?.public_gists ?? 0} label="Gists" />
          </div>
        </section>

        {/* Repo list + charts */}
        <div className={styles.contentGrid}>
          <RepoList onSelectRepo={handleSelectRepo} selectedRepo={selectedRepo} />

          <div className={styles.chartsColumn}>
            {selectedRepo ? (
              <>
                <CommitChart repo={selectedRepo} />
                <PRMetrics repo={selectedRepo} />
              </>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>Select a repository</p>
                <p className={styles.emptyDesc}>
                  Choose a repo from the list to see commit activity, PR metrics,
                  and contributor stats.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// reusable stat card component
function StatCard({ icon, value, label }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon} aria-hidden="true">{icon}</span>
      <div>
        <p className={styles.statValue}>{value.toLocaleString()}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RepoList from "./components/RepoList";
import CommitChart from "./components/CommitChart";

function Dashboard() {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const savedToken = localStorage.getItem("github_token");

      if (!savedToken) {
        navigate("/");
        return;
      }

      setToken(savedToken);

      try {
        console.log("📄 Fetching GitHub user data...");

        const response = await fetch("http://localhost:3001/api/github/user", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log("✅ User data:", data);
        setUserData(data);
      } catch (error) {
        console.error("❌ Error:", error);
        alert("Failed to fetch user data. Token might be invalid.");
        localStorage.removeItem("github_token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("github_token");
    navigate("/");
  };

  const handleSelectRepo = (repo) => {
    console.log("Selected repo:", repo);
    setSelectedRepo(repo);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>📊</div>
            <span style={styles.logoText}>DevMetrics</span>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17H3a2 2 0 01-2-2V3a2 2 0 012-2h4M12 13l5-5-5-5M17 8H7" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* User Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            {userData?.avatar_url && (
              <div style={styles.avatarWrapper}>
                <img
                  src={userData.avatar_url}
                  alt="Avatar"
                  style={styles.avatar}
                />
                <div style={styles.avatarGlow}></div>
              </div>
            )}

            <div style={styles.profileInfo}>
              <h1 style={styles.profileName}>
                {userData?.name || userData?.login}
              </h1>
              {userData?.bio && <p style={styles.profileBio}>{userData.bio}</p>}
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📦</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>
                  {userData?.public_repos || 0}
                </div>
                <div style={styles.statLabel}>Repositories</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{userData?.followers || 0}</div>
                <div style={styles.statLabel}>Followers</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>⭐</div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>{userData?.following || 0}</div>
                <div style={styles.statLabel}>Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* Repositories & Charts */}
        <div style={styles.contentGrid}>
          <RepoList token={token} onSelectRepo={handleSelectRepo} />
          <CommitChart token={token} repo={selectedRepo} />
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
  },
  header: {
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(8px)",
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    fontSize: "28px",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "none",
    transition: "all 0.2s ease",
  },
  main: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 32px",
  },
  profileCard: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    padding: "40px",
    marginBottom: "32px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
    marginBottom: "40px",
    flexWrap: "wrap",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "24px",
    border: "3px solid var(--border-color)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
    position: "relative",
    zIndex: 1,
  },
  avatarGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "140px",
    height: "140px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    opacity: 0.2,
    filter: "blur(20px)",
    zIndex: 0,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "8px",
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  profileBio: {
    fontSize: "1.125rem",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    transition: "all 0.3s ease",
  },
  statIcon: {
    fontSize: "36px",
    filter: "grayscale(0.2)",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    lineHeight: "1",
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "var(--text-tertiary)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  contentGrid: {
    display: "grid",
    gap: "32px",
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "3px solid var(--border-color)",
    borderTopColor: "var(--accent-primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "1.125rem",
    color: "var(--text-secondary)",
  },
};

export default Dashboard;

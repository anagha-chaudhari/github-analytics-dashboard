function Home() {
  const handleConnectGitHub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

    console.log("Client ID:", clientId);

    if (!clientId) {
      alert("ERROR: CLIENT_ID not found! Check your .env file");
      return;
    }

    const redirectUri = "http://localhost:5173/callback";
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;

    console.log("Redirecting to:", githubAuthUrl);
    window.location.href = githubAuthUrl;
  };

  return (
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.bgGradient}></div>
      <div style={styles.bgGrid}></div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.badge}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ marginRight: "8px" }}
          >
            <path
              d="M8 0L9.854 5.473H15.708L10.927 8.854L12.781 14.327L8 10.946L3.219 14.327L5.073 8.854L0.292 5.473H6.146L8 0Z"
              fill="currentColor"
            />
          </svg>
          Developer Analytics Platform
        </div>

        <h1 style={styles.title}>
          Transform Your
          <br />
          <span style={styles.gradient}>GitHub Activity</span>
          <br />
          Into Insights
        </h1>

        <p style={styles.description}>
          Visualize your development journey with beautiful analytics. Track
          commits, monitor repositories, and understand your coding patterns.
        </p>

        <button onClick={handleConnectGitHub} style={styles.button}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{ marginRight: "10px" }}
          >
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.165 20 14.418 20 10c0-5.523-4.477-10-10-10z"
            />
          </svg>
          Connect with GitHub
        </button>

        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📊</div>
            <div style={styles.featureText}>Commit Analytics</div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🔍</div>
            <div style={styles.featureText}>Repository Insights</div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>⚡</div>
            <div style={styles.featureText}>Real-time Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "20px",
  },
  bgGradient: {
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
    animation: "pulse 8s ease-in-out infinite",
  },
  bgGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
    opacity: 0.5,
  },
  content: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    maxWidth: "800px",
    animation: "fadeIn 0.8s ease-out",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3b82f6",
    marginBottom: "32px",
  },
  title: {
    fontSize: "clamp(2.5rem, 6vw, 5rem)",
    fontWeight: "800",
    lineHeight: "1.1",
    letterSpacing: "-0.04em",
    marginBottom: "24px",
    color: "#ffffff",
  },
  gradient: {
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  description: {
    fontSize: "1.25rem",
    lineHeight: "1.8",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: "48px",
    maxWidth: "600px",
    margin: "0 auto 48px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    padding: "16px 36px",
    fontSize: "17px",
    fontWeight: "600",
    marginBottom: "64px",
  },
  features: {
    display: "flex",
    justifyContent: "center",
    gap: "48px",
    flexWrap: "wrap",
  },
  feature: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  featureIcon: {
    fontSize: "32px",
    filter: "grayscale(0.3)",
  },
  featureText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.6)",
    letterSpacing: "0.02em",
  },
};

export default Home;

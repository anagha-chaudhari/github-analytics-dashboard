import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Callback() {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Authenticating with GitHub...");
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      console.log("Code from URL:", code);

      if (!code) {
        setStatus("error");
        setMessage("No authorization code found");
        return;
      }

      try {
        setMessage("Exchanging code for access token...");

        const response = await fetch(
          "http://localhost:3001/auth/github/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          }
        );

        if (!response.ok) {
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          return;
        }

        const data = await response.json();
        console.log("Response from backend:", data);

        if (data.access_token) {
          localStorage.setItem("github_token", data.access_token);
          setStatus("success");
          setMessage("Authentication successful!");

          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else {
          setStatus("error");
          setMessage("No access token received");
        }
      } catch (error) {
        console.error("Error:", error);
        setStatus("error");
        setMessage("An error occurred during authentication");
      }
    };

    exchangeCodeForToken();
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === "processing" && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Processing</h2>
            <p style={styles.message}>{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#10b981"
                  strokeWidth="4"
                  fill="rgba(16, 185, 129, 0.1)"
                />
                <path
                  d="M20 32L28 40L44 24"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 style={styles.title}>Success!</h2>
            <p style={styles.message}>{message}</p>
            <p style={styles.subMessage}>Redirecting to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#ef4444"
                  strokeWidth="4"
                  fill="rgba(239, 68, 68, 0.1)"
                />
                <path
                  d="M24 24L40 40M40 24L24 40"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 style={styles.title}>Authentication Failed</h2>
            <p style={styles.message}>{message}</p>
            <button onClick={() => navigate("/")} style={styles.button}>
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-primary)",
    padding: "20px",
  },
  card: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "24px",
    padding: "64px 48px",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    animation: "fadeIn 0.5s ease-out",
  },
  spinner: {
    width: "64px",
    height: "64px",
    border: "4px solid var(--border-color)",
    borderTopColor: "var(--accent-primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 32px",
  },
  successIcon: {
    margin: "0 auto 32px",
    animation: "scaleIn 0.5s ease-out",
  },
  errorIcon: {
    margin: "0 auto 32px",
    animation: "shake 0.5s ease-out",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    marginBottom: "16px",
    letterSpacing: "-0.02em",
  },
  message: {
    fontSize: "1.125rem",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginBottom: "8px",
  },
  subMessage: {
    fontSize: "0.95rem",
    color: "var(--text-tertiary)",
    marginTop: "16px",
  },
  button: {
    marginTop: "32px",
    padding: "12px 28px",
  },
};

// Add keyframes via style tag
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes scaleIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Callback;

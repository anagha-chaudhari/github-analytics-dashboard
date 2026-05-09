import { useState, useEffect } from "react";

function RepoList({ onSelectRepo }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        console.log("🔄 Fetching repositories...");

        const response = await fetch(
          "http://localhost:3001/api/github/repos",
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }

        const data = await response.json();

        console.log("✅ Repositories:", data);

        setRepos(data);
      } catch (error) {
        console.error("❌ Error fetching repositories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        Loading repositories...
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📚 Your Repositories</h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {repos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => onSelectRepo(repo)}
            style={{
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#f0f0f0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "white")
            }
          >
            <h3 style={{ margin: "0 0 5px 0" }}>
              {repo.name}
            </h3>

            <p
              style={{
                margin: "5px 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              {repo.description || "No description"}
            </p>

            <div
              style={{
                fontSize: "12px",
                color: "#888",
              }}
            >
              {repo.language && (
                <>
                  <span>🔵 {repo.language}</span>
                  <span> • </span>
                </>
              )}

              <span>⭐ {repo.stars} stars</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RepoList;
import { useState, useEffect } from "react";

function RepoList({ onSelectRepo }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        console.log("Fetching repositories...");

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

        console.log("Repositories:", data);

        setRepos(data);
      } catch (error) {
        console.error("Error fetching repositories:", error);
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
      <h2 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
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
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9" />
        </svg>
        Your Repositories
      </h2>

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
            className="repoCard"
          >
            <h3 style={{ margin: "0 0 5px 0", color: "#333" }}>
              {repo.name}
            </h3>

            <p
              style={{
                margin: "5px 0",
                color: "#683fa5",
                fontSize: "14px",
              }}
            >
              {repo.description || "No description"}
            </p>

            <div className="repoMeta">
              {repo.language && (
                <>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 4h12" />
                      <path d="M5 12h14" />
                      <path d="M6 20h12" />
                    </svg>
                    {repo.language}
                  </span>
                  <span> • </span>
                </>
              )}

              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z" />
                </svg>
                {repo.stars} stars
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RepoList;
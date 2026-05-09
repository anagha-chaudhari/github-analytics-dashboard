import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CommitChart({ token, repo }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      if (!repo) return;

      setLoading(true);

      try {
        console.log(`🔄 Fetching commits for ${repo.full_name}...`);

        const response = await fetch(
          `http://localhost:3001/api/github/commits/${
            repo.full_name.split("/")[0]
          }/${repo.name}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch commits");
        }

        const data = await response.json();
        console.log("✅ Commit data:", data);
        setChartData(data);
      } catch (error) {
        console.error("❌ Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [token, repo]);

  if (!repo) {
    return (
      <div style={{ marginTop: "30px", textAlign: "center", color: "#666" }}>
        👆 Select a repository above to see commit activity
      </div>
    );
  }

  if (loading) {
    return <div style={{ marginTop: "30px" }}>Loading chart...</div>;
  }

  if (chartData.length === 0) {
    return (
      <div style={{ marginTop: "30px", textAlign: "center", color: "#666" }}>
        No commits found for {repo.name}
      </div>
    );
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>📈 Commit Activity: {repo.name}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="commits"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <p
        style={{
          textAlign: "center",
          color: "#666",
          fontSize: "14px",
          marginTop: "10px",
        }}
      >
        Showing last 30 commits
      </p>
    </div>
  );
}

export default CommitChart;

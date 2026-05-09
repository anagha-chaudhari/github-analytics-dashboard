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

function CommitChart({ repo }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      if (!repo) return;

      setLoading(true);

      try {
        const [owner] = repo.full_name.split("/");

        console.log(`🔄 Fetching commits for ${repo.full_name}...`);

        const response = await fetch(
          `http://localhost:3001/api/github/commits/${owner}/${repo.name}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch commits");
        }

        const data = await response.json();

        console.log("✅ Commit data:", data);

        // Backend returns:
        // {
        //   repo,
        //   total_commits,
        //   since,
        //   chart_data
        // }

        setChartData(data.chart_data || []);
      } catch (error) {
        console.error("❌ Error fetching commits:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [repo]);

  // No repository selected
  if (!repo) {
    return (
      <div style={{ marginTop: "30px", textAlign: "center", color: "#666" }}>
        👆 Select a repository above to see commit activity
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        Loading chart...
      </div>
    );
  }

  // Empty commits
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

          <YAxis allowDecimals={false} />

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
        Showing commit activity grouped by date
      </p>
    </div>
  );
}

export default CommitChart;
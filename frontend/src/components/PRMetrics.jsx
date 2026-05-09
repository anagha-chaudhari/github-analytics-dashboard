import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * PRMetrics — displays pull request analytics for a selected repo.
 * Shows: merge rate, avg cycle time, open/merged/closed counts, recent PR list.
 */
function PRMetrics({ repo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!repo) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    const [owner, repoName] = repo.full_name.split("/");

    fetch(`${API}/api/github/prs/${owner}/${repoName}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load PR metrics.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [repo]);

  if (!repo) return null;

  if (loading) {
    return (
      <div style={styles.card}>
        <p style={styles.sectionTitle}>Pull request metrics</p>
        <p style={styles.muted}>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.card}>
        <p style={styles.sectionTitle}>Pull request metrics</p>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, recent_prs } = data;

  return (
    <div style={styles.card}>
      <p style={styles.sectionTitle}>Pull request metrics</p>
      <p style={styles.repoLabel}>{repo.full_name}</p>

      {/* KPI row */}
      <div style={styles.kpiGrid}>
        <KPICard label="Merge rate" value={`${summary.merge_rate_percent}%`} />
        <KPICard label="Avg cycle time" value={summary.avg_cycle_time_display} />
        <KPICard label="Open PRs" value={summary.open} />
        <KPICard label="Merged" value={summary.merged} />
      </div>

      {/* Recent PRs */}
      {recent_prs.length > 0 && (
        <div style={styles.prList}>
          <p style={styles.listHeader}>Recent pull requests</p>
          {recent_prs.map((pr) => (
            <div key={pr.number} style={styles.prRow}>
              <span style={{ ...styles.prBadge, ...badgeStyle(pr.state) }}>
                {pr.state}
              </span>
              <span style={styles.prTitle}>
                #{pr.number} {pr.title}
              </span>
              <span style={styles.prAuthor}>@{pr.author}</span>
            </div>
          ))}
        </div>
      )}

      {recent_prs.length === 0 && (
        <p style={styles.muted}>No pull requests found for this repository.</p>
      )}
    </div>
  );
}

function KPICard({ label, value }) {
  return (
    <div style={styles.kpiCard}>
      <p style={styles.kpiLabel}>{label}</p>
      <p style={styles.kpiValue}>{value}</p>
    </div>
  );
}

function badgeStyle(state) {
  const map = {
    open: { background: "rgba(34,197,94,0.12)", color: "#16a34a" },
    merged: { background: "rgba(139,92,246,0.12)", color: "#7c3aed" },
    closed: { background: "rgba(239,68,68,0.12)", color: "#dc2626" },
  };
  return map[state] || {};
}

const styles = {
  card: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 4px",
  },
  repoLabel: {
    fontSize: "0.8rem",
    color: "var(--text-tertiary)",
    margin: "0 0 20px",
    fontFamily: "monospace",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  kpiCard: {
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    padding: "16px",
  },
  kpiLabel: {
    fontSize: "0.7rem",
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 6px",
    fontWeight: "500",
  },
  kpiValue: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "var(--text-primary)",
    margin: 0,
  },
  prList: {
    borderTop: "1px solid var(--border-color)",
    paddingTop: "16px",
  },
  listHeader: {
    fontSize: "0.8rem",
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 12px",
    fontWeight: "500",
  },
  prRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid var(--border-color)",
    flexWrap: "wrap",
  },
  prBadge: {
    fontSize: "0.65rem",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    flexShrink: 0,
  },
  prTitle: {
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  prAuthor: {
    fontSize: "0.75rem",
    color: "var(--text-tertiary)",
    flexShrink: 0,
  },
  muted: {
    fontSize: "0.875rem",
    color: "var(--text-tertiary)",
    margin: 0,
  },
  errorText: {
    fontSize: "0.875rem",
    color: "#dc2626",
    margin: 0,
  },
};

export default PRMetrics;
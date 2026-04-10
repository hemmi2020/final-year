"use client";

const DURATIONS = [3, 5, 7, 10, 14, 21, 30];

const styles = {
  container: {
    padding: "12px 0",
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    padding: "8px 18px",
    borderRadius: 50,
    fontSize: 14,
    fontWeight: 500,
    border: "1.5px solid var(--border)",
    background: "#FFF",
    color: "var(--text-body)",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
};

export default function DurationSelector({ onSend }) {
  const handleClick = (days) => {
    onSend(`I'd like to travel for ${days} days`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {DURATIONS.map((days) => (
          <button
            key={days}
            onClick={() => handleClick(days)}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--orange)";
              e.currentTarget.style.color = "#FFF";
              e.currentTarget.style.borderColor = "var(--orange)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFF";
              e.currentTarget.style.color = "var(--text-body)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            📅 {days} days
          </button>
        ))}
      </div>
    </div>
  );
}

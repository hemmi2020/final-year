"use client";

const COMPANIONS = [
  { label: "🧍 Solo", value: "Solo" },
  { label: "💑 Couple", value: "Couple" },
  { label: "👨‍👩‍👧 Family", value: "Family" },
  { label: "👫 Friends", value: "Friends" },
];

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
    padding: "8px 20px",
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

export default function CompanionSelector({ onSend }) {
  const handleClick = (choice) => {
    onSend(`I'll be traveling ${choice}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {COMPANIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleClick(value)}
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
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

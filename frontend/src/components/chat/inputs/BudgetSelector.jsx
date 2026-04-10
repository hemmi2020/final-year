"use client";

const BUDGETS = [
  { label: "💰 Budget", value: "Budget" },
  { label: "💳 Mid-range", value: "Mid-range" },
  { label: "💎 Luxury", value: "Luxury" },
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

export default function BudgetSelector({ onSend }) {
  const handleClick = (level) => {
    onSend(`My budget preference is ${level}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {BUDGETS.map(({ label, value }) => (
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

"use client";

import { useState } from "react";

const styles = {
  container: {
    display: "flex",
    gap: 8,
    padding: "12px 0",
  },
  input: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 50,
    border: "1.5px solid var(--border)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "10px 20px",
    borderRadius: 50,
    border: "none",
    background: "var(--orange)",
    color: "#FFF",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
};

export default function DestinationSearch({ onSend }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(`I want to go to ${trimmed}`);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="Enter a city or destination..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={styles.input}
        onFocus={(e) => (e.target.style.borderColor = "var(--orange)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
      <button
        onClick={handleSubmit}
        style={{
          ...styles.button,
          opacity: value.trim() ? 1 : 0.5,
        }}
        disabled={!value.trim()}
      >
        🌍 Go
      </button>
    </div>
  );
}

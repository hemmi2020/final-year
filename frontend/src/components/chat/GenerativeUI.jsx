"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  MapPin,
  ChevronRight,
  Star,
  Clock,
  DollarSign,
  Check,
  Calendar,
  Plane,
} from "lucide-react";
import { detectQuestion } from "@/lib/questionDetector";
import DestinationSearch from "@/components/chat/inputs/DestinationSearch";
import DurationSelector from "@/components/chat/inputs/DurationSelector";
import InputBudgetSelector from "@/components/chat/inputs/BudgetSelector";
import PreferenceChips from "@/components/chat/inputs/PreferenceChips";
import CompanionSelector from "@/components/chat/inputs/CompanionSelector";
import GenerateItinerary from "@/components/chat/inputs/GenerateItinerary";

// ─── PARSER ───
export function parseAIMessage(rawText) {
  const blocks = [];
  const regex = /<component\s+type="([^"]+)"\s+data='([\s\S]*?)'\s*\/>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "text",
        content: rawText.slice(lastIndex, match.index),
      });
    }
    try {
      blocks.push({
        type: "component",
        componentType: match[1],
        data: JSON.parse(match[2]),
      });
    } catch {
      blocks.push({ type: "text", content: match[0] });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < rawText.length) {
    blocks.push({ type: "text", content: rawText.slice(lastIndex) });
  }
  return blocks.length > 0 ? blocks : [{ type: "text", content: rawText }];
}

// ─── QUESTION TYPE → INTERACTIVE INPUT COMPONENT MAP ───
const QUESTION_COMPONENT_MAP = {
  destination: DestinationSearch,
  duration: DurationSelector,
  budget: InputBudgetSelector,
  preferences: PreferenceChips,
  companions: CompanionSelector,
  generate: GenerateItinerary,
};

// ─── RENDERER ───
export function MessageRenderer({ content, onSendMessage }) {
  const blocks = parseAIMessage(content);
  return (
    <div>
      {blocks.map((block, i) =>
        block.type === "text" ? (
          <div key={i} style={{ margin: "8px 0" }}>
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p style={{ fontSize: 15, lineHeight: 1.6, margin: "8px 0" }}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      margin: "8px 0",
                      paddingLeft: 20,
                    }}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      margin: "8px 0",
                      paddingLeft: 20,
                    }}
                  >
                    {children}
                  </ol>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 700 }}>{children}</strong>
                ),
                em: ({ children }) => <em>{children}</em>,
              }}
            >
              {block.content.trim()}
            </ReactMarkdown>
            {(() => {
              const detected = detectQuestion(block.content);
              if (!detected) return null;
              const InputComponent = QUESTION_COMPONENT_MAP[detected.type];
              if (!InputComponent) return null;
              return (
                <div style={{ marginTop: 8 }}>
                  <InputComponent onSend={onSendMessage} />
                </div>
              );
            })()}
          </div>
        ) : (
          <div
            key={i}
            className="animate-slide-up"
            style={{ margin: "12px 0" }}
          >
            <ComponentRenderer
              type={block.componentType}
              data={block.data}
              onSend={onSendMessage}
            />
          </div>
        ),
      )}
    </div>
  );
}

function ComponentRenderer({ type, data, onSend }) {
  const C = {
    "destination-grid": DestinationGrid,
    "date-picker": DatePickerCard,
    "budget-selector": BudgetSelector,
    "interest-selector": InterestSelector,
    itinerary: ItineraryCard,
    weather: WeatherCard,
    flights: FlightOptions,
    hotels: HotelGrid,
    "nearby-amenities": NearbyAmenities,
    poll: PollCard,
  }[type];
  return C ? <C data={data} onSend={onSend} /> : null;
}

// ─── 1. DESTINATION GRID ───
function DestinationGrid({ data, onSend }) {
  return (
    <div
      style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 0" }}
      className="no-scrollbar"
    >
      {(data.destinations || []).map((d) => (
        <div
          key={d.name}
          className="card"
          style={{
            minWidth: 160,
            padding: 0,
            overflow: "hidden",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => onSend?.(`I want to go to ${d.name}`)}
        >
          <div
            style={{
              height: 100,
              background: "linear-gradient(135deg, var(--orange), #F7C948)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            {d.flag || "🌍"}
          </div>
          <div style={{ padding: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{d.name}</p>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                margin: "2px 0",
              }}
            >
              {d.highlight || d.country}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 6,
              }}
            >
              {d.rating && (
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  ⭐ {d.rating}
                </span>
              )}
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {d.budget}
              </span>
            </div>
            <button
              className="btn-orange"
              style={{
                width: "100%",
                padding: "6px 0",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Choose
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 2. DATE PICKER ───
function DatePickerCard({ data, onSend }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        📅 {data.label || "Select your travel dates"}
      </p>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Departure
          </label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input-field"
            style={{ fontSize: 14 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 4,
            }}
          >
            Return
          </label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="input-field"
            style={{ fontSize: 14 }}
          />
        </div>
      </div>
      {start && end && (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          {Math.ceil((new Date(end) - new Date(start)) / 86400000)} nights
        </p>
      )}
      <button
        className="btn-orange"
        style={{ padding: "8px 20px", fontSize: 13 }}
        onClick={() =>
          start && end && onSend?.(`I'll be traveling from ${start} to ${end}`)
        }
      >
        Confirm
      </button>
    </div>
  );
}

// ─── 3. BUDGET SELECTOR ───
function BudgetSelector({ data, onSend }) {
  const [val, setVal] = useState(2500);
  const [selected, setSelected] = useState("");
  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        💰 {data.label || "What's your budget?"}
      </p>
      <input
        type="range"
        min={500}
        max={10000}
        step={100}
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--orange)", marginBottom: 8 }}
      />
      <p
        style={{
          textAlign: "center",
          fontSize: 20,
          fontWeight: 800,
          color: "var(--orange)",
        }}
      >
        ${val.toLocaleString()}
      </p>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {[
          { l: "🎒 Budget", v: "budget" },
          { l: "✈️ Mid-range", v: "mid-range" },
          { l: "👑 Luxury", v: "luxury" },
        ].map((b) => (
          <button
            key={b.v}
            onClick={() => {
              setSelected(b.v);
              setVal(
                b.v === "budget" ? 1000 : b.v === "mid-range" ? 3000 : 7000,
              );
            }}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 600,
              border: "1.5px solid",
              cursor: "pointer",
              fontFamily: "inherit",
              background: selected === b.v ? "var(--orange)" : "#FFF",
              color: selected === b.v ? "#FFF" : "var(--text-body)",
              borderColor: selected === b.v ? "var(--orange)" : "var(--border)",
            }}
          >
            {b.l}
          </button>
        ))}
      </div>
      <button
        className="btn-orange"
        style={{ padding: "8px 20px", fontSize: 13 }}
        onClick={() =>
          onSend?.(
            `My budget is around $${val} per person, ${selected || "mid-range"}`,
          )
        }
      >
        Set Budget
      </button>
    </div>
  );
}

// ─── 4. INTEREST SELECTOR ───
function InterestSelector({ data, onSend }) {
  const [sel, setSel] = useState([]);
  const opts = data.options || [
    "🎭 Culture",
    "🍜 Food",
    "🧗 Adventure",
    "🛍️ Shopping",
    "🌿 Nature",
    "🎉 Nightlife",
    "🏛️ History",
    "🧘 Wellness",
  ];
  const toggle = (o) =>
    setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        {data.label || "What do you enjoy?"}
      </p>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}
      >
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => toggle(o)}
            style={{
              padding: "8px 16px",
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 500,
              border: "1.5px solid",
              cursor: "pointer",
              fontFamily: "inherit",
              background: sel.includes(o) ? "var(--orange)" : "#FFF",
              color: sel.includes(o) ? "#FFF" : "var(--text-body)",
              borderColor: sel.includes(o) ? "var(--orange)" : "var(--border)",
            }}
          >
            {o}
          </button>
        ))}
      </div>
      {sel.length > 0 && (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 8,
          }}
        >
          Selected: {sel.join(", ")}
        </p>
      )}
      <button
        className="btn-orange"
        style={{ padding: "8px 20px", fontSize: 13 }}
        disabled={sel.length === 0}
        onClick={() => onSend?.(`I'm interested in ${sel.join(", ")}`)}
      >
        Confirm Selection →
      </button>
    </div>
  );
}

// ─── 5. ITINERARY CARD ───
function ItineraryCard({ data, onSend }) {
  const [activeDay, setActiveDay] = useState(0);
  const days = data.days || [];
  const day = days[activeDay];
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            🗾 Your {data.destination} Itinerary
          </p>
          {data.totalCost && (
            <p
              style={{
                fontSize: 13,
                color: "var(--orange)",
                fontWeight: 600,
                margin: "2px 0 0",
              }}
            >
              {data.totalCost} total
            </p>
          )}
        </div>
      </div>
      {/* Day tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border-light)",
          overflowX: "auto",
        }}
        className="no-scrollbar"
      >
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              background: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              color: activeDay === i ? "var(--orange)" : "var(--text-muted)",
              borderBottom:
                activeDay === i
                  ? "2px solid var(--orange)"
                  : "2px solid transparent",
            }}
          >
            📅 Day {d.day || i + 1}
          </button>
        ))}
      </div>
      {/* Active day content */}
      {day && (
        <div style={{ padding: 20 }}>
          {day.weather && (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            >
              {day.weather.icon || "☀️"} {day.weather.condition} ·{" "}
              {day.weather.temp}
            </p>
          )}
          <div
            style={{ borderLeft: "2px solid var(--orange)", paddingLeft: 16 }}
          >
            {(day.activities || []).map((act, j) => (
              <div key={j} style={{ marginBottom: 16, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: -24,
                    top: 2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "var(--orange)",
                  }}
                />
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--orange)",
                    fontWeight: 600,
                  }}
                >
                  {act.time}
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, margin: "2px 0" }}>
                  {act.name}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {act.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 4,
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {act.duration && <span>🕐 {act.duration}</span>}
                  {act.cost && <span>💰 {act.cost}</span>}
                  {act.halal && (
                    <span style={{ color: "var(--success)", fontWeight: 600 }}>
                      ✅ Halal
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          className="btn-orange"
          style={{ padding: "8px 18px", fontSize: 13 }}
          onClick={() => onSend?.("Save this trip")}
        >
          💾 Save Trip
        </button>
        <button
          className="btn-outline"
          style={{ padding: "8px 18px", fontSize: 13 }}
        >
          📥 PDF
        </button>
        <button
          className="btn-outline"
          style={{ padding: "8px 18px", fontSize: 13 }}
          onClick={() => onSend?.("Regenerate this itinerary")}
        >
          🔄 Regenerate
        </button>
      </div>
    </div>
  );
}

// ─── 6. WEATHER CARD ───
function WeatherCard({ data }) {
  const colors = {
    Sunny: "#22C55E",
    Rain: "#3B82F6",
    Cloudy: "#9CA3AF",
    Great: "#22C55E",
    OK: "#F59E0B",
  };
  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        🌤️ {data.city} Weather
      </p>
      <div
        style={{ display: "flex", gap: 16, overflowX: "auto" }}
        className="no-scrollbar"
      >
        {(data.forecast || []).map((d, i) => (
          <div key={i} style={{ textAlign: "center", minWidth: 60 }}>
            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              {d.day}
            </p>
            <p style={{ fontSize: 28, margin: "4px 0" }}>{d.icon}</p>
            <p style={{ fontSize: 15, fontWeight: 700 }}>{d.high}°</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.low}°</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 7. FLIGHT OPTIONS ───
function FlightOptions({ data }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
          ✈️ {data.from} → {data.to} · {data.date}
        </p>
      </div>
      {(data.options || []).map((f, i) => (
        <div
          key={i}
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
              {f.logo} {f.airline}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                margin: "2px 0",
              }}
            >
              {f.departure} → {f.arrival} · {f.duration}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 99,
                background: f.stops === 0 ? "#E8F5E9" : "#FFF3E0",
                color: f.stops === 0 ? "#2E7D32" : "#E65100",
                fontWeight: 600,
              }}
            >
              {f.stops === 0 ? "Non-stop" : `${f.stops} stop`}
            </span>
            <p
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: "4px 0 0",
              }}
            >
              ${f.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 8. NEARBY AMENITIES ───
function NearbyAmenities({ data, onSend }) {
  const [cat, setCat] = useState("restaurant");
  const cats = [
    { key: "restaurant", icon: "🍽️", label: "Food" },
    { key: "hotel", icon: "🏨", label: "Hotels" },
    { key: "hospital", icon: "🏥", label: "Medical" },
    { key: "atm", icon: "🏧", label: "ATM" },
    { key: "mosque", icon: "🕌", label: "Mosque" },
  ];
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
          📍 Nearby — {data.location}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            margin: "2px 0 0",
          }}
        >
          Within {(data.radius || 1000) / 1000}km radius
        </p>
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "10px 20px",
          overflowX: "auto",
          borderBottom: "1px solid var(--border-light)",
        }}
        className="no-scrollbar"
      >
        {cats.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            style={{
              padding: "6px 14px",
              borderRadius: 50,
              fontSize: 12,
              fontWeight: 600,
              border: "1.5px solid",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              background: cat === c.key ? "var(--orange)" : "#FFF",
              color: cat === c.key ? "#FFF" : "var(--text-body)",
              borderColor: cat === c.key ? "var(--orange)" : "var(--border)",
            }}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div
        style={{
          padding: "12px 20px",
          fontSize: 14,
          color: "var(--text-secondary)",
        }}
      >
        <p>
          Searching for {cat}s near {data.location}...
        </p>
        <button
          className="btn-outline"
          style={{ padding: "6px 16px", fontSize: 12, marginTop: 8 }}
          onClick={() => onSend?.(`Show me ${cat}s near ${data.location}`)}
        >
          Load Results
        </button>
      </div>
    </div>
  );
}

// ─── 9. POLL CARD ───
function PollCard({ data, onSend }) {
  const [voted, setVoted] = useState(null);
  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        🗳️ {data.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(data.options || []).map((o, i) => (
          <button
            key={i}
            onClick={() => {
              setVoted(i);
              onSend?.(`I vote for ${o}`);
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1.5px solid",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "inherit",
              background: voted === i ? "var(--orange)" : "#FFF",
              color: voted === i ? "#FFF" : "var(--text-body)",
              borderColor: voted === i ? "var(--orange)" : "var(--border)",
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 10. HOTEL GRID ───
function HotelGrid({ data }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
          🏨 Hotels in {data.city}
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          padding: 16,
        }}
      >
        {(data.hotels || []).map((h, i) => (
          <div
            key={i}
            style={{
              border: "1px solid var(--border-light)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 80,
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                fontSize: 24,
              }}
            >
              🏨
            </div>
            <div style={{ padding: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                {h.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  margin: "2px 0",
                }}
              >
                {"⭐".repeat(h.stars || 3)} · {h.distanceFromCenter}
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "var(--orange)",
                  margin: "4px 0",
                }}
              >
                ${h.pricePerNight}/night
              </p>
              {h.amenities && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {h.amenities.map((a) => (
                    <span
                      key={a}
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        background: "#F5F5F5",
                        borderRadius: 4,
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";

const CATEGORY_META = {
  concert:     { emoji: "🎵", color: "#a78bfa" },
  film:        { emoji: "🎬", color: "#60a5fa" },
  sport:       { emoji: "⚽", color: "#4ade80" },
  market:      { emoji: "🛍️", color: "#fbbf24" },
  guided_tour: { emoji: "🗺️", color: "#f472b6" },
  fireworks:   { emoji: "🎆", color: "#fb923c" },
  exhibition:  { emoji: "🖼️", color: "#c084fc" },
  theatre:     { emoji: "🎭", color: "#e879f9" },
  festival:    { emoji: "🎉", color: "#e8631a" },
  other:       { emoji: "📌", color: "#94a3b8" },
};

function formatDate(dateStr) {
  if (!dateStr) return { day: "?", month: "?", weekday: "?" };
  const d = new Date(dateStr + "T12:00:00");
  return {
    day:     d.toLocaleDateString("en-GB", { day: "numeric" }),
    month:   d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
  };
}

export default function EventCard({ event, compact = false }) {
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[event.category] || CATEGORY_META.other;
  const { day, month, weekday } = formatDate(event.date_start);

  if (compact) {
    return (
      <div style={{ padding: "12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, fontWeight: 500,
            color: meta.color,
            background: `${meta.color}18`,
            border: `1px solid ${meta.color}30`,
            padding: "2px 8px", borderRadius: 999,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {meta.emoji} {event.category?.replace("_", " ")}
          </span>
          {event.price_value === 0 && (
            <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 500 }}>✓ Free</span>
          )}
          {event.time_start && (
            <span style={{ fontSize: 11, color: "rgba(232,224,208,0.4)" }}>{event.time_start}</span>
          )}
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 15, fontWeight: 700,
          color: "#e8e0d0", lineHeight: 1.3, marginBottom: 4,
        }}>
          {event.title}
        </div>
        {event.location && (
          <div style={{ fontSize: 12, color: "rgba(232,224,208,0.4)", marginBottom: 6 }}>
            📍 {event.location}
          </div>
        )}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {event.sources.map((source, i) => (
            <a key={i} href={source.url} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 10, color: "rgba(232,224,208,0.4)",
                textDecoration: "none", padding: "2px 8px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 999,
              }}
            >
              {source.name} ↗
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        gap: "24px",
        padding: "24px 0",
        transition: "transform 0.18s ease",
        transform: hovered ? "translateX(6px)" : "translateX(0)",
        cursor: "default",
      }}
    >
      {/* Date block */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start",
        paddingTop: 4,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 500, letterSpacing: "0.1em",
          color: "rgba(232,224,208,0.4)", marginBottom: 2
        }}>{weekday}</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 40, fontWeight: 700, lineHeight: 1,
          color: hovered ? meta.color : "#e8e0d0",
          transition: "color 0.18s ease",
        }}>{day}</div>
        <div style={{
          fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
          color: meta.color, marginTop: 2
        }}>{month}</div>
      </div>

      {/* Content */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: meta.color,
            background: `${meta.color}18`,
            border: `1px solid ${meta.color}30`,
            padding: "2px 10px", borderRadius: 999,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {meta.emoji} {event.category?.replace("_", " ")}
          </span>
          {event.price && (
            <span style={{
              fontSize: 12,
              color: event.price_value === 0 ? "#4ade80" : "rgba(232,224,208,0.6)",
              fontWeight: event.price_value === 0 ? 500 : 400,
            }}>
              {event.price_value === 0 ? "✓ Free" : event.price}
            </span>
          )}
          {event.time_start && (
            <span style={{ fontSize: 12, color: "rgba(232,224,208,0.4)" }}>
              {event.time_start}
            </span>
          )}
          {event.date_end && event.date_end !== event.date_start && (
            <span style={{ fontSize: 11, color: "rgba(232,224,208,0.3)" }}>
              until {new Date(event.date_end + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 20, fontWeight: 700,
          color: "#e8e0d0", lineHeight: 1.25,
          marginBottom: 6,
        }}>
          {event.title}
        </h2>

        {event.location && (
          <p style={{
            fontSize: 13, color: "rgba(232,224,208,0.5)",
            marginBottom: 6, display: "flex", alignItems: "center", gap: 4
          }}>
            <span>📍</span> {event.location}
            {event.district && <span style={{ color: "rgba(232,224,208,0.3)" }}>· {event.district}</span>}
          </p>
        )}

        {event.description && (
          <p style={{
            fontSize: 14, lineHeight: 1.6,
            color: "rgba(232,224,208,0.55)",
            marginBottom: 12,
          }}>
            {event.description}
          </p>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {event.sources.map((source, i) => (
            <a key={i} href={source.url} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 11, color: "rgba(232,224,208,0.45)",
                textDecoration: "none", padding: "3px 10px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 999,
                transition: "all 0.15s ease",
                display: "inline-flex", alignItems: "center", gap: 4,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = meta.color;
                e.currentTarget.style.color = meta.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(232,224,208,0.45)";
              }}
            >
              {source.name} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
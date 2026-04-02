const CATEGORY_COLORS = {
  concert:     { bg: "#f0e6ff", text: "#6b21a8" },
  film:        { bg: "#e0f2fe", text: "#075985" },
  sport:       { bg: "#dcfce7", text: "#166534" },
  market:      { bg: "#fef9c3", text: "#854d0e" },
  guided_tour: { bg: "#ffe4e6", text: "#9f1239" },
  fireworks:   { bg: "#fff7ed", text: "#9a3412" },
  exhibition:  { bg: "#f3e8ff", text: "#6b21a8" },
  theatre:     { bg: "#fce7f3", text: "#9d174d" },
  festival:    { bg: "#ecfdf5", text: "#065f46" },
  other:       { bg: "#f1f5f9", text: "#475569" },
};

export default function EventCard({ event }) {
  const colors = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;
  const dateStr = event.date_start
    ? new Date(event.date_start + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short"
      })
    : "Date TBC";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: "1rem 1.25rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
    }}>

      {/* Date column */}
      <div style={{
        minWidth: 56,
        textAlign: "center",
        background: "#f8f8f8",
        borderRadius: 8,
        padding: "0.5rem 0.25rem",
      }}>
        <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase" }}>
          {dateStr.split(" ")[0]}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
          {dateStr.split(" ")[1]}
        </div>
        <div style={{ fontSize: 11, color: "#999" }}>
          {dateStr.split(" ")[2]}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "2px 8px",
            borderRadius: 20, background: colors.bg, color: colors.text,
            textTransform: "uppercase", letterSpacing: "0.05em"
          }}>
            {event.category}
          </span>
          {event.price && (
            <span style={{ fontSize: 12, color: event.price_value === 0 ? "#16a34a" : "#555" }}>
              {event.price_value === 0 ? "Free" : event.price}
            </span>
          )}
          {event.time_start && (
            <span style={{ fontSize: 12, color: "#888" }}>· {event.time_start}</span>
          )}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
          {event.title}
        </h2>

        {event.location && (
          <p style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
            📍 {event.location}
          </p>
        )}

        {event.description && (
          <p style={{ fontSize: 13, color: "#555", marginBottom: 8, lineHeight: 1.5 }}>
            {event.description}
          </p>
        )}

        {/* Sources */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {event.sources.map((source, i) => (
            
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, color: "#3b82f6",
                textDecoration: "none", padding: "2px 8px",
                border: "1px solid #bfdbfe", borderRadius: 20,
                background: "#eff6ff",
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
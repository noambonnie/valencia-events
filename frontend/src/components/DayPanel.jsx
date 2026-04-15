import EventCard from "./EventCard.jsx";

export default function DayPanel({ isoDay, events, onClose }) {
  if (!isoDay) return null;

  const date = new Date(isoDay + "T12:00:00");
  const dayEvents = events.filter(e => {
    const start = e.date_start;
    const end = e.date_end || e.date_start;
    return start && isoDay >= start && isoDay <= end;
  });

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px",
      height: "fit-content",
      position: "sticky",
      top: 120,
      animation: "slideIn 0.2s ease both",
      minWidth: 0,
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16,
      }}>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, fontWeight: 700, color: "#e8631a", lineHeight: 1,
          }}>
            {date.getDate()}
          </div>
          <div style={{ fontSize: 12, color: "rgba(232,224,208,0.5)", marginTop: 4 }}>
            {date.toLocaleDateString("en-GB", {
              weekday: "long", month: "long", year: "numeric"
            })}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none",
          color: "rgba(232,224,208,0.4)",
          cursor: "pointer", fontSize: 20, lineHeight: 1,
          padding: 4,
        }}>×</button>
      </div>

      <div style={{
        fontSize: 11, color: "rgba(232,224,208,0.35)",
        textTransform: "uppercase", letterSpacing: "0.08em",
        marginBottom: 12,
      }}>
        {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
      </div>

      {/* Event list */}
      {dayEvents.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(232,224,208,0.3)", padding: "20px 0", textAlign: "center" }}>
          No events
        </div>
      ) : (
        <div style={{
          display: "flex", flexDirection: "column",
          maxHeight: "65vh", overflowY: "auto",
          scrollbarWidth: "thin",
          paddingRight: 4,
        }}>
          {dayEvents.map((event, i) => (
            <div key={event.id}>
              <EventCard event={event} compact />
              {i < dayEvents.length - 1 && (
                <div style={{
                  height: 1,
                  background: "rgba(255,255,255,0.06)",
                  margin: "2px 0",
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
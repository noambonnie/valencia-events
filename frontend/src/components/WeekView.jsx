import { useState } from "react";
import EventCard from "./EventCard.jsx";

function getWeekDays(referenceDate) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function toISO(date) {
  return date.toISOString().split("T")[0];
}

function eventCoversDay(event, isoDay) {
  const start = event.date_start;
  const end = event.date_end || event.date_start;
  if (!start) return false;
  return isoDay >= start && isoDay <= end;
}

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

export default function WeekView({ events }) {
  const [refDate, setRefDate] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const days = getWeekDays(refDate);
  const todayISO = toISO(new Date());

  function prevWeek() {
    const d = new Date(refDate);
    d.setDate(d.getDate() - 7);
    setRefDate(d);
    setSelected(null);
  }

  function nextWeek() {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 7);
    setRefDate(d);
    setSelected(null);
  }

  const weekLabel = `${days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div>
      {/* Week navigation */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 24,
      }}>
        <button onClick={prevWeek} style={navBtnStyle}>← prev</button>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18, color: "#e8e0d0"
        }}>{weekLabel}</span>
        <button onClick={nextWeek} style={navBtnStyle}>next →</button>
      </div>

      {/* 7-column grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 8,
      }}>
        {days.map(day => {
          const iso = toISO(day);
          const isToday = iso === todayISO;
          const dayEvents = events.filter(e => eventCoversDay(e, iso));

          return (
            <div key={iso} style={{
              minHeight: 160,
              background: isToday
                ? "rgba(232,99,26,0.08)"
                : "rgba(255,255,255,0.03)",
              border: isToday
                ? "1px solid rgba(232,99,26,0.4)"
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: 10,
              transition: "background 0.15s",
            }}>
              {/* Day header */}
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  fontSize: 10, fontWeight: 500, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isToday ? "#e8631a" : "rgba(232,224,208,0.4)",
                }}>
                  {day.toLocaleDateString("en-GB", { weekday: "short" })}
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24, fontWeight: 700, lineHeight: 1,
                  color: isToday ? "#e8631a" : "#e8e0d0",
                }}>
                  {day.getDate()}
                </div>
              </div>

              {/* Events */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {dayEvents.slice(0, 4).map(event => {
                  const meta = CATEGORY_META[event.category] || CATEGORY_META.other;
                  const isStart = event.date_start === iso;
                  const isEnd = (event.date_end || event.date_start) === iso;
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelected(selected?.id === event.id ? null : event)}
                      style={{
                        fontSize: 11, lineHeight: 1.3,
                        padding: "4px 6px",
                        borderRadius: 6,
                        background: `${meta.color}22`,
                        borderLeft: `3px solid ${meta.color}`,
                        color: meta.color,
                        cursor: "pointer",
                        transition: "background 0.15s",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${meta.color}38`}
                      onMouseLeave={e => e.currentTarget.style.background = `${meta.color}22`}
                      title={event.title}
                    >
                      {!isStart && "← "}
                      {meta.emoji} {event.title}
                      {!isEnd && " →"}
                    </div>
                  );
                })}
                {dayEvents.length > 4 && (
                  <div style={{
                    fontSize: 10, color: "rgba(232,224,208,0.4)",
                    padding: "2px 6px",
                  }}>
                    +{dayEvents.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected event detail */}
      {selected && (
        <div style={{
          marginTop: 24,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 24,
          animation: "fadeUp 0.2s ease both",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: 16,
          }}>
            <span style={{ fontSize: 12, color: "rgba(232,224,208,0.4)" }}>
              Event details
            </span>
            <button
              onClick={() => setSelected(null)}
              style={{
                background: "none", border: "none",
                color: "rgba(232,224,208,0.4)", cursor: "pointer",
                fontSize: 18, lineHeight: 1,
              }}
            >×</button>
          </div>
          <EventCard event={selected} />
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  padding: "8px 16px",
  color: "rgba(232,224,208,0.7)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  cursor: "pointer",
  transition: "all 0.15s",
};
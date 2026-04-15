import { useState } from "react";
import DayPanel from "./DayPanel.jsx";

function getWeekDays(referenceDate) {
  const d = new Date(referenceDate);
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
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
  return start && isoDay >= start && isoDay <= end;
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

export default function WeekView({ events, initialDate }) {
  const [refDate, setRefDate]       = useState(initialDate || new Date());
  const [selectedDay, setSelectedDay] = useState(
    initialDate ? toISO(initialDate) : null
  );

  const days     = getWeekDays(refDate);
  const todayISO = toISO(new Date());

  function prevWeek() {
    const d = new Date(refDate);
    d.setDate(d.getDate() - 7);
    setRefDate(d);
    setSelectedDay(null);
  }
  function nextWeek() {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 7);
    setRefDate(d);
    setSelectedDay(null);
  }

  const weekLabel = `${days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div>
      {/* Navigation */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 20,
      }}>
        <button onClick={prevWeek} style={navBtnStyle}>← prev</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#e8e0d0" }}>
          {weekLabel}
        </span>
        <button onClick={nextWeek} style={navBtnStyle}>next →</button>
      </div>

      {/* 7-column grid — fixed columns, never overflow */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 6,
        width: "100%",
      }}>
        {days.map(day => {
          const iso        = toISO(day);
          const isToday    = iso === todayISO;
          const isSelected = iso === selectedDay;
          const dayEvents  = events.filter(e => eventCoversDay(e, iso));

          return (
            <div key={iso} style={{
              minHeight: 140,
              width: "100%",
              minWidth: 0,        /* critical: prevents grid blowout */
              background: isSelected
                ? "rgba(232,99,26,0.12)"
                : isToday
                ? "rgba(232,99,26,0.06)"
                : "rgba(255,255,255,0.03)",
              border: isSelected
                ? "1px solid rgba(232,99,26,0.5)"
                : isToday
                ? "1px solid rgba(232,99,26,0.3)"
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: 8,
              boxSizing: "border-box",
              overflow: "hidden",
            }}>

              {/* Clickable day header */}
              <div
                onClick={() => setSelectedDay(isSelected ? null : iso)}
                style={{
                  marginBottom: 6, cursor: "pointer",
                  borderRadius: 6, padding: "3px 2px",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(232,99,26,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  fontSize: 9, fontWeight: 500, letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: isToday ? "#e8631a" : "rgba(232,224,208,0.4)",
                }}>
                  {day.toLocaleDateString("en-GB", { weekday: "short" })}
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22, fontWeight: 700, lineHeight: 1,
                  color: isToday || isSelected ? "#e8631a" : "#e8e0d0",
                }}>
                  {day.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div style={{
                    fontSize: 9,
                    color: isSelected ? "#e8631a" : "rgba(232,224,208,0.3)",
                    marginTop: 1,
                  }}>
                    {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Event pills */}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {dayEvents.slice(0, 3).map(event => {
                  const meta   = CATEGORY_META[event.category] || CATEGORY_META.other;
                  const isStart = event.date_start === iso;
                  const isEnd   = (event.date_end || event.date_start) === iso;
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedDay(isSelected ? null : iso)}
                      title={event.title}
                      style={{
                        fontSize: 10, lineHeight: 1.3,
                        padding: "3px 5px", borderRadius: 4,
                        background: `${meta.color}20`,
                        borderLeft: `2px solid ${meta.color}`,
                        color: meta.color,
                        cursor: "pointer",
                        /* hard truncation — never grows the cell */
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        display: "block",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${meta.color}35`}
                      onMouseLeave={e => e.currentTarget.style.background = `${meta.color}20`}
                    >
                      {!isStart && "←"}{meta.emoji} {event.title}{!isEnd && "→"}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div
                    onClick={() => setSelectedDay(isSelected ? null : iso)}
                    style={{
                      fontSize: 10, color: "#e8631a",
                      padding: "1px 5px", cursor: "pointer", fontWeight: 500,
                    }}
                  >
                    +{dayEvents.length - 3} more →
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day panel — always below, never beside */}
      {selectedDay && (
        <div style={{ marginTop: 20 }}>
          <DayPanel
            isoDay={selectedDay}
            events={events}
            onClose={() => setSelectedDay(null)}
          />
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8, padding: "8px 16px",
  color: "rgba(232,224,208,0.7)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13, cursor: "pointer",
};
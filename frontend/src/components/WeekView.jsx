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

export default function WeekView({ events, initialDate, onDrillToDay }) {
  const [refDate, setRefDate]     = useState(initialDate || new Date());
  const [selectedDay, setSelectedDay] = useState(
    initialDate ? toISO(initialDate) : null
  );

  const days = getWeekDays(refDate);
  const todayISO = toISO(new Date());

  function prevWeek() { const d = new Date(refDate); d.setDate(d.getDate() - 7); setRefDate(d); setSelectedDay(null); }
  function nextWeek() { const d = new Date(refDate); d.setDate(d.getDate() + 7); setRefDate(d); setSelectedDay(null); }

  const weekLabel = `${days[0].toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${days[6].toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 340px" : "1fr", gap: 24 }}>

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

        {/* 7-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {days.map(day => {
            const iso = toISO(day);
            const isToday    = iso === todayISO;
            const isSelected = iso === selectedDay;
            const dayEvents  = events.filter(e => eventCoversDay(e, iso));

            return (
              <div key={iso} style={{
                minHeight: 160,
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
                borderRadius: 12,
                padding: 10,
                transition: "background 0.15s",
              }}>

                {/* Clickable day header */}
                <div
                  onClick={() => setSelectedDay(isSelected ? null : iso)}
                  style={{
                    marginBottom: 8, cursor: "pointer",
                    borderRadius: 8, padding: "4px 2px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(232,99,26,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  title="Click to see all events"
                >
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
                    color: isToday || isSelected ? "#e8631a" : "#e8e0d0",
                    transition: "color 0.15s",
                  }}>
                    {day.getDate()}
                  </div>
                  {dayEvents.length > 0 && (
                    <div style={{
                      fontSize: 10, color: isSelected ? "#e8631a" : "rgba(232,224,208,0.35)",
                      marginTop: 1,
                    }}>
                      {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Event pills — first 3 only, rest accessible via panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {dayEvents.slice(0, 3).map(event => {
                    const meta = CATEGORY_META[event.category] || CATEGORY_META.other;
                    const isStart = event.date_start === iso;
                    const isEnd   = (event.date_end || event.date_start) === iso;
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedDay(isSelected ? null : iso)}
                        style={{
                          fontSize: 11, lineHeight: 1.3,
                          padding: "3px 6px", borderRadius: 5,
                          background: `${meta.color}20`,
                          borderLeft: `3px solid ${meta.color}`,
                          color: meta.color,
                          cursor: "pointer",
                          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${meta.color}35`}
                        onMouseLeave={e => e.currentTarget.style.background = `${meta.color}20`}
                        title={event.title}
                      >
                        {!isStart && "← "}{meta.emoji} {event.title}{!isEnd && " →"}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div
                      onClick={() => setSelectedDay(isSelected ? null : iso)}
                      style={{
                        fontSize: 10, color: "#e8631a",
                        padding: "2px 6px", cursor: "pointer",
                        fontWeight: 500,
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
      </div>

      {/* Day panel */}
      <DayPanel
        isoDay={selectedDay}
        events={events}
        onClose={() => setSelectedDay(null)}
      />
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
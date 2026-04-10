import { useState } from "react";
import EventCard from "./EventCard.jsx";

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const days = [];

  // Padding before
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, -startOffset + i + 1);
    days.push({ date: d, currentMonth: false });
  }
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true });
  }
  // Padding after to fill grid
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false });
  }
  return days;
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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthView({ events }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const todayISO = toISO(today);
  const grid = getMonthGrid(year, month);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long", year: "numeric"
  });

  const selectedEvents = selectedDay
    ? events.filter(e => eventCoversDay(e, selectedDay))
    : [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 360px" : "1fr", gap: 24 }}>

      {/* Calendar */}
      <div>
        {/* Month navigation */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 20,
        }}>
          <button onClick={prevMonth} style={navBtnStyle}>← prev</button>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22, color: "#e8e0d0",
          }}>{monthLabel}</span>
          <button onClick={nextMonth} style={navBtnStyle}>next →</button>
        </div>

        {/* Weekday headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4, marginBottom: 4,
        }}>
          {WEEKDAYS.map(wd => (
            <div key={wd} style={{
              textAlign: "center", fontSize: 11, fontWeight: 500,
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "rgba(232,224,208,0.3)", padding: "4px 0",
            }}>{wd}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4,
        }}>
          {grid.map(({ date, currentMonth }, i) => {
            const iso = toISO(date);
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDay;
            const dayEvents = events.filter(e => eventCoversDay(e, iso));
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={i}
                onClick={() => hasEvents && setSelectedDay(isSelected ? null : iso)}
                style={{
                  minHeight: 80,
                  background: isSelected
                    ? "rgba(232,99,26,0.15)"
                    : isToday
                    ? "rgba(232,99,26,0.08)"
                    : "rgba(255,255,255,0.02)",
                  border: isSelected
                    ? "1px solid rgba(232,99,26,0.6)"
                    : isToday
                    ? "1px solid rgba(232,99,26,0.3)"
                    : "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 10,
                  padding: 8,
                  cursor: hasEvents ? "pointer" : "default",
                  opacity: currentMonth ? 1 : 0.3,
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  if (hasEvents && !isSelected)
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={e => {
                  if (hasEvents && !isSelected)
                    e.currentTarget.style.background = isToday
                      ? "rgba(232,99,26,0.08)"
                      : "rgba(255,255,255,0.02)";
                }}
              >
                {/* Day number */}
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 16, fontWeight: 700,
                  color: isToday ? "#e8631a" : isSelected ? "#e8631a" : "#e8e0d0",
                  marginBottom: 4,
                }}>
                  {date.getDate()}
                </div>

                {/* Event dots / pills */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayEvents.slice(0, 3).map(event => {
                    const meta = CATEGORY_META[event.category] || CATEGORY_META.other;
                    return (
                      <div key={event.id} style={{
                        fontSize: 10, lineHeight: 1.3,
                        padding: "2px 5px",
                        borderRadius: 4,
                        background: `${meta.color}20`,
                        color: meta.color,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}>
                        {meta.emoji} {event.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div style={{
                      fontSize: 10,
                      color: "rgba(232,224,208,0.35)",
                      padding: "1px 5px",
                    }}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      {selectedDay && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "20px",
          height: "fit-content",
          position: "sticky",
          top: 120,
          animation: "slideIn 0.2s ease both",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 20,
          }}>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28, fontWeight: 700, color: "#e8631a", lineHeight: 1,
              }}>
                {new Date(selectedDay + "T12:00:00").getDate()}
              </div>
              <div style={{ fontSize: 12, color: "rgba(232,224,208,0.5)", marginTop: 2 }}>
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-GB", {
                  weekday: "long", month: "long", year: "numeric"
                })}
              </div>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              style={{
                background: "none", border: "none",
                color: "rgba(232,224,208,0.4)",
                cursor: "pointer", fontSize: 20, lineHeight: 1,
              }}
            >×</button>
          </div>

          <div style={{ fontSize: 12, color: "rgba(232,224,208,0.4)", marginBottom: 16 }}>
            {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
          </div>

          <div style={{
            display: "flex", flexDirection: "column", gap: 0,
            maxHeight: "60vh", overflowY: "auto",
            scrollbarWidth: "thin",
          }}>
            {selectedEvents.map((event, i) => (
              <div key={event.id}>
                <EventCard event={event} compact />
                {i < selectedEvents.length - 1 && (
                  <div style={{
                    height: 1,
                    background: "rgba(255,255,255,0.06)",
                    margin: "4px 0",
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
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
};
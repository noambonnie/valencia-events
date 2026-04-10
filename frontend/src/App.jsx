import { useState, useMemo } from "react";
import events from "./events.json";
import EventCard from "./components/EventCard.jsx";
import WeekView from "./components/WeekView.jsx";
import MonthView from "./components/MonthView.jsx";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "concert", label: "Concerts" },
  { id: "festival", label: "Festivals" },
  { id: "film", label: "Film" },
  { id: "exhibition", label: "Exhibitions" },
  { id: "theatre", label: "Theatre" },
  { id: "market", label: "Markets" },
  { id: "guided_tour", label: "Guided Tours" },
  { id: "fireworks", label: "Fireworks" },
  { id: "sport", label: "Sport" },
  { id: "other", label: "Other" },
];

const VIEWS = ["List", "Week", "Month"];

const styles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(48px, 8vw, 96px);
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -2px;
    color: #e8e0d0;
    animation: fadeUp 0.8s ease both;
  }
  .hero-subtitle {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(20px, 3vw, 32px);
    color: #e8631a;
    animation: fadeUp 0.8s ease 0.1s both;
  }
  .stat { animation: fadeUp 0.8s ease 0.2s both; }
  .search-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 14px 20px 14px 48px;
    color: #e8e0d0;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .search-input::placeholder { color: rgba(232,224,208,0.35); }
  .search-input:focus {
    border-color: #e8631a;
    background: rgba(255,255,255,0.08);
  }
  .cat-pill {
    padding: 8px 18px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.15);
    background: transparent;
    color: rgba(232,224,208,0.6);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .cat-pill:hover { border-color: #e8631a; color: #e8631a; }
  .cat-pill.active { background: #e8631a; border-color: #e8631a; color: #fff; }
  .view-tab {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: rgba(232,224,208,0.45);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.03em;
  }
  .view-tab:hover { color: rgba(232,224,208,0.8); }
  .view-tab.active {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
    color: #e8e0d0;
  }
  .filter-select {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    padding: 10px 16px;
    color: #e8e0d0;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .filter-select:focus { border-color: #e8631a; }
  .filter-select option { background: #131929; }
  .results-count {
    font-size: 13px;
    color: rgba(232,224,208,0.4);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .event-item { animation: fadeUp 0.5s ease both; }
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(232,99,26,0.3), transparent);
    margin: 8px 0;
  }
`;

export default function App() {
  const [view,     setView]     = useState("List");
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [price,    setPrice]    = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [sortBy,   setSortBy]   = useState("date");

  const uniqueSources = new Set(
    events.flatMap(e => e.sources.map(s => s.name))
  ).size;

  const filtered = useMemo(() => {
    let result = [...events];
    if (search)
      result = result.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.location || "").toLowerCase().includes(search.toLowerCase())
      );
    if (category !== "all")
      result = result.filter(e => e.category === category);
    if (price === "free")
      result = result.filter(e => e.price_value === 0);
    else if (price === "paid")
      result = result.filter(e => e.price_value > 0);
    if (dateFrom)
      result = result.filter(e => e.date_start >= dateFrom);
    if (dateTo)
      result = result.filter(e => e.date_start <= dateTo);
    result.sort((a, b) => {
      if (sortBy === "date")    return (a.date_start || "").localeCompare(b.date_start || "");
      if (sortBy === "price")   return (a.price_value ?? 999) - (b.price_value ?? 999);
      if (sortBy === "sources") return b.sources.length - a.sources.length;
      return 0;
    });
    return result;
  }, [search, category, price, dateFrom, dateTo, sortBy]);

  return (
    <>
      <style>{styles}</style>

      {/* Background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 80% 50% at 20% -10%, rgba(232,99,26,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 110%, rgba(180,60,10,0.08) 0%, transparent 60%),
          #0a0e1a
        `
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <header style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "80px 24px 60px",
          borderBottom: "1px solid rgba(255,255,255,0.07)"
        }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 500, letterSpacing: "0.15em",
              textTransform: "uppercase", color: "#e8631a",
              background: "rgba(232,99,26,0.12)",
              padding: "4px 12px", borderRadius: 999,
            }}>
              🔥 Updated daily
            </span>
          </div>
          <h1 className="hero-title">What's on in<br />València</h1>
          <p className="hero-subtitle">your city, your weekend</p>
          <div className="stat" style={{
            display: "flex", gap: 32, marginTop: 32,
            paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)"
          }}>
            {[
              { n: events.length, label: "events" },
              { n: uniqueSources, label: "sources" },
              { n: new Set(events.map(e => e.category)).size, label: "categories" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 36, fontWeight: 700, lineHeight: 1,
                  color: "#e8631a"
                }}>{n}</div>
                <div style={{ fontSize: 12, color: "rgba(232,224,208,0.5)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Sticky filter bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(10,14,26,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px" }}>

            {/* View tabs + search row */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{
                display: "flex", gap: 4,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: 3,
              }}>
                {VIEWS.map(v => (
                  <button
                    key={v}
                    className={`view-tab${view === v ? " active" : ""}`}
                    onClick={() => setView(v)}
                  >{v}</button>
                ))}
              </div>
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{
                  position: "absolute", left: 16, top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18, opacity: 0.4, pointerEvents: "none"
                }}>🔍</span>
                <input
                  className="search-input"
                  placeholder="Search events, venues, descriptions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category pills */}
            <div style={{
              display: "flex", gap: 8, overflowX: "auto",
              paddingBottom: 4, marginBottom: 12,
              scrollbarWidth: "none",
            }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`cat-pill${category === c.id ? " active" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Date + price + sort row — hidden in calendar views */}
            {view === "List" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="filter-select" title="From date" />
                <span style={{ color: "rgba(232,224,208,0.3)", fontSize: 12 }}>→</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="filter-select" title="To date" />
                <select value={price} onChange={e => setPrice(e.target.value)} className="filter-select">
                  <option value="all">Any price</option>
                  <option value="free">Free only</option>
                  <option value="paid">Paid only</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
                  <option value="date">Sort: date</option>
                  <option value="price">Sort: price</option>
                  <option value="sources">Sort: sources</option>
                </select>
                <span className="results-count" style={{ marginLeft: "auto" }}>
                  {filtered.length} / {events.length} events
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
          {view === "List" && (
            filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(232,224,208,0.3)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24 }}>No events found</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your filters</div>
              </div>
            ) : (
              filtered.map((event, i) => (
                <div key={event.id} className="event-item"
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
                  <EventCard event={event} />
                  {i < filtered.length - 1 && <div className="divider" />}
                </div>
              ))
            )
          )}

          {view === "Week" && <WeekView events={filtered} />}
          {view === "Month" && <MonthView events={filtered} />}
        </main>

        <footer style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "24px",
          textAlign: "center",
          fontSize: 12,
          color: "rgba(232,224,208,0.25)"
        }}>
          València Events · scraped daily · open source
        </footer>
      </div>
    </>
  );
}
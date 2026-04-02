import { useState, useMemo } from "react";
import events from "./events.json";
import EventCard from "./components/EventCard.jsx";

const CATEGORIES = [
  "all", "concert", "film", "sport", "market",
  "guided_tour", "fireworks", "exhibition", "theatre", "festival", "other"
];

const PRICES = ["all", "free", "paid"];

export default function App() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [price,    setPrice]    = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [sortBy,   setSortBy]   = useState("date");

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
      if (sortBy === "date")
        return (a.date_start || "").localeCompare(b.date_start || "");
      if (sortBy === "price")
        return (a.price_value ?? 999) - (b.price_value ?? 999);
      if (sortBy === "sources")
        return b.sources.length - a.sources.length;
      return 0;
    });

    return result;
  }, [search, category, price, dateFrom, dateTo, sortBy, events]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>

      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          🎉 Valencia Events
        </h1>
        <p style={{ color: "#666", fontSize: 14 }}>
          {events.length} events from {new Set(events.flatMap(e => e.sources.map(s => s.name))).size} sources · updated daily
        </p>
      </header>

      {/* Filters */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "1rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
      }}>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
          ))}
        </select>
        <select value={price} onChange={e => setPrice(e.target.value)} style={inputStyle}>
          <option value="all">Any price</option>
          <option value="free">Free only</option>
          <option value="paid">Paid only</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={inputStyle}
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={inputStyle}
          title="To date"
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
          <option value="date">Sort by date</option>
          <option value="price">Sort by price</option>
          <option value="sources">Sort by sources</option>
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, color: "#888", marginBottom: "1rem" }}>
        Showing {filtered.length} of {events.length} events
      </p>

      {/* Event grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filtered.length === 0
          ? <p style={{ color: "#999", textAlign: "center", padding: "3rem" }}>No events match your filters.</p>
          : filtered.map(event => <EventCard key={event.id} event={event} />)
        }
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "0.5rem 0.75rem",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
  background: "#fafafa",
  outline: "none",
  cursor: "pointer",
};
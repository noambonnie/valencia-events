import sqlite3, json
from pathlib import Path
from datetime import date, timedelta

DB_PATH = Path(__file__).parent.parent / "events.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS events (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                fingerprint  TEXT    UNIQUE NOT NULL,
                title        TEXT    NOT NULL,
                date_start   TEXT,
                date_end     TEXT,
                time_start   TEXT,
                location     TEXT,
                district     TEXT,
                category     TEXT,
                price        TEXT,
                price_value  REAL,
                description  TEXT,
                image_url    TEXT,
                sources      TEXT    NOT NULL,
                first_seen   TEXT    NOT NULL,
                last_updated TEXT    NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_date        ON events(date_start);
            CREATE INDEX IF NOT EXISTS idx_category    ON events(category);
            CREATE INDEX IF NOT EXISTS idx_fingerprint ON events(fingerprint);

            CREATE TABLE IF NOT EXISTS scrape_log (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id        TEXT,
                ran_at           TEXT,
                events_found     INTEGER,
                events_new       INTEGER,
                events_updated   INTEGER,
                error            TEXT
            );
        """)

def upsert_event(event: dict) -> str:
    """Insert new event or merge sources if fingerprint exists.
    Returns 'new' | 'updated' | 'skipped'."""
    with get_conn() as conn:
        existing = conn.execute(
            "SELECT id, sources FROM events WHERE fingerprint = ?",
            (event["fingerprint"],)
        ).fetchone()

        if existing:
            old_sources = json.loads(existing["sources"])
            new_source  = event["sources"][0]
            known_urls  = {s["url"] for s in old_sources}
            if new_source["url"] in known_urls:
                return "skipped"
            merged = old_sources + [new_source]
            conn.execute(
                "UPDATE events SET sources=?, last_updated=? WHERE id=?",
                (json.dumps(merged, ensure_ascii=False),
                 event["last_updated"], existing["id"])
            )
            return "updated"
        else:
            cols = ", ".join(event.keys())
            vals = ", ".join(["?"] * len(event))
            conn.execute(
                f"INSERT INTO events ({cols}) VALUES ({vals})",
                [json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list))
                 else v for v in event.values()]
            )
            return "new"

def delete_past_events(days_ago=0):
    """Prune events that started before today."""
    cutoff = (date.today() - timedelta(days=days_ago)).isoformat()
    with get_conn() as conn:
        conn.execute(
            "DELETE FROM events WHERE date_start <= ?", (cutoff,)
        )

def export_to_json(path: Path):
    """Dump all future events to JSON for the frontend build."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM events ORDER BY date_start ASC"
        ).fetchall()
    events = []
    for r in rows:
        e = dict(r)
        e["sources"] = json.loads(e["sources"])
        events.append(e)
    path.write_text(json.dumps(events, ensure_ascii=False, indent=2))
    
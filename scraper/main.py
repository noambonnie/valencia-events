import json
from pathlib import Path
from datetime import datetime, timezone

from db      import init_db, upsert_event, delete_past_events, export_to_json
from fetch   import fetch_source
from extract import extract_events
from dedupe  import make_fingerprint

SOURCES_PATH  = Path(__file__).parent.parent / "sources.json"
FRONTEND_DATA = Path(__file__).parent.parent / "frontend" / "src" / "events.json"

def run():
    print(f"\n=== Valencia Events Scraper — {datetime.now().isoformat()} ===\n")

    init_db()
    delete_past_events(days_ago=0)

    sources = json.loads(SOURCES_PATH.read_text())
    enabled = [s for s in sources if s.get("enabled", True)]
    print(f"Sources enabled: {len(enabled)}\n")

    total_new = total_updated = 0

    for source in enabled:
print(f"[{source['id']}] Fetching {source['url']} ...")

        if source.get("follow_links"):
            # Two-pass: get listing page, follow article links, extract from each
            from fetch import fetch_html, fetch_js, fetch_event_article_links, extract_main_content
            raw_html = (fetch_js if source["type"] == "js" else fetch_html)(source["url"])
            if not raw_html:
                continue
            links = fetch_event_article_links(raw_html, source["url"])
            print(f"[{source['id']}] Following {len(links)} article links ...")
            all_events = []
            for link in links:
                try:
                    article_html = fetch_html(link)
                    article_content = extract_main_content(article_html)
                    found = extract_events(article_content, {**source, "url": link})
                    print(f"  {link} → {len(found)} events")
                    all_events.extend(found)
                except Exception as e:
                    print(f"  Failed {link}: {e}")
            events = all_events
        else:
            content = fetch_source(source)
            if not content:
                continue
            print(f"[{source['id']}] Extracting events ...")
            events = extract_events(content, source)
            
        print(f"[{source['id']}] Found {len(events)} events")

        new = updated = 0
        now = datetime.now(timezone.utc).isoformat()

        for raw in events:
            fingerprint = make_fingerprint(raw)
            record = {
                "fingerprint":   fingerprint,
                "title":         raw.get("title", "Untitled"),
                "date_start":    raw.get("date_start"),
                "date_end":      raw.get("date_end"),
                "time_start":    raw.get("time_start"),
                "location":      raw.get("location"),
                "district":      raw.get("district"),
                "category":      raw.get("category", "other"),
                "price":         raw.get("price"),
                "price_value":   raw.get("price_value"),
                "description":   raw.get("description"),
                "image_url":     raw.get("image_url"),
                "sources":       [{"name": source["name"],
                                   "url":  raw.get("url") or source["url"],
                                   "scraped_at": now}],
                "first_seen":    now,
                "last_updated":  now,
            }
            result = upsert_event(record)
            if result == "new":     new     += 1
            if result == "updated": updated += 1

        print(f"[{source['id']}] +{new} new, ~{updated} updated\n")
        total_new     += new
        total_updated += updated

    print(f"=== Done. Total: +{total_new} new, ~{total_updated} updated ===\n")

    print("Exporting events.json for frontend ...")
    FRONTEND_DATA.parent.mkdir(parents=True, exist_ok=True)
    export_to_json(FRONTEND_DATA)
    print("Done.\n")

if __name__ == "__main__":
    run()
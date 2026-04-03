import json
import anthropic
from datetime import date

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from environment

SYSTEM_PROMPT = """You are an event extraction assistant.
You will be given text scraped from a Spanish events website.
Extract ONLY events whose date_start is on or after {today}.
Ignore any events, articles or listings from before {today} — even if they appear on the page.
If you are unsure of the date, skip the event entirely.

For each qualifying event return exactly these fields:
- title: string (in original language)
- url: the specific URL of this event's detail page if you can find it in the text, otherwise null
- date_start: ISO 8601 date string YYYY-MM-DD, or null if unknown
- date_end: ISO 8601 date string YYYY-MM-DD, or null if single day
- time_start: HH:MM string in 24h format, or null if unknown
- location: string, venue or address, or null
- district: string, neighbourhood or district within Valencia, or null
- category: one of: concert|film|sport|market|guided_tour|fireworks|exhibition|theatre|festival|other
- price: human-readable string e.g. 'Gratis', '€5', '€10-20', or null if unknown
- price_value: numeric value in euros (0 if free, lowest price if range, null if unknown)
- description: 1-2 sentence summary in English
- image_url: absolute URL to event image, or null

Return ONLY a valid JSON array, no explanation, no markdown fences.
If no qualifying events are found return an empty array [].
Today's date is {today}."""

def extract_events(content: str, source: dict) -> list[dict]:
    """Send scraped content to Claude and get back structured events."""
    if not content or not content.strip():
        return []

    today = date.today().isoformat()
    prompt = SYSTEM_PROMPT.format(today=today)

    try:
        message = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            system=prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"Extract all events from this text scraped from {source['name']}:\n\n{content}"
                }
            ]
        )
        raw = message.content[0].text.strip()
        # Strip markdown fences if the model adds them despite instructions
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
        events = json.loads(raw)
        return events if isinstance(events, list) else []
    except json.JSONDecodeError as e:
        print(f"  JSON parse error for {source['id']}: {e}")
        return []
    except Exception as e:
        print(f"  Claude extraction error for {source['id']}: {e}")
        return []

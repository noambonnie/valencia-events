import re
import unicodedata

STOP_WORDS = {"de", "la", "el", "en", "a", "y", "los", "las", "del", "al", "un", "una"}

def _normalize(text: str) -> str:
    """Lowercase, strip accents, remove punctuation."""
    if not text:
        return ""
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s]", "", text)
    return text

def _title_slug(title: str) -> str:
    """First 4 significant words of the title."""
    words = _normalize(title).split()
    significant = [w for w in words if w not in STOP_WORDS]
    return "-".join(significant[:4])

def make_fingerprint(event: dict) -> str:
    """
    Build a deduplication key from date + location + title slug.
    Two events with the same fingerprint are considered the same real-world event.
    """
    date  = (event.get("date_start") or "unknown")[:10]  # just YYYY-MM-DD
    loc   = _normalize(event.get("location") or "unknown")[:20]
    slug  = _title_slug(event.get("title") or "untitled")
    return f"{date}__{loc}__{slug}"
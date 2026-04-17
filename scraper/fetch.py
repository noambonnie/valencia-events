import httpx
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

def fetch_html(url: str) -> str:
    """Fetch a plain HTML page. Fast, no browser needed."""
    with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=30) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.text

def fetch_js(url: str, wait_for_selector: str = None) -> str:
    """Fetch a JS-rendered page using a headless browser.
    Optionally wait for a specific CSS selector to appear before extracting."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(extra_http_headers=HEADERS)
        page.goto(url, wait_until="networkidle", timeout=60000)
        if wait_for_selector:
            try:
                page.wait_for_selector(wait_for_selector, timeout=15000)
            except Exception:
                pass  # proceed anyway, content may have loaded differently
        # Extra wait for any remaining async rendering
        page.wait_for_timeout(2000)
        content = page.content()
        browser.close()
        return content

def extract_main_content(html: str) -> str:
    """Strip boilerplate (nav, footer, scripts) to reduce tokens sent to Claude."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()
    # Return just the text-rich portion, capped at ~12k chars to stay within token limits
    text = soup.get_text(separator="\n", strip=True)
    return text[:12000]

def fetch_source(source: dict) -> str | None:
    """Main entry point. Picks strategy based on source type."""
    try:
        if source["type"] == "html":
            html = fetch_html(source["url"])
        elif source["type"] == "js":
            html = fetch_js(source["url"], wait_for_selector=source.get("wait_for"))
        elif source["type"] == "rss":
            return fetch_html(source["url"])
        else:
            print(f"  Unknown type '{source['type']}' for {source['id']}, skipping")
            return None
        return extract_main_content(html)
    except Exception as e:
        print(f"  Failed to fetch {source['id']}: {e}")
        return None
        
def fetch_event_article_links(html: str, base_url: str) -> list[str]:
    """
    From a blog-style listing page, extract links that look like
    recent event articles — identified by having a year/month in the URL
    and being published recently.
    """
    from urllib.parse import urljoin, urlparse
    from datetime import date
    import re

    soup = BeautifulSoup(html, "html.parser")
    base_domain = urlparse(base_url).netloc
    current_year = date.today().year
    last_year = current_year - 1

    links = []
    seen = set()

    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"])
        parsed = urlparse(href)

        # Same domain only
        if parsed.netloc != base_domain:
            continue
        # Must look like a dated article URL e.g. /2026/04/some-article/
        if not re.search(rf"/{current_year}/|/{last_year}/", parsed.path):
            continue
        # Skip category, tag, author pages
        if any(x in parsed.path for x in ["/category/", "/tag/", "/author/", "/page/"]):
            continue
        if href not in seen:
            seen.add(href)
            links.append(href)

    return links[:20]  # fetch at most 20 articles per source per run
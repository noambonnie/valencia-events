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

def fetch_js(url: str) -> str:
    """Fetch a JS-rendered page using a headless browser."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(extra_http_headers=HEADERS)
        page.goto(url, wait_until="networkidle", timeout=60000)
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
            html = fetch_js(source["url"])
        elif source["type"] == "rss":
            return fetch_html(source["url"])  # RSS is plain XML, no cleaning needed
        else:
            print(f"  Unknown type '{source['type']}' for {source['id']}, skipping")
            return None
        return extract_main_content(html)
    except Exception as e:
        print(f"  Failed to fetch {source['id']}: {e}")
        return None
        
def fetch_links_from_page(html: str, base_url: str) -> list[str]:
    """Extract all internal links that look like event detail pages."""
    from urllib.parse import urljoin, urlparse
    soup = BeautifulSoup(html, "html.parser")
    base_domain = urlparse(base_url).netloc
    links = []
    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"])
        # Only follow links on the same domain
        if urlparse(href).netloc == base_domain and href != base_url:
            links.append(href)
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for l in links:
        if l not in seen:
            seen.add(l)
            unique.append(l)
    return unique[:30]  # cap at 30 to avoid runaway fetching
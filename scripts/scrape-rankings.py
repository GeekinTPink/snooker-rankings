#!/usr/bin/env python3
"""
Fetch WST-style ranking list from English Wikipedia season pages.
Prefers the "prize money / ranking points" sortable table when present;
otherwise uses the final seeding revision column from the seeding table.

Requires: Python 3.9+ (stdlib only).
"""

from __future__ import annotations

import json
import re
import shutil
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from html import unescape
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "src" / "data"
OUTPUT_FILE = DATA_DIR / "rankings-data.json"
BACKUP_DIR = DATA_DIR / "backups"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# Newest season first. Missing pages are skipped until one resolves.
WIKI_PAGES = [
    "2025–26 snooker world rankings",
    "2024–25 snooker world rankings",
    "2023–24 snooker world rankings",
    "2022–23 snooker world rankings",
]

COUNTRY_MAP = {
    "ENG": "England",
    "NIR": "Northern Ireland",
    "SCO": "Scotland",
    "WAL": "Wales",
    "IRL": "Ireland",
    "CHN": "China",
    "HKG": "Hong Kong",
    "THA": "Thailand",
    "AUS": "Australia",
    "BEL": "Belgium",
    "MLT": "Malta",
    "IND": "India",
    "IRN": "Iran",
    "ISR": "Israel",
    "PAK": "Pakistan",
    "EGY": "Egypt",
    "AUT": "Austria",
    "GER": "Germany",
    "FIN": "Finland",
    "POL": "Poland",
    "UKR": "Ukraine",
    "LAT": "Latvia",
    "BRA": "Brazil",
    "CAN": "Canada",
    "USA": "United States",
    "NZL": "New Zealand",
    "RSA": "South Africa",
    "NOR": "Norway",
    "SWE": "Sweden",
    "ESP": "Spain",
    "FRA": "France",
    "CYP": "Cyprus",
    "UAE": "United Arab Emirates",
}


def fetch_wikipedia_html(title: str) -> str | None:
    params = urllib.parse.urlencode(
        {
            "action": "parse",
            "page": title,
            "prop": "text",
            "format": "json",
        }
    )
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (compatible; SnookerRankingsFetcher/1.0; "
                "+https://github.com/) Python-urllib"
            ),
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.load(resp)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        return None
    if "error" in data or "parse" not in data:
        return None
    return data["parse"]["text"]["*"]


def strip_tags(fragment: str) -> str:
    text = re.sub(r"<br\s*/?>", " ", fragment, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return unescape(text)


def extract_sortable_tables(html: str) -> list[str]:
    return re.findall(
        r'<table class="[^"]*\bwikitable\b[^"]*\bsortable\b[^"]*"[^>]*>(.*?)</table>',
        html,
        flags=re.DOTALL | re.IGNORECASE,
    )


def parse_name_country(cell: str) -> tuple[str, str] | None:
    text = strip_tags(cell)
    text = re.sub(r"\s+", " ", text).strip()
    if not text or text.lower() == "name":
        return None
    m = re.match(r"^(.+?)\s*\(([A-Z]{2,4})\)\s*$", text)
    if m:
        name, code = m.group(1).strip(), m.group(2).upper()
        country = COUNTRY_MAP.get(code, code)
        return name, country
    return text, "—"


def last_cell_numeric_rank(s: str) -> int | None:
    t = strip_tags(s)
    t = re.sub(r"\s+", "", t)
    if not t.isdigit():
        return None
    v = int(t)
    if 1 <= v <= 200:
        return v
    return None


def last_cell_money(s: str) -> int | None:
    t = strip_tags(s)
    t = re.sub(r"\s+", "", t)
    digits = re.sub(r"[^\d]", "", t)
    if not digits:
        return None
    v = int(digits)
    if v >= 1000:
        return v
    return None


def table_rows(table_inner: str) -> list[str]:
    return re.findall(r"<tr[^>]*>(.*?)</tr>", table_inner, flags=re.DOTALL | re.IGNORECASE)


def parse_money_table(table: str) -> list[dict] | None:
    rows = table_rows(table)
    out: list[dict] = []
    for r in rows:
        cells = re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, flags=re.DOTALL | re.IGNORECASE)
        if len(cells) < 3:
            continue
        parsed = parse_name_country(cells[0])
        if not parsed:
            continue
        name, country = parsed
        pts = last_cell_money(cells[-1])
        if pts is None:
            continue
        out.append({"name": name, "country": country, "points": pts})
    if len(out) < 32:
        return None
    out.sort(key=lambda x: -x["points"])
    for i, row in enumerate(out, start=1):
        row["rank"] = i
        row["trend"] = "same"
    return out


def parse_seeding_table(table: str) -> list[dict] | None:
    rows = table_rows(table)
    tmp: list[tuple[int, str, str]] = []
    for r in rows:
        cells = re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, flags=re.DOTALL | re.IGNORECASE)
        if len(cells) < 2:
            continue
        parsed = parse_name_country(cells[0])
        if not parsed:
            continue
        name, country = parsed
        rk = last_cell_numeric_rank(cells[-1])
        if rk is None:
            continue
        tmp.append((rk, name, country))
    if len(tmp) < 32:
        return None
    tmp.sort(key=lambda x: (x[0], x[1]))
    out: list[dict] = []
    for i, (_wiki_rk, name, country) in enumerate(tmp, start=1):
        pts = max(0, 1_800_000 - (i - 1) * 12_800)
        out.append(
            {
                "rank": i,
                "name": name,
                "country": country,
                "points": pts,
                "trend": "same",
            }
        )
    return out


def pick_players_from_html(html: str, page_title: str) -> tuple[list[dict], str] | None:
    tables = extract_sortable_tables(html)
    if not tables:
        return None

    for t in tables:
        money = parse_money_table(t)
        if money:
            note = f"Wikipedia — {page_title} (ranking points / prize money, last revision column)"
            return money[:128], note

    for t in tables:
        seed = parse_seeding_table(t)
        if seed:
            note = (
                f"Wikipedia — {page_title} (final seeding revision; "
                "points shown as approximate spacing — run again when the season page adds a money table)"
            )
            return seed[:128], note

    return None


def load_rankings() -> tuple[list[dict], str, str]:
    for title in WIKI_PAGES:
        html = fetch_wikipedia_html(title)
        if not html:
            continue
        got = pick_players_from_html(html, title)
        if got:
            players, note = got
            return players, note, title
    raise RuntimeError("Could not load rankings from any configured Wikipedia page.")


def save_rankings(players: list[dict], source: str) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).isoformat()
    if OUTPUT_FILE.exists():
        backup = BACKUP_DIR / f"rankings-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        shutil.copy2(OUTPUT_FILE, backup)
        print(f"Backed up to {backup}")

    payload = {
        "lastUpdated": ts,
        "source": source,
        "playerCount": len(players),
        "players": players,
    }
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Saved {len(players)} players to {OUTPUT_FILE}")


def main() -> None:
    print("=" * 60)
    print("Snooker rankings (Wikipedia)")
    print(datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
    print("=" * 60)
    players, source, title = load_rankings()
    print(f"Page: {title}")
    save_rankings(players, source)
    print("Done.")


if __name__ == "__main__":
    main()

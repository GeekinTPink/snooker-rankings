#!/usr/bin/env python3
"""
Refresh src/data/rankings-data.json from (in order):

  1. CSV file — pass --csv path or set env RANKINGS_CSV
  2. snooker.org JSON API — set env SNOOKER_ORG_REQUESTED_BY (approved by webmaster@snooker.org)
  3. English Wikipedia season pages (fallback)

API docs: https://api.snooker.org/

Requires: Python 3.9+ (stdlib only).
"""

from __future__ import annotations

import argparse
import csv
import json
import os
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

HTTP_HEADERS_WIKI = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; SnookerRankingsFetcher/1.0; +https://github.com/) Python-urllib"
    ),
    "Accept": "application/json",
}


def fetch_wikipedia_html(title: str) -> str | None:
    params = urllib.parse.urlencode(
        {"action": "parse", "page": title, "prop": "text", "format": "json"}
    )
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers=HTTP_HEADERS_WIKI)
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


def snooker_api_get(query: str, requested_by: str) -> list | None:
    """query like ?t=20 or ?rt=MoneyRankings&s=2025"""
    q = query if query.startswith("?") else f"?{query}"
    url = f"https://api.snooker.org/{q}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; SnookerRankings/1.0) Python-urllib",
            "Accept": "application/json",
            "X-Requested-By": requested_by,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"snooker.org HTTP {e.code}: {body}") from e
    except (urllib.error.URLError, TimeoutError) as e:
        raise RuntimeError(f"snooker.org request failed: {e}") from e
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise RuntimeError("snooker.org returned non-JSON") from e
    if isinstance(data, dict) and data.get("message"):
        raise RuntimeError(f"snooker.org: {data}")
    return data if isinstance(data, list) else None


def player_display_name(p: dict) -> str:
    fn = (p.get("FirstName") or "").strip()
    ln = (p.get("LastName") or "").strip()
    if fn or ln:
        return f"{fn} {ln}".strip()
    return (p.get("ShortName") or "?").strip()


def load_from_snooker_org(requested_by: str) -> tuple[list[dict], str]:
    meta = snooker_api_get("?t=20", requested_by)
    if not meta or not isinstance(meta, list) or not meta:
        raise RuntimeError("snooker.org ?t=20 returned empty")
    season = meta[0].get("CurrentSeason")
    if season is None:
        raise RuntimeError("snooker.org ?t=20 missing CurrentSeason")

    players_raw = snooker_api_get(f"?t=10&st=p&s={season}", requested_by)
    if not players_raw:
        raise RuntimeError("snooker.org player list empty")

    by_id: dict[int, dict] = {}
    for p in players_raw:
        if not isinstance(p, dict):
            continue
        pid = p.get("ID")
        if isinstance(pid, int):
            by_id[pid] = {
                "name": player_display_name(p),
                "country": (p.get("Nationality") or "—").strip() or "—",
            }

    def fetch_rankings(q: str) -> list:
        r = snooker_api_get(q, requested_by)
        return r if r else []

    rankings = fetch_rankings(f"?rt=MoneyRankings&s={season}")
    if len(rankings) < 32:
        rankings = fetch_rankings("?rt=MoneyRankings")

    if len(rankings) < 32:
        raise RuntimeError("snooker.org MoneyRankings list too short or missing")

    rows: list[dict] = []
    for item in rankings:
        if not isinstance(item, dict):
            continue
        pos = item.get("Position")
        pid = item.get("PlayerID")
        pts = item.get("Sum")
        if not isinstance(pos, int) or not isinstance(pid, int):
            continue
        if not isinstance(pts, int):
            pts = int(pts) if pts is not None else 0
        info = by_id.get(pid)
        if not info:
            solo = snooker_api_get(f"?p={pid}", requested_by)
            if solo and isinstance(solo, list) and solo and isinstance(solo[0], dict):
                p0 = solo[0]
                info = {
                    "name": player_display_name(p0),
                    "country": (p0.get("Nationality") or "—").strip() or "—",
                }
                by_id[pid] = info
            else:
                info = {"name": f"Player #{pid}", "country": "—"}
        rows.append(
            {
                "rank": pos,
                "name": info["name"],
                "country": info["country"],
                "points": pts,
                "trend": "same",
            }
        )

    rows.sort(key=lambda x: (x["rank"], -x["points"], x["name"]))
    out = rows[:128]
    for i, r in enumerate(out, start=1):
        r["rank"] = i
    src = (
        f"snooker.org API — MoneyRankings, season {season}/{season + 1} "
        f"(https://api.snooker.org/ — mention source per their terms)"
    )
    return out, src


def _csv_field(row: dict[str, str], *aliases: str) -> str | None:
    keys = {k.strip().lower(): v for k, v in row.items() if k}
    for a in aliases:
        al = a.lower()
        if al in keys and keys[al].strip():
            return keys[al].strip()
    return None


def load_from_csv(path: Path) -> tuple[list[dict], str]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise RuntimeError("CSV has no header row")
        players: list[dict] = []
        for row in reader:
            if not any((v or "").strip() for v in row.values()):
                continue
            rk = _csv_field(row, "rank", "rk", "position", "#", "pos")
            name = _csv_field(row, "name", "player")
            country = _csv_field(row, "country", "nationality", "nation")
            pts = _csv_field(row, "points", "pts", "sum", "money")
            if not rk or not name:
                raise RuntimeError(f"CSV row missing rank or name: {row}")
            try:
                rank_i = int(re.sub(r"[^\d]", "", rk))
            except ValueError as e:
                raise RuntimeError(f"Bad rank in row: {row}") from e
            try:
                points_i = int(re.sub(r"[^\d-]", "", pts or "0"))
            except ValueError:
                points_i = 0
            players.append(
                {
                    "rank": rank_i,
                    "name": name.strip(),
                    "country": (country or "—").strip(),
                    "points": max(0, points_i),
                    "trend": "same",
                }
            )
    if len(players) < 8:
        raise RuntimeError("CSV: need at least 8 data rows")
    players.sort(key=lambda x: (x["rank"], x["name"]))
    for i, p in enumerate(players[:128], start=1):
        p["rank"] = i
    src = f"CSV import — {path.name}"
    return players[:128], src


def load_from_wikipedia() -> tuple[list[dict], str, str]:
    for title in WIKI_PAGES:
        html = fetch_wikipedia_html(title)
        if not html:
            continue
        got = pick_players_from_html(html, title)
        if got:
            players, note = got
            return players, note, title
    raise RuntimeError("Could not load rankings from any configured Wikipedia page.")


def resolve_rankings(csv_path: str | None) -> tuple[list[dict], str, str]:
    """
    Returns (players, source_string, kind) where kind is csv | snooker.org | wikipedia:<title>.
    """
    if csv_path:
        p = Path(csv_path)
        if not p.is_file():
            raise FileNotFoundError(f"CSV not found: {p}")
        players, src = load_from_csv(p)
        return players, src, "csv"

    env_csv = os.environ.get("RANKINGS_CSV", "").strip()
    if env_csv:
        p = Path(env_csv)
        if not p.is_file():
            raise FileNotFoundError(f"RANKINGS_CSV not found: {p}")
        players, src = load_from_csv(p)
        return players, src, "csv"

    requested_by = os.environ.get("SNOOKER_ORG_REQUESTED_BY", "").strip()
    if requested_by:
        players, src = load_from_snooker_org(requested_by)
        return players, src, "snooker.org"

    players, src, title = load_from_wikipedia()
    return players, src, f"wikipedia:{title}"


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
    parser = argparse.ArgumentParser(description="Refresh snooker rankings JSON")
    parser.add_argument(
        "--csv",
        metavar="FILE",
        help="Import from CSV (columns: rank, name, country, points — aliases supported)",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("Snooker rankings refresh")
    print(datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
    print("=" * 60)

    players, source, kind = resolve_rankings(args.csv)
    if kind == "csv":
        print("Mode: CSV import")
        print(f"File: {args.csv or os.environ.get('RANKINGS_CSV')}")
    elif kind == "snooker.org":
        print("Mode: snooker.org API (MoneyRankings)")
    else:
        print(f"Mode: Wikipedia ({kind.removeprefix('wikipedia:')})")

    save_rankings(players, source)
    print("Done.")


if __name__ == "__main__":
    main()

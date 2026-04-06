#!/usr/bin/env python3
"""
Fetch official WST world rankings from the Gamechanger API.

The /v2 response contains multiple tables in `data[]`. This script uses the
**published two-year World Rankings** (`rankingType: prizeMoney`, `live: false`),
not the provisional rolling list (`livePrizeMoney`, `live: true`), so ordering
matches WST's frozen revision (e.g. Kyren Wilson ahead of Neil Robertson).

Writes:
  - src/data/rankings-wst.json  (primary / fresh snapshot for rankings.ts)
  - src/data/rankings-data.json (same payload as fallback when WST file is >24h old)

API returns up to 100 positions per table (no public pagination found).

Requires: Python 3.9+ (stdlib only).
"""

from __future__ import annotations

import csv
import json
import shutil
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "src" / "data"
WST_OUT = DATA_DIR / "rankings-wst.json"
DATA_OUT = DATA_DIR / "rankings-data.json"
CSV_OUT = ROOT / "data" / "rankings-wst.csv"
BACKUP_DIR = DATA_DIR / "backups"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://rankings.snooker.web.gc.wstservices.co.uk/v2"

COUNTRY_MAP = {
    "ENG": "England",
    "NIR": "Northern Ireland",
    "SCT": "Scotland",
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
    "IOM": "Isle of Man",
    "QAT": "Qatar",
    "JOR": "Jordan",
    "KUW": "Kuwait",
    "BRN": "Bahrain",
    "KSA": "Saudi Arabia",
}

# Country display name -> WST-style code (for CSV / manual tooling)
COUNTRY_CODE_REVERSE = {v: k for k, v in COUNTRY_MAP.items()}


def pick_world_rankings_entry(rows: list) -> tuple[dict, str]:
    """
    Returns (attributes dict, selection_note).

    Prefer official published list over live provisional totals.
    """
    if not rows:
        raise SystemExit("Unexpected API response: empty data[]")

    def attrs(item: dict) -> dict:
        return item.get("attributes") or {}

    official: list[tuple[dict, dict]] = []
    live: list[tuple[dict, dict]] = []
    for item in rows:
        if not isinstance(item, dict):
            continue
        a = attrs(item)
        if (a.get("name") or "").strip() != "World Rankings":
            continue
        rt = a.get("rankingType")
        if rt == "prizeMoney" and a.get("live") is False:
            official.append((item, a))
        elif rt == "livePrizeMoney" and a.get("live") is True:
            live.append((item, a))

    if official:
        _item, a = official[0]
        return a, "World Rankings · prizeMoney · published (official revision)"
    if live:
        _item, a = live[0]
        return a, "World Rankings · livePrizeMoney · provisional (fallback)"
    a = attrs(rows[0])
    return a, "first data[] entry (fallback)"


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; SnookerRankingsFetcher/1.1; +https://www.wst.tv/rankings/) Python-urllib",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=45) as resp:
        return json.load(resp)


def main() -> None:
    raw = fetch_json(API_URL)
    rows = raw.get("data") or []
    if not rows or not isinstance(rows[0], dict):
        raise SystemExit("Unexpected API response: missing data[]")

    attr, pick_note = pick_world_rankings_entry(rows)
    positions = attr.get("positions") or []
    if len(positions) < 8:
        raise SystemExit("Too few ranking positions in API response")

    name_hint = (attr.get("name") or "World Rankings").strip()
    recalc = (attr.get("recalculateAfter") or "").strip()
    source = (
        f"WST Gamechanger API — {name_hint} — {pick_note}"
        + (f" · {recalc}" if recalc else "")
        + f" — {API_URL}"
    )

    players: list[dict] = []
    for pos in positions:
        if not isinstance(pos, dict):
            continue
        rank = pos.get("position")
        money = pos.get("prizeMoney")
        pl = pos.get("player") or {}
        if not isinstance(rank, int) or not isinstance(pl, dict):
            continue
        fn = (pl.get("firstName") or "").strip()
        sn = (pl.get("surname") or "").strip()
        display = f"{fn} {sn}".strip() or (pl.get("nickname") or "?").strip()
        cc = (pl.get("country") or "").strip().upper() or "—"
        country = COUNTRY_MAP.get(cc, cc if cc else "—")
        pts = int(money) if isinstance(money, int) else int(money or 0)
        players.append(
            {
                "rank": rank,
                "name": display,
                "country": country,
                "points": pts,
                "trend": "same",
            }
        )

    players.sort(key=lambda x: (x["rank"], x["name"]))
    for i, p in enumerate(players, start=1):
        p["rank"] = i

    ts = datetime.now(timezone.utc).isoformat()
    payload = {
        "lastUpdated": ts,
        "source": source,
        "playerCount": len(players),
        "players": players,
    }
    text = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for path in (WST_OUT, DATA_OUT):
        if path.exists():
            backup = BACKUP_DIR / f"{path.stem}-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
            shutil.copy2(path, backup)
            print(f"Backed up {path.name} -> {backup.name}")

    WST_OUT.write_text(text, encoding="utf-8")
    DATA_OUT.write_text(text, encoding="utf-8")
    CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
    with CSV_OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["rank", "name", "country", "prize_money"])
        for p in players:
            code = COUNTRY_CODE_REVERSE.get(p["country"], p["country"])
            w.writerow([p["rank"], p["name"], code, p["points"]])
    print(f"Wrote {len(players)} players to {WST_OUT.name} and {DATA_OUT.name}")
    print(f"Wrote {CSV_OUT.relative_to(ROOT)}")
    print(f"lastUpdated={ts}")


if __name__ == "__main__":
    main()

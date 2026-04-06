---
name: fetch-wst-snooker-rankings
description: >-
  Fetches WST world snooker rankings from the Gamechanger JSON API, selecting
  the official published prize-money table (not the provisional live rollup),
  refreshes repo JSON/CSV, and documents top-64 UI slicing. Use when updating
  snooker rankings, fixing wrong player order, or when the user mentions WST,
  World Snooker Tour rankings, Kyren Wilson, rankings:fetch, or top 64.
read_when:
  - Refreshing or fixing snooker world rankings / WST prize-money data
  - Rankings look wrong (e.g. provisional live list vs official revision)
  - Working in the snooker-rankings repository
  - User mentions World Snooker Tour rankings, WST Gamechanger API, rankings:fetch, or top 64 players
metadata: {"clawdbot":{"emoji":"🎱","requires":{"bins":["python3"]}}}
---

# WST world snooker rankings (official table + top 64)

## Do not scrape `wst.tv/rankings` HTML

The Nuxt SSR payload sets `rankings: void 0`; the table is filled in the browser. **Use the public Gamechanger rankings API instead.**

## Official API

- **URL:** `https://rankings.snooker.web.gc.wstservices.co.uk/v2`
- **Method:** `GET`, header `Accept: application/json`
- **Critical:** `response.data` is an **array of several ranking tables** (World Rankings live + published, one-year lists, series orders, etc.). **Do not use `data[0]` blindly.**

### Which row to use for “World Rankings”

| Goal | Pick `data[]` item where |
|------|---------------------------|
| **Official two-year list** (matches WST revision / seeding, e.g. Kyren Wilson ahead of Neil Robertson) | `attributes.name == "World Rankings"` **and** `attributes.rankingType == "prizeMoney"` **and** `attributes.live == false` |
| Provisional rolling money (can reorder mid-window) | `name == "World Rankings"` **and** `rankingType == "livePrizeMoney"` **and** `attributes.live == true` |

Repo script **`scripts/fetch-wst-rankings.py`** implements: **published `prizeMoney` first**, then fallback to **live `livePrizeMoney`**, then `data[0]`.

### Position fields

Under `attributes.positions[]`: `position` (rank), `prizeMoney`, nested `player` (`firstName`, `surname`, `country` e.g. `ENG`).

**Limitation:** ~**100** rows per table; no reliable public pagination. Beyond that, use snooker.org (approved header) or CSV — see `scripts/scrape-rankings.py`.

## Repository layout (`snooker-rankings`)

### Refresh bundled data

```bash
pnpm rankings:fetch
python3 scripts/fetch-wst-rankings.py
```

**Writes:** `src/data/rankings-wst.json`, `src/data/rankings-data.json`, `data/rankings-wst.csv` (backups under `src/data/backups/`, gitignored).

### Show only top 64 in the app

`src/data/rankings.ts`: **`TOP_DISPLAY_COUNT = 64`**, `players = allPlayers.slice(0, TOP_DISPLAY_COUNT)`.

## Agent checklist

1. If rankings **order** looks wrong, confirm the script uses **published `prizeMoney`** for World Rankings, not only **live** `livePrizeMoney`.
2. Prefer **`fetch-wst-rankings.py`** over Wikipedia-only **`scrape-rankings.py`** for WST world rankings.
3. After JSON changes, run **`pnpm build`** if verifying the app.
4. For **> ~100** players with official points, plan **snooker.org** or **CSV** import.

## Related files

- `scripts/fetch-wst-rankings.py` — API fetch, table selection, JSON + CSV
- `scripts/scrape-rankings.py` — CSV / snooker.org / Wikipedia fallbacks
- `src/data/rankings.ts` — WST vs fallback, top 64 slice

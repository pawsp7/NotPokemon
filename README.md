# Routewild — RPG Maker XP project

This branch reconfigures **Routewild** for editing and playtesting inside **RPG Maker XP** (RGSS). All original assets and mechanics are preserved.

| Location | Contents |
|----------|----------|
| `Graphics/` | RMXP-ready characters, battlers, panoramas, icons, tileset |
| `Audio/BGM`, `Audio/SE` | Per-area music + gameplay sound effects (WAV) |
| `PBS/` | Plain-text database (creatures, moves, maps, items, cosmetics…) |
| `Scripts/` | RGSS Ruby scripts implementing the same systems as the web game |
| `web/` | **Original browser game intact** (reference / fallback) |
| `Tools/` | Script packer for `Data/Scripts.rxdata` |

> **This branch is not merged into `main`.** The live GitHub Pages site stays on the web build.

---

## Open in RPG Maker XP

RPG Maker XP ships `Game.exe` and default `Data/*.rxdata` with a blank project. Those binaries are proprietary and are **not** included here.

### Setup (once)

1. Install **RPG Maker XP** (and RTP if prompted).
2. In RMXP: **File → New Project** (e.g. `RoutewildBlank`). This creates `Game.exe`, `RGSS*.dll`, and `Data/*.rxdata`.
3. Copy into **this** repo folder (overwrite when asked):
   - `Game.exe`
   - `RGSS104E.dll` (or the DLL named in your blank project’s `Game.ini`)
   - Every file in `Data/` **except** you will replace scripts next
4. From this repo root, pack scripts:

```bash
ruby Tools/pack_scripts.rb
```

5. Open `Game.rxproj` in RPG Maker XP (or double-click it).
6. If Script Editor shows empty/corrupt scripts (Ruby 1.8 Marshal mismatch):
   - Open **Script Editor**
   - Delete default scripts (keep a blank Main temporarily)
   - For each file in `Scripts/` **in numeric order**, insert a section named after the file and paste its contents
   - Ensure `999_Main.rb` is last
7. Set `Game.ini` `Library=` to match the DLL you copied.
8. Press **Playtest** (F12).

### MKXP / MKXP-Z (optional)

You can also point [MKXP-Z](https://github.com/mkxp-z/mkxp-z) at this folder after packing scripts. Use empty `RTP1=` (already set).

---

## What to edit where

| Want to change… | Edit |
|-----------------|------|
| Creature stats, moves, catch rates | `PBS/creatures.txt`, `PBS/moves.txt` |
| Type chart | `PBS/types.txt` |
| Status effects | `PBS/statuses.txt` |
| Map collision / warps / NPCs | `PBS/map_*.txt`, `PBS/maps.txt`, `PBS/world.json` |
| Shop items | `PBS/items.txt` |
| Outfits / accessories / achievements | `PBS/outfits.txt`, `PBS/accessories.txt`, `PBS/achievements.txt` |
| Travel destinations | `PBS/travel.txt` |
| Art | `Graphics/**` (then Playtest) |
| Music / SFX | `Audio/BGM/**`, `Audio/SE/**` |
| Engine rules (battle math, party size, encounter %) | `Scripts/001_Configuration.rb` + other `Scripts/*.rb` |

After PBS edits, restart Playtest so loaders re-read files.

---

## Mechanics preserved (from web game)

- 15 creatures across Route / Grove / Shore  
- Party (3), Pen storage (8), Dex, catch orbs  
- Skills (HP/ATK/DEF/SPD points on level-up)  
- Moves with power, accuracy, and status effects  
- Areas: Petalvale, Blossom Route, Mist Grove, Tidebloom Shore, Creature Pen  
- Collisions: trees, water, rocks, fences, buildings, ledges  
- Path warps + travel cycling (`X` in overworld)  
- Outfits (cycle with `S` / cancel key in overworld)  
- Per-area BGM and battle / UI SEs  
- Starter select → overworld → tall-grass battles  

Overworld uses **panorama map art** + **PBS collision grids** (same layout as the web maps), so painted backgrounds stay intact without redrawing every RMXP tile.

---

## Controls (Playtest)

| Input (RMXP default) | Action |
|----------------------|--------|
| Arrows | Move |
| Z / Space / Enter (`Input::C`) | Talk / confirm / choose move |
| Shift (`Input::A`) | Party summary · Catch in battle |
| X / Esc (`Input::B`) | Outfit cycle · Flee / back |
| L / R | Cycle teleport destinations · Use tonic in battle |

Remap keys in Playtest with **F1** if needed.

---

## Web reference

The complete browser game remains under [`web/`](web/README-WEB.md):

```bash
cd web && python3 -m http.server 8080
```

Use it to compare behavior when adjusting PBS or scripts.

---

## Asset naming (RMXP conventions)

- Characters: `Graphics/Characters/$Player_*.png`, `$nurse.png`, … (`$` = single charset, 4×4 frames)  
- Battlers: `Graphics/Battlers/<creature_id>.png`  
- Map art: `Graphics/Panoramas/<area>.png`  
- Battleback: `Graphics/Battlebacks/battle.png`  
- BGM: `Audio/BGM/Town.wav`, `Route.wav`, `Grove.wav`, `Shore.wav`, `Pen.wav`, `Battle.wav`, `Title.wav`  
- SE: `Walk`, `Warp`, `Hit`, `Catch`, `Miss`, `Heal`, `UI`, `Status`, `Cry`, `Win`

---

## Repack scripts after Ruby edits

```bash
ruby Tools/pack_scripts.rb
```

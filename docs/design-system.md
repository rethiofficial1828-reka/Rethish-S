# RETHISH OS — Design System

## 1. Concept
A GitHub profile reframed as booting into a personal operating system. The visitor is a
returning "operator," not a recruiter reading a CV. Every section is a "system module"
(`SYSTEM // 0X_NAME`) rather than a generic heading like "About Me."

## 2. Site Map / Scroll Storyboard
```
01 Boot Sequence          → animated terminal, system checks fade in line by line
02 Identity Verification  → name reveal + verified badges (waving capsule banner)
03 OS Loading             → module load progress bar
04 AI Initialization      → ai-core.svg reactor, "systems nominal"
05 Mission Control        → live counters styled as a control-room table
06 Security Ops Center    → firewall-shield.svg + radar-scan.svg side by side
07 Developer Arsenal      → neural-network.svg skill constellation + skill bars
08 Research Laboratory    → certifications, framed as verified research documents
09 Project Database       → repos, framed as declassified mission files
10 Global Network         → live GitHub stats / streak / langs / activity / snake
11 Achievements Vault     → vault-achievements.svg + hackathon results as sealed entries
12 Future Roadmap         → quarterly roadmap log
13 Communication Terminal → contact as a CLI "connect" command + hidden easter egg
14 Shutdown Sequence      → closing banner, "session saved" not "goodbye"
```
Each module is separated by the same recurring visual motif (`circuit-divider.svg`) so the
page reads as one continuous board, not stacked unrelated widgets.

## 3. Component Library
| Component | File | Reused for |
|---|---|---|
| Boot terminal | `assets/svg/boot-terminal.svg` | Opening hook only |
| AI core reactor | `assets/svg/ai-core.svg` | AI Initialization |
| Radar sweep | `assets/svg/radar-scan.svg` | Security Ops Center |
| Neural network | `assets/svg/neural-network.svg` | Developer Arsenal |
| Firewall shield | `assets/svg/firewall-shield.svg` | Security Ops Center |
| Circuit divider | `assets/svg/circuit-divider.svg` | Every section break |
| Achievement vault | `assets/svg/vault-achievements.svg` | Achievements module |

External live-data services (kept, since they run server-side and would be redundant to
rebuild): `capsule-render` (banners), `readme-typing-svg` (typed lines),
`github-readme-stats` / `streak-stats` / `top-langs` / `activity-graph` / `profile-trophy`
(live GitHub data), `komarev` (view counter), `platane/snk` (contribution snake).

## 4. Color Palette
| Token | Hex | Use |
|---|---|---|
| Primary Background | `#050816` | page/panel base |
| Secondary Background | `#0B1120` | gradients, panels |
| Panel | `#111827` | cards, terminal fill |
| Glass | `rgba(17,24,39,0.55)` | overlay panels (SVG fills) |
| Primary Text | `#F8FAFC` | headings, cursor |
| Secondary Text | `#CBD5E1` | body/desc text |
| Muted Text | `#94A3B8` | captions, sublabels |
| Accent (Electric Blue) | `#00E5FF` | primary highlight, links |
| Cyber Green | `#00FF9D` | success/active states |
| Purple | `#8B5CF6` | secondary accent, gradients |
| Pink | `#EC4899` | gradient terminus |
| Gold | `#FFD700` | achievements only |
| Orange | `#F59E0B` | warnings |
| Red | `#EF4444` | errors/terminal dots only |

Rule: every gradient in the repo interpolates through this same set (Blue → Purple → Pink,
or Blue → Green) — never an off-palette color.

## 5. Typography
- **Fira Code** — all terminal/code-styled text and SVG labels (primary voice of the page)
- **Inter / Space Grotesk** — reserved for any future prose-heavy section
- Hierarchy: module headers as `SYSTEM // 0X_NAME` in monospace caps; body copy in
  sentence case secondary text; captions in muted text at 11–12px equivalent.

## 6. Animation Guidelines
- Motion is diegetic — it always represents something happening (a scan, a load, a pulse),
  never decoration for its own sake.
- One motion idea per component: terminal = typing/scan line, core = pulse + orbit,
  radar = sweep, network = traveling signal, shield = scanline + checkmark glow,
  vault = orbiting dial + XP fill, divider = traveling particle.
- All animation is native SMIL (`<animate>`, `<animateTransform>`, `<animateMotion>`)
  baked into standalone `.svg` files and embedded via `<img>` — this is required because
  GitHub's markdown sanitizer strips `<script>`, `<style>`, and most animation attributes
  from SVG/HTML pasted *inline* into the README, but renders external `.svg` files as
  images with their native animation intact.

## 7. Folder Architecture
```
rethish-os/
├─ README.md
├─ assets/svg/          → all custom hand-built animated SVGs
├─ json/                → source-of-truth data (certificates, hackathons)
├─ scripts/             → node script that regenerates README tables from json/
├─ .github/workflows/   → snake.yml (contribution snake) + update-readme.yml (hourly refresh)
└─ docs/design-system.md
```

## 8. Known Platform Limits (read before extending this)
- No inline `<script>` or `<style>` execution — anything "interactive" has to be either a
  link/anchor, a pre-rendered image, or an externally hosted widget.
- No custom fonts render as real `@font-face`; "Fira Code" styling above is achieved via
  the SVG `font-family` attribute inside the animated assets, and via services
  (`readme-typing-svg`) that render text to an image server-side.
- Fake widgets (CPU/RAM/GPU meters, threat level, etc.) are static or timer-based — they
  cannot read real system data, so they're labeled as illustrative, not literal telemetry.

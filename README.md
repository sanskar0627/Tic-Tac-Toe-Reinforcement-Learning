<div align="center">

<img src="docs/banner.svg" alt="TOEPUNK — Post the L." width="100%" />

<br />

<img src="docs/mark.svg" alt="TOEPUNK mark" width="88" />

# TOEPUNK

**Fat-marker Q-brawler.** A clay-fisted tic-tac-toe product that starts every visitor at **zero games**.  
Train the brain in the tab. Watch it go from lemon → messy → sharp. Refresh and it is born again.

<br />

[![Play live](https://img.shields.io/badge/▶%20PLAY%20LIVE-toepunk.sanskarshukla.com-FF2E93?style=for-the-badge&labelColor=111111)](https://toepunk.sanskarshukla.com)
[![Vercel](https://img.shields.io/badge/Hosted%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://toepunk.sanskarshukla.com)
[![X](https://img.shields.io/badge/X-@sanskar0627-111111?style=for-the-badge&logo=x&logoColor=white)](https://x.com/sanskar0627)

<br />

[![Next.js](https://img.shields.io/badge/Next.js_15-111111?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-20E3FF?style=flat-square&logo=react&logoColor=111111)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-C8FF3D?style=flat-square&logo=typescript&logoColor=111111)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-FF2E93?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-FFE500?style=flat-square&logo=pytorch&logoColor=111111)](https://pytorch.org)
[![Q-Learning](https://img.shields.io/badge/Q--Learning-FF2E93?style=flat-square)](#how-the-live-brain-learns)
[![MCTS](https://img.shields.io/badge/MCTS%20%2B%20PUCT-20E3FF?style=flat-square&color=111111)](#python-alphazero-trainer)

</div>

<p align="center">
  <a href="https://toepunk.sanskarshukla.com"><b>toepunk.sanskarshukla.com</b></a>
  ·
  <a href="#the-product">Product</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#how-the-live-brain-learns">How it learns</a>
  ·
  <a href="#getting-started">Run locally</a>
  ·
  <a href="#deploy">Deploy</a>
</p>

---

## The product

Most tic-tac-toe demos hide a finished bot behind a board. **TOEPUNK does the opposite.**

Every page load is a newborn. There is no saved champion, no cookie, no warm-start table. You open the pit at **0 games**, stamp clay tiles, and either:

1. **Play it** while it is still dumb, or
2. **Train it live** until it starts winning, blocking, and forking.

The site is the product. The Q-table lives in that tab. Close it and the brain is gone. That is the point — visitors feel the climb from untrained to sharp instead of inheriting someone else's homework.

**Live:** [https://toepunk.sanskarshukla.com](https://toepunk.sanskarshukla.com)

---

## Features

| | What you get |
| --- | --- |
| **The Pit** | Full 3×3 clay arena. You stamp a cell. TOEPUNK thinks (~900ms), paints a Q-heatmap, then moves. |
| **Q heatmap** | Empty cells glow **green** when Q says tap-in, **red** when Q says lemon. The last scan stays painted so you can read the brain. |
| **Hard tactics** | Greedy play is **win first, then block, then Q**. A noisy table cannot skip a mate. |
| **Train Live** | Self-play in batches of 12, about every 90ms. ε decays. Total games ticks up in the sidebar. |
| **Burst** | Eight fast batches plus one exam vs random — a punch of training without sitting on the button. |
| **Win / loss / draw** | Exam vs a random player every 36 games. The chart is the report card. |
| **Epsilon decay** | Cyan fill is exploration. Pink stroke is mean \|TD\| after each sampled burst. |
| **TD update tape** | A terminal of hot temporal-difference errors: state, action, reward, Q old → new, δ. |
| **Training poster** | Stages on the wall: **UNTRAINED → MESSY → LEARNING → SHARP**. |
| **Zero persist** | Refresh = new brain. Nobody inherits a saved champion. |
| **Plush Brutalism** | Fat black borders, offset drop shadows, clay inner light. Mobile and desktop. |

---

## How a session works

1. Open [toepunk.sanskarshukla.com](https://toepunk.sanskarshukla.com).
2. You are **X**. Stamp a clay tile. The board locks while TOEPUNK scans Q(s, a).
3. Heatmap paints. TOEPUNK moves. Your turn again.
4. Hit **TRAIN LIVE** if you want it to stop playing like a lemon. Watch **Total games**, **Epsilon**, and **|TD|**.
5. Around **500** games it knows a few traps. Around **2,000** it starts fighting.
6. After a win, loss, or full board the pit reloads itself in two seconds.

```
 UNTRAINED          MESSY             LEARNING           SHARP
    0                500                2K+              keep going
 random openings     a few traps        wins / blocks    forks, tap-ins
```

Playing also writes Q-updates. You are not just an opponent — you are a teacher.

---

## How the live brain learns

The website agent is a **tabular Q-learner** in TypeScript (`frontend/lib/qAgent.ts`). Same board language as the Python trainer.

### Board encoding

Copied from `game.py` so both stacks speak one dialect:

| Value | Meaning |
| :---: | --- |
| `1` | me / X |
| `-1` | opponent / O |
| `0` | empty |

Perspective flip is multiply by `-1`. The network (and the Q-table key) always sees “me vs them,” never “X vs O” as a special case.

### Update

Classic one-step TD:

```text
Q(s, a) ← Q(s, a) + α [ r + γ max Q(s', a') − Q(s, a) ]
```

| Symbol | Live default | Role |
| --- | --- | --- |
| **α** | `0.35` | How hard a new error writes into the table |
| **γ** | `0.95` | How much tomorrow matters |
| **ε** | `0.85 → 0.04` | Explore, then exploit. Decay `0.9972` per episode |
| **r** | `+1 / 0 / −1` | Win, draw or mid-game, loss |

Unseen boards get a **heuristic prior** (center, corners, edges, win/block seeds) so the first heatmap is readable before the table has been visited.

### Policy when it plays you

On a greedy move the order is locked:

1. Take a winning cell if one exists.
2. Else block the opponent’s winning cell.
3. Else pick the max Q (forks get a bump).

That is why a trained TOEPUNK does not “forget” a tap-in after a noisy burst.

### Train Live internals

- **12** self-play games per batch  
- Exam vs **24** random games every **36** trained games  
- TD tape prefers rows with `\|δ\| > 0.18` so the log looks like a punch, not a lullaby  

---

## What's on the dashboard

```text
┌──────────── sidebar ────────────┐  ┌────────── main ──────────────────────────┐
│ TOEPUNK                         │  │ POST THE L. #TOEPUNK                     │
│ Total games · Epsilon           │  │                                          │
│ Boards seen · |TD|              │  │  ARENA          WIN / LOSS / DRAW        │
│ This board   ...│.+.│-..        │  │  3×3 clay       exam vs random           │
│ α 0.35 · γ 0.95 · ε → 0.04      │  │                 TRAIN IT OR IT STAYS DUMB│
│ [ Train live ]  [ Burst ]       │  │                                          │
│ GitHub · X                      │  │  EPSILON DECAY      TD UPDATE TAPE       │
└─────────────────────────────────┘  └──────────────────────────────────────────┘
```

| Panel | Reads |
| --- | --- |
| **Total games** | `agent.episodes` — play + train both count |
| **Epsilon** | Current exploration rate |
| **Boards seen** | Unique Q-table keys. Barely moves once the small state space is covered |
| **\|TD\|** | Mean absolute TD error of the last sampled burst |
| **This board** | Live state string, `+` me / `-` opp / `.` empty |

---

## Two systems, one pit

This repo ships **two brains**. They share encoding. They do not share weights.

| | Live product | Research trainer |
| --- | --- | --- |
| Path | `frontend/` | repo root |
| Algorithm | Tabular Q-learning + win / block / fork | Policy + value net + MCTS / PUCT |
| Runtime | The visitor’s browser | Your machine (`torch`) |
| Memory | Wiped on refresh | `checkpoints/*.pt` |
| Job | The thing people play | Offline AlphaZero-style loop |
| Wired to the site? | Yes | No — on purpose |

The site is **not** loading `model_iter_15.pt`. The JS table is the product: instant, inspectable, and honest about starting at zero. The Python stack is the deeper trainer if you want a net.

---

## Design

**Plush Brutalism** — a fat-marker outline around claymorphism.

- Ink borders `4px`, offset shadows `6px 6px 0 #111`
- Inner highlight top-left, inner shade bottom-right
- Palette: cream `#FFF4D6`, hot pink `#FF2E93`, lime `#C8FF3D`, cyan `#20E3FF`, sun `#FFE500`
- Type: **Bungee** for display, **Manrope** for body, **IBM Plex Mono** for tape and stats

Desktop keeps the original two-column pit. Phone stacks the arena, then train controls, then telemetry.

---

## Tech stack

**Product (Vercel)**

- Next.js 15 App Router · React 19 · TypeScript  
- Tailwind CSS · Framer Motion · Recharts · Lucide  

**Trainer (local)**

- Python · NumPy · PyTorch  
- `TicTacToeNet` — shared 9→128→128 backbone, policy head (9), value head (1)  
- MCTS with PUCT, self-play batches, eval vs random and vs the previous net  

---

## Repo map

```text
.
├── frontend/                 live product
│   ├── app/                  Next.js pages, fonts, metadata, favicon
│   ├── components/
│   │   ├── arena/            Board + ArenaPanel
│   │   ├── charts/           win/loss + epsilon
│   │   ├── explorer/         TD tape
│   │   ├── layout/           sidebar stats
│   │   └── ui/               clay cards, buttons, pills
│   ├── hooks/                useArena · useTrainingLoop · useSharedAgent
│   ├── lib/                  game.ts · qAgent.ts · brand.ts
│   └── public/images/        logo + favicon
├── game.py                   TicTacToe · 1 / −1 / 0
├── model.py                  TicTacToeNet
├── mcts.py                   PUCT search
├── self_play.py              game generation
├── train.py                  SGD on the net
├── pipeline.py               train → eval → checkpoint
├── checkpoints/              local .pt (git-ignored from the site)
└── docs/                     banner + logo for this README
```

---

## Getting started

### Product

Needs **Node 18+**.

```bash
git clone https://github.com/sanskar0627/Tic-Tac-Toe-Reinforcement-Learning.git
cd Tic-Tac-Toe-Reinforcement-Learning/frontend
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

```bash
npm run build
npm start
```

### Python trainer

Needs **Python 3.10+**, `torch`, `numpy`.

```bash
cd Tic-Tac-Toe-Reinforcement-Learning
python pipeline.py
```

Default loop: 20 iterations, 50 self-play games each, 25 MCTS sims per move, 10 epochs, batch 32. Checkpoints write to `checkpoints/`.

Tweak the call in `pipeline.py` if you want a shorter smoke run.

---

## Deploy

The production URL is **[toepunk.sanskarshukla.com](https://toepunk.sanskarshukla.com)**.

Vercel settings that matter:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root Directory | `frontend` |
| Env vars | none |
| Database | none |
| Domain | `toepunk.sanskarshukla.com` → CNAME `toepunk` → `cname.vercel-dns.com` |

The brain is per-tab. There is nothing to persist on the server.

---

## Why this exists

Reinforcement learning write-ups usually end in a loss curve. TOEPUNK ends in a **thing you can fight**.

You should feel the first twenty games (it hangs sides, it misses tap-ins if you have not trained it, the heatmap is a rumor). You should feel game 2,000 (it takes the win, it blocks, it looks like it means it). Then you refresh and it is a lemon again. That loop is the product.

**#TOEPUNK** — post the L.

---

<div align="center">

<img src="docs/mark.svg" alt="" width="64" />

**Built by [sanskar](https://github.com/sanskar0627)** · [x.com/sanskar0627](https://x.com/sanskar0627)

[▶ Play live — toepunk.sanskarshukla.com](https://toepunk.sanskarshukla.com)

</div>

<div align="center">

<img src="docs/banner.svg" alt="TOEPUNK — Post the L. Fat-marker Q-brawler" width="100%" />

# TOEPUNK

**Fat-marker Q-brawler.** A clay-fisted tic-tac-toe agent that starts at **zero games**.  
Train it in the browser or it plays like a lemon.

<br />

[![Play live](https://img.shields.io/badge/▶%20PLAY%20LIVE-toepunk.sanskarshukla.com-FF2E93?style=for-the-badge&labelColor=111111)](https://toepunk.sanskarshukla.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://toepunk.sanskarshukla.com)

<br />

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-20E3FF?style=flat-square&logo=typescript&logoColor=111111)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-C8FF3D?style=flat-square&logo=python&logoColor=111111)](https://www.python.org)
[![Q-Learning](https://img.shields.io/badge/Q--Learning-FF2E93?style=flat-square&labelColor=111111&color=FF2E93)](#what-it-is)
[![MCTS](https://img.shields.io/badge/MCTS%20%2B%20PUCT-FFE500?style=flat-square&labelColor=111111&color=FFE500)](#python-trainer)
[![License](https://img.shields.io/badge/Built%20by-@sanskar0627-111111?style=flat-square)](https://github.com/sanskar0627)

</div>

---

<p align="center">
  <a href="https://toepunk.sanskarshukla.com"><strong>🌐 toepunk.sanskarshukla.com</strong></a>
  &nbsp;·&nbsp;
  <a href="https://x.com/sanskar0627">X / Twitter</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/sanskar0627">@sanskar0627</a>
</p>

---

## What it is

Every visitor gets a **newborn brain**. No saved champion. No warm start. Refresh and it forgets.

The live site is a **tabular Q-learner** in the browser. Stamp a clay tile, watch it think, then see the Q-heatmap: **green = tap-in**, **red = lemon**. If a win exists, TOEPUNK takes it. No excuses.

Hit **TRAIN LIVE** or **BURST**. Around **2,000 games** it starts playing like it means it.

```
 UNTRAINED  →  MESSY  →  LEARNING  →  SHARP
    0           500         2K+         keep going
```

Same board encoding as the Python trainer:

| cell | meaning |
| :---: | --- |
| `1` | me / X |
| `-1` | opponent / O |
| `0` | empty |

Perspective flip is just multiply by `-1`. That is the whole trick.

---

## Live demo

<div align="center">

### 👉 [toepunk.sanskarshukla.com](https://toepunk.sanskarshukla.com)

Play it. Train it. Post the L.

</div>

The site ships on **Vercel**. Root directory for the deploy is `frontend`.

---

## Two brains, one pit

| | Live site | Python trainer |
| --- | --- | --- |
| Where | `frontend/` | repo root |
| Algorithm | tabular Q-learning + win/block tactics | AlphaZero-style net + MCTS / PUCT |
| Runs | your browser | local GPU / CPU |
| Memory | wiped on refresh | `.pt` checkpoints |
| Feel | fat-marker clay UI, live TD tape | self-play loop |

The website is **not** wired to the `.pt` files. The JS agent copies the `1 / -1 / 0` encoding from `game.py` so the two stacks talk the same board language.

---

## Repo map

```text
.
├── frontend/          ← Next.js 15 · TOEPUNK UI · in-browser Q-agent
│   ├── app/           pages + fonts
│   ├── components/    arena, charts, clay cards
│   ├── hooks/         play loop + train loop
│   └── lib/           game.ts · qAgent.ts
├── game.py            TicTacToe · 1 / -1 / 0
├── model.py           policy + value net
├── mcts.py            PUCT search
├── self_play.py       game generation
├── train.py           SGD on the net
├── pipeline.py        train → eval vs random
└── checkpoints/       local .pt files (not used by the site)
```

---

## Run the site

```bash
cd frontend
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Need a production build first?

```bash
cd frontend
npm run build
npm start
```

---

## Run the Python trainer

```bash
python pipeline.py
```

Requires `torch` + `numpy`. Checkpoints land in `checkpoints/`.

---

## How the live agent learns

1. Empty Q-table on every page load.
2. ε-greedy play, ε decaying toward `0.04`.
3. Hard tactics first: **win**, then **block**, then Q.
4. After each game, TD updates write into the same table.
5. Telemetry paints win / loss / draw, ε decay, and a TD tape of hot errors.

α `0.35` · γ `0.95` · ε starts fat and slims down.

---

## Deploy on Vercel

1. Import this GitHub repo into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Next.js**.
4. Add the domain **`toepunk.sanskarshukla.com`**.

No env vars. No database. The brain lives in the tab.

---

<div align="center">

**#TOEPUNK**

Built by [sanskar](https://github.com/sanskar0627) · [x.com/sanskar0627](https://x.com/sanskar0627)

[▶ Play live](https://toepunk.sanskarshukla.com)

</div>

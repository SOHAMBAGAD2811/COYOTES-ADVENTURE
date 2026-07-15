<div align="center">

```
 ████████╗██╗  ██╗███████╗    ██████╗ ██╗   ██╗███████╗████████╗
 ╚══██╔══╝██║  ██║██╔════╝    ██╔══██╗██║   ██║██╔════╝╚══██╔══╝
    ██║   ███████║█████╗      ██████╔╝██║   ██║███████╗   ██║
    ██║   ██╔══██║██╔══╝      ██╔══██╗██║   ██║╚════██║   ██║
    ██║   ██║  ██║███████╗    ██║  ██║╚██████╔╝███████║   ██║
    ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝
```

# 🛰️ THE COYOTE'S INTERCEPT TERMINAL

### *Rustbound Frontier — Kepler-88*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

> *A fully diegetic, browser-based survival terminal set on the dying world of Kepler-88 — "The Rust."*
> *Intercept. Hack. Survive.*

---

</div>

## 🌌 UNIVERSE — THE RUSTBOUND FRONTIER

```
YEAR:       2142 CE
LOCATION:   KEPLER-88 — DESIGNATION "THE RUST"
STATUS:     EARTH DEPLETED. OASIS CITY IS HUMANITY'S LAST STAND.
THREAT:     AEGIS CORPORATION — CONTROLS ALL REMAINING RESOURCES.
```

Earth is a dust bowl. The mega-corporation **AEGIS** hoards every drop of water, every seed, every breath of clean air behind militarized convoys and encrypted firewalls. What's left of civilization clings to survival in **Oasis City** — a settlement built from salvage, hope, and desperation.

You are a **Coyote** — a rogue tech-tracker operating from a jury-rigged rover terminal somewhere in the wastes. Your job: intercept AEGIS supply convoys, hack their systems, siphon their resources, and keep the settlement alive for one more cycle.

The clock is ticking. The convoy is approaching. **Boot up, Coyote.**

---

## 🎯 MISSION SUMMARY

```
┌──────────────────────────────────────────────────────────┐
│  ⚠  CRITICAL ALERT                                      │
│  SETTLEMENT WATER SYNTHESIZER: OFFLINE                   │
│  AEGIS CONVOY DETECTED — EN ROUTE TO OASIS CITY          │
│  OBJECTIVE: FULL SYSTEMS INTERCEPT & ENVIRONMENT RESTORE │
│  TIME WINDOW: 6 MINUTES                                  │
│  STATUS: AWAITING OPERATOR                               │
└──────────────────────────────────────────────────────────┘
```

Navigate through **9 mission stages** — each a unique mini-game — connected by intercom transmissions that advance the story. Every stage is a different system on the AEGIS convoy that you must breach, override, or calibrate to save Oasis City.

---

## 🕹️ MISSION STAGES

| # | Stage | Codename | Objective |
|---|-------|----------|-----------|
| 1 | **Firewall Breach** | `firewall` | Lock timing nodes as they align to bypass AEGIS security |
| 2 | **Power Grid** | `power` | Balance the load across convoy power systems to avoid detection |
| 3 | **Water Siphon** | `water` | Tune the radio frequency, lock the signal, hit the breach sweet-spot to siphon coolant tanks |
| 4 | **Decryption** | `decryption` | Repeat the encrypted pattern sequence to decode the shipping manifest |
| 5 | **Air Purification** | `air` | Calibrate oxygen scrubber valves before hypoxia sets in |
| 6 | **Thruster Override** | `thruster` | Stabilize the ship through a debris field by overriding thrusters |
| 7 | **Cipher Test** | `riddle` | Pass Sentinel's intelligence verification — prove you're worthy |
| 8 | **Biosphere Init** | `biosphere` | Match soil pH, nitrogen, and water levels to initialize the biosphere |
| 9 | **Biomass Synthesizer** | `earth` | Route pipe connections to grow biomass and restore the environment |

> 💀 **Fail any stage or run out of time → MISSION FAILED.**
> ✅ **Complete all 9 → ENVIRONMENT RESTORED. Oasis City survives.**

---

## ✨ FEATURES

### 🖥️ Full Diegetic Terminal UI
Everything you see IS the game. No menus, no HUD overlays — the entire interface is the Coyote's rover terminal, complete with:
- **CRT scanlines, film grain, and screen flicker** — authentic retro-terminal feel
- **Ambient dust particles** floating across the viewport
- **Camera shake** on failed breach attempts
- **Terminal flash** effects for success/failure feedback

### 🎯 Custom Target Cursor
A spinning bracket cursor that locks onto interactive elements, switches to a glowing hand during gameplay, and snaps to button boundaries on hover.

### 🔊 Dynamic Soundtrack
Adaptive audio engine that crossfades between tracks based on the current mission stage — tense during hacking, calm during intercom transmissions.

### 📖 Cinematic Story Sequence
Glitch-animated story cards with speech synthesis narration, starfield backgrounds, and a full boot sequence with typewriter diagnostics.

### 🌡️ Real-Time Systems
- **Heat Telemetry** — core temperature rises during the water stage; vent coolant or face system failure
- **Mission Clock** — 6-minute countdown with convoy progress bar
- **Battery drain** and **coordinate drift** for immersion
- **Mission Log** — real-time scrolling log of every action, warning, and success

---

## 🚀 QUICK START

```bash
# Clone the outpost terminal
git clone https://github.com/your-repo/COYOTES-ADVENTURE.git
cd COYOTES-ADVENTURE

# Install dependencies
npm install

# Boot the terminal
npm run dev
```

Then open **http://localhost:3000** and click to begin.

---

## 🏗️ PROJECT ARCHITECTURE

```
COYOTES-ADVENTURE/
├── app/
│   ├── page.tsx              # Main game — stage routing, state wiring, CRT overlays
│   ├── layout.tsx            # Root layout with cursor provider
│   └── globals.css           # CRT effects, animations, glitch styles, design tokens
│
├── components/
│   ├── BootSequence.tsx      # Terminal boot with typewriter diagnostics
│   ├── StoryCards.tsx        # Opening cinematic with glitch text + starfield
│   ├── StoryCardsEnd.tsx     # Ending cinematic — mission complete sequence
│   ├── IntercomDialogueGeneric.tsx  # Between-stage narrative transmissions
│   │
│   ├── FirewallStage.tsx     # Stage 1: Timing-based node lock
│   ├── PowerGridStage.tsx    # Stage 2: Load balancing puzzle
│   ├── FrequencySlider.tsx   # Stage 3: Radio frequency tuner
│   ├── OverdriveBreach.tsx   # Stage 3: Sweet-spot breach minigame
│   ├── DecryptionStage.tsx   # Stage 4: Pattern memory sequence
│   ├── AirStage.tsx          # Stage 5: Valve calibration
│   ├── ThrusterStage.tsx     # Stage 6: Debris field navigation
│   ├── RiddleStage.tsx       # Stage 7: Cipher/intelligence test
│   ├── BiosphereStage.tsx    # Stage 8: Soil/water pH matching
│   ├── EarthStage.tsx        # Stage 9: Pipe routing for biomass
│   │
│   ├── TopBar.tsx            # Clock, battery, coordinates display
│   ├── HeatTelemetry.tsx     # Thermal gauge + coolant vent
│   ├── TopographicalScanner.tsx  # Radar/signal visualization
│   ├── MissionLog.tsx        # Real-time event log
│   ├── EvolutionSlot.tsx     # Bottom HUD slot
│   ├── TargetCursor.tsx      # Custom animated cursor system
│   ├── PixelButton.tsx       # Retro-styled interactive button
│   ├── PixelSnow.tsx         # Pixel particle effect overlay
│   ├── FuzzyText.tsx         # Text distortion effects
│   └── LetterGlitch.tsx      # Background glitch matrix
│
├── lib/
│   ├── useInterceptState.ts  # Core game state — all mission logic, timers, progression
│   ├── cursorStore.ts        # Pub/sub store for cursor mode (full ↔ minimal)
│   └── audioEngine.ts        # Dynamic soundtrack manager
│
└── public/
    ├── avatar.jpg            # Intercom AI avatar
    └── avatar_human.jpg      # Human character avatar
```

---

## 🛠️ TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | SSR, routing, dynamic imports |
| **Language** | TypeScript 5.5 | Type safety across the codebase |
| **Styling** | Tailwind CSS 3.4 | Utility-first styling with custom design tokens |
| **Animation** | Framer Motion 11 | Page transitions, staggered reveals, spring physics |
| **3D** | Three.js 0.185 | Scanner/terrain visualization |
| **Audio** | Web Audio API | Custom blip sounds, dynamic soundtrack crossfading |
| **Speech** | SpeechSynthesis API | Story narration during cinematics |
| **VFX** | Custom CSS + RAF | CRT scanlines, grain, cursor tracking, dust particles |

### Design Tokens
```
bg-matte-base       →  Terminal background
bg-matte-panel       →  Panel surfaces
text-amber-glow      →  Primary UI color (#ffb000)
text-crimson-alert   →  Danger / failure states
shadow-hardware-out  →  Raised panel effect
shadow-hardware-in   →  Pressed/inset effect
```

---

## 👥 TEAM — EXCEPTIONAL HANDLERS

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║           ███████╗██╗  ██╗                            ║
║           ██╔════╝██║  ██║                            ║
║           █████╗  ███████║                            ║
║           ██╔══╝  ██╔══██║                            ║
║           ███████╗██║  ██║                            ║
║           ╚══════╝╚═╝  ╚═╝                            ║
║                                                       ║
║           E X C E P T I O N A L                       ║
║           H A N D L E R S                             ║
║                                                       ║
║   "We don't catch exceptions. We handle them."        ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

## 📜 LICENSE

This project was built for the Rustbound Frontier universe.

---

<div align="center">

```
> TRANSMISSION ENDS.
> STAY VIGILANT, COYOTE.
> YOUR FIGHT HAS JUST BEGUN.
```

*Built with ☕ and 🔧 by **Exceptional Handlers***

</div>

# The Coyote's Intercept Terminal — Rustbound Frontier

A diegetic survival/stealth dashboard set on Kepler-88 ("The Rust"). Tune the
radio to lock the Aegis convoy's signal, land Overdrive Breach attempts to
siphon water, and manage core heat — before the convoy reaches Oasis City.

## Run locally

```
npm install
npm run dev
```

Then open http://localhost:3000

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion

## Structure

- `app/page.tsx` — layout + game state wiring
- `lib/useInterceptState.ts` — all mission/game state (heat, tuning, breach, mission clock)
- `components/` — TopBar, TopographicalScanner, HeatTelemetry, FrequencySlider, OverdriveBreach, EvolutionSlot
- `tailwind.config.ts` — matte-base / matte-panel / amber-glow / crimson-alert tokens + hardware-in/out shadows

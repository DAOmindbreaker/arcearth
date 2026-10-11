# ArcEarth

> Explore the World. Understand the Impact.
> Built with Arc Studio — money-powered apps in minutes.

**Brand philosophy:** One Planet. Connected by Arc.

---

## What This App Does

ArcEarth is an interactive 3D Earth exploration and global event monitoring platform.
It renders a full-viewport Three.js globe with three primary modules:

- **Explore** — region navigation, location search, and surface layer toggles.
- **EarthWatch** — real-time global event feed (seismic, wildfire, storm, flood, volcano).
- **EarthImpact** — planetary health metrics dashboard (CO₂, temperature anomaly, sea level, population).

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS v3
- 3D: Three.js 0.186, @react-three/fiber 9, @react-three/drei 10
- Motion: Framer Motion 11
- Icons: lucide-react
- Web3: wagmi v2, viem v2, ConnectKit (Arc Testnet)
- Chain: Arc Testnet (Chain ID: 5042002)
- Token: USDC (6 decimals, Address: 0x3600000000000000000000000000000000000000)
- Toasts: Sonner

## EarthImpact Module

### Deployed Contracts (Arc Testnet)

| Contract | Address | Explorer |
|---|---|---|
| ArcEarthImpactRegistry | `0x725c40dcd969050a5cc38cb8a1d67948083a941b` | [View](https://explorer.testnet.arc.io/address/0x725c40dcd969050a5cc38cb8a1d67948083a941b) |
| ArcEarthAttestation    | `0x2c80bb55821154a8dc8acc0e76dd7fdad35dd308` | [View](https://explorer.testnet.arc.io/address/0x2c80bb55821154a8dc8acc0e76dd7fdad35dd308) |

- Registry owner = deployer wallet `0x5B12Ce46C7194aD57d143bC22847224047b1Ef42`
- Attestation contract wired to registry at deploy time (immutable)
- IPFS: Pinata gateway. Set `VITE_PINATA_JWT` in .env for real uploads (dev simulates without it)
- Trust statuses: `verified` (owner-called `verifyProject`), `pending` (submitted, not verified), `telemetry` (off-chain only)

### Frontend data path
- ABIs: `src/earthimpact/abi.ts`
- Types: `src/earthimpact/types.ts`
- IPFS upload: `src/earthimpact/ipfs.ts`
- Hooks: `useImpactRegistry`, `useImpactAttestation`, `useSubmitProject`
- Globe layer: `src/components/ImpactProjectMarkers.tsx`
- Project detail drawer: `src/components/ProjectDetailDrawer.tsx`
- Trust badge: `src/components/TrustBadge.tsx`

## EarthWatch Module

- API server: `server/index.ts` — Express on port 3001. Start with `bun run server`.
- Routes: `GET /api/events`, `GET /api/events/usgs`, `GET /api/events/eonet`
- Query params: `days` (1–30), `minMag` (earthquakes), `limit` (max 500)
- Cache TTL: 5 minutes in-memory; no external cache needed.
- Vite proxy: `/api/*` → `http://localhost:3001/*` (configured in `vite.config.ts`)
- Data pipeline: `src/earthwatch/types.ts` → `src/earthwatch/normalize.ts` → `src/earthwatch/useEarthWatch.ts`
- Globe overlay: `src/components/EventMarkers.tsx` (instanced meshes, one per event type)
- Event drawer: `src/components/EventDrawer.tsx` (right-side slide-in)
- Time slider: `src/components/TimeSlider.tsx` (bottom viewport, 6-hour steps, sparkline)

## Key Files

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Composition root — globe + tab router + sidebar layout |
| `src/components/Globe3D.tsx` | Three.js Earth sphere, atmosphere glow, grid overlay, camera lerp |
| `src/components/NavBar.tsx` | Top nav with animated tab strip (Explore / EarthWatch / EarthImpact) |
| `src/components/CameraControls.tsx` | Zoom, tilt, coordinate jump, preset locations |
| `src/components/ExplorePanel.tsx` | Region search + layer toggles for Explore module |
| `src/components/EarthWatchPanel.tsx` | Event feed + type filter for EarthWatch module |
| `src/components/EarthImpactPanel.tsx` | Planetary metrics cards for EarthImpact module |
| `src/index.css` | Arc Dark design tokens + glass helpers |
| `tailwind.config.js` | ArcEarth palette, font families, animations |

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|---------|
| `VITE_EARTH_TEXTURE_URL` | CDN URL for NASA blue-marble Earth texture | No (procedural fallback) |
| `VITE_IMPACT_API_URL` | Base URL for live impact metrics API | No (stub data fallback) |
| `VITE_MAP_TOKEN` | Token for future Resium/Cesium integration | No |

## Design System

- **Mode:** Arc Dark (deep navy, glass surfaces, pale-blue accent `#4db8ff`)
- **Fonts:** Space Grotesk (display/headings) + DM Sans (body/UI) + JetBrains Mono (coords/data)
- **Accent:** `#4db8ff` — appears on active tabs, camera controls CTA, and live event icons

## Module Roadmap (next steps)

- [ ] Wire `VITE_EARTH_TEXTURE_URL` to a real NASA texture CDN
- [ ] Replace `EarthWatchPanel` stub events with a live USGS / ReliefWeb API
- [ ] Replace `EarthImpactPanel` stub metrics with a live NOAA / Copernicus API
- [ ] Add event markers (Three.js sprites) on the globe surface from EarthWatch events
- [ ] Add USDC-gated EarthImpact report subscriptions via Arc contracts
- [ ] Integrate Resium/CesiumJS as an optional high-fidelity renderer

## Deployed Contracts

_None yet._

## To Run

```bash
bun install
bun run dev
```

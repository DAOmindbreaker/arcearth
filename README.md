# ArcEarth

> **Explore the World. Understand the Impact.**

**Brand philosophy:** One Planet. Connected by Arc.

ArcEarth is an interactive 3D Earth exploration and global event monitoring platform. It renders a full-viewport Three.js globe with live geospatial data, on-chain impact project registrations, and real-time environmental event feeds — all connected through the Arc blockchain ecosystem.

> **Disclaimer:** ArcEarth is an independent application built on the Arc blockchain network. It is not officially affiliated with, sponsored by, or endorsed by Circle, the Arc network, or any related entity. "Arc" is used here to reference the connection, continuity, and shared infrastructure that the Arc blockchain provides to developers and communities.

---

## Table of Contents

1. [Quickstart](#quickstart)
2. [Architecture Overview](#architecture-overview)
3. [Module Breakdown](#module-breakdown)
   - [Explore](#explore)
   - [EarthWatch](#earthwatch)
   - [EarthImpact](#earthimpact)
4. [Contract Deployments (Arc Testnet)](#contract-deployments-arc-testnet)
5. [Environment Variables](#environment-variables)
6. [Design System](#design-system)
7. [Tech Stack](#tech-stack)
8. [Roadmap](#roadmap)

---

## Quickstart

```bash
# 1. Install dependencies
bun install

# 2. Copy environment template and fill in values (all optional — the app works without them)
cp env.example .env

# 3. Start the EarthWatch API proxy server (separate terminal)
bun run server

# 4. Start the Vite dev server
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. A wallet connection is not required — all three modules are fully browsable without one.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Vite)                    │
│                                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │   Explore    │  │ EarthWatch  │  │EarthImpact │  │
│  │   (panel)    │  │  (panel)    │  │  (panel)   │  │
│  └──────────────┘  └──────┬──────┘  └─────┬──────┘  │
│         │                 │               │          │
│         └─────────────────┼───────────────┘          │
│                           │                          │
│             ┌─────────────▼─────────────┐            │
│             │         Globe3D           │            │
│             │  (Three.js sphere, R3F)   │            │
│             │  EventMarkers layer       │            │
│             │  ImpactProjectMarkers     │            │
│             └───────────────────────────┘            │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  wagmi v2 + ConnectKit  →  Arc Testnet        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
              │                        │
     ┌────────▼───────┐     ┌──────────▼─────────┐
     │  Express API   │     │   Arc Testnet RPC   │
     │  (port 3001)   │     │  (chain 5042002)    │
     │  /api/events   │     │                     │
     │  USGS + EONET  │     │  ImpactRegistry     │
     └────────────────┘     │  Attestation        │
                            └─────────────────────┘
```

**Data flows:**

- `Globe3D` renders the Earth sphere with two overlay layers — `EventMarkers` (EarthWatch events) and `ImpactProjectMarkers` (on-chain projects).
- The `EarthWatch` panel polls `/api/events` every 60 seconds; the Express backend caches responses for 5 minutes and fans out to USGS and NASA EONET.
- The `EarthImpact` panel reads the `ArcEarthImpactRegistry` contract directly from the browser via wagmi `useReadContract` hooks (no backend required).
- IPFS evidence uploads go directly from the browser to the Pinata gateway using a JWT bearer token stored in `VITE_PINATA_JWT`.

---

## Module Breakdown

### Explore

The default landing view. Provides:

- **Region quick-picks** — click Africa, Americas, Asia, Europe, or Oceania to fly the camera to that region instantly.
- **Location search** — free-text input with preset city shortcuts (New York, London, Tokyo, Sydney, São Paulo, Cairo).
- **Layer toggles** — surface overlays for Terrain, Clouds, Night Lights, Wind Patterns, and Ocean Depth (toggle switches; textures provided at runtime via `VITE_EARTH_TEXTURE_URL`).
- **CameraControls** — zoom in/out, tilt, coordinate jump (lat/lon/altitude with validation), and preset city fly-to animations.

### EarthWatch

Real-time global event monitoring. Powered by two public APIs proxied through the bundled Express server:

| API | Events | Endpoint |
|-----|--------|----------|
| [USGS Earthquake Hazards](https://earthquake.usgs.gov/fdsnws/event/1/) | Earthquakes (magnitude, depth, epicentre) | `/api/events/usgs` |
| [NASA EONET v3](https://eonet.gsfc.nasa.gov/docs/v3) | Wildfires, severe storms, volcanoes, floods | `/api/events/eonet` |

Features:

- **Live event feed** with type and severity filter chips.
- **Globe markers** — instanced `THREE.Mesh` objects colour-coded by event type and severity (critical = red, warning = amber, watch = blue, info = grey). One draw call per event type regardless of marker count.
- **Event drawer** — click any marker or feed row to open a side panel with full metadata, coordinates, magnitude/depth, source attribution, and a deep-link to the upstream source.
- **Time-series playback slider** — dual-handle range over a 7-day window with a sparkline showing event density. Play/pause/step controls advance in 6-hour increments. A "Show all" toggle clears the filter instantly.
- **Auto-refresh** every 60 seconds with a visual countdown indicator.

**API server usage:**

```bash
# Start the API proxy (run alongside `bun run dev`)
bun run server

# Query examples
curl "http://localhost:3001/api/events?days=3&minMag=4.0&limit=200"
curl "http://localhost:3001/api/events/usgs?days=7"
curl "http://localhost:3001/api/events/eonet?days=14"
```

### EarthImpact

On-chain impact project registry built on Arc Testnet. Allows anyone to:

1. **Browse** geotagged impact projects directly from the `ArcEarthImpactRegistry` smart contract.
2. **Submit** a new project — name, description, coordinates, category, and an IPFS evidence file — via a wallet transaction.
3. **Attest** to existing projects (one attestation per address per project) via the `ArcEarthAttestation` contract.

**Trust / Verification badges:**

| Badge | Meaning |
|-------|---------|
| Verified On-Chain (Arc Testnet) | `verifyProject()` was called by the registry owner |
| Pending Verification | Project was submitted but not yet owner-verified |
| Public Telemetry | Off-chain or telemetry-only data source |

**Globe markers:** octahedra for verified projects (colour by category), rings for pending projects. Click any marker or list row to open the project detail drawer.

**Categories:** Reforestation, Ocean Cleanup, Solar, Wind, Conservation, Carbon Capture, Water, Biodiversity.

---

## Contract Deployments (Arc Testnet)

> Network: Arc Testnet · Chain ID: `5042002` · Native gas: USDC

| Contract | Address | Explorer |
|----------|---------|---------|
| `ArcEarthImpactRegistry` | `0x725c40dcd969050a5cc38cb8a1d67948083a941b` | [View on Arc Explorer](https://explorer.testnet.arc.io/address/0x725c40dcd969050a5cc38cb8a1d67948083a941b) |
| `ArcEarthAttestation`    | `0x2c80bb55821154a8dc8acc0e76dd7fdad35dd308` | [View on Arc Explorer](https://explorer.testnet.arc.io/address/0x2c80bb55821154a8dc8acc0e76dd7fdad35dd308) |

**Contract details:**

- `ArcEarthImpactRegistry`: OpenZeppelin `Ownable`. Stores `ImpactProject` structs with micro-degree coordinates (`int256` scaled ×1,000,000), an IPFS CID, and an owner-controlled `verified` flag. Paginated batch-read via `getProjectBatch(offset, limit)` (max 100 per call).
- `ArcEarthAttestation`: Immutably wired to the registry address at deploy time. One attestation per `(projectId, attester)` address pair. Reads `projectCount` from the registry to validate project existence before writing.
- **Registry owner / deployer:** `0x5B12Ce46C7194aD57d143bC22847224047b1Ef42` (Circle SCP platform wallet — Arc Testnet only).
- Source: `contracts/ArcEarthImpactRegistry.sol`, `contracts/ArcEarthAttestation.sol`.
- ABIs: `src/earthimpact/abi.ts`.

**Security review:** both contracts passed a balanced severity audit before deployment. One functional finding (empty IPFS CID allowed) was patched prior to deploy.

To re-deploy to a different account or network:

```bash
# Build
bun run contracts:build

# Deploy registry first, then pass its address to the attestation contract
# (see scripts/self-deploy.ts or use Arc Studio's deploy workflow)
```

---

## Environment Variables

All variables are optional — ArcEarth degrades gracefully when any are absent.

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_EARTH_TEXTURE_URL` | CDN URL for a NASA Blue Marble Earth texture (8192×4096 PNG/JPG) | Procedural deep-ocean sphere |
| `VITE_IMPACT_API_URL` | Base URL for a live planetary metrics API | Stub data |
| `VITE_MAP_TOKEN` | Token for future Resium/CesiumJS high-fidelity renderer | Unused |
| `VITE_IMPACT_REGISTRY_ADDRESS` | `ArcEarthImpactRegistry` contract address | Arc Testnet address above |
| `VITE_ATTESTATION_ADDRESS` | `ArcEarthAttestation` contract address | Arc Testnet address above |
| `VITE_PINATA_JWT` | Pinata IPFS JWT bearer token for evidence uploads | Simulated CID (dev mode) |

Copy `.env.example` and fill in values; the app never requires them to run.

---

## Design System

**Theme:** Arc Dark — deep navy background, translucent glass surface cards, blue accent.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#080d1a` | Page background |
| `--surface` | `rgba(255,255,255,0.04)` | Card / panel backgrounds |
| `--accent` | `#4db8ff` | Active tabs, CTAs, live indicators |
| `--success` | `#5ce0a8` | Verified badges, impact markers |
| `--warning` | `#f59e0b` | Pending badges, magnitude warning |
| `--danger` | `#ef4444` | Critical severity markers |

**Typography:**

- Display / headings: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) 500–700
- Body / UI: [DM Sans](https://fonts.google.com/specimen/DM+Sans) 400–600
- Coordinates / data: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) 400–500

**Glass helpers:** `.glass` (4% white fill + 1px border + 8px blur), `.glass-strong` (6% fill + 16px blur). Defined in `src/index.css`.

---

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| Framework | React | 18 |
| Build | Vite | 6 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3 |
| 3D / Globe | Three.js | 0.186 |
| React 3D | @react-three/fiber | 9 |
| React 3D helpers | @react-three/drei | 10 |
| Animation | Framer Motion | 11 |
| Icons | lucide-react | latest |
| Wallet connect | ConnectKit + wagmi v2 + viem v2 | latest |
| Chain | Arc Testnet | ID 5042002 |
| API server | Express | 5 |
| IPFS | Pinata (via REST API) | — |
| Toasts | Sonner | latest |

---

## Roadmap

- [ ] Wire `VITE_EARTH_TEXTURE_URL` to a real NASA Blue Marble texture CDN
- [ ] Replace stub EarthImpact metrics with live NOAA / Copernicus API data
- [ ] Add USDC-gated premium EarthImpact report subscriptions via Arc contracts
- [ ] Integrate Resium/CesiumJS as an optional high-fidelity renderer (when `VITE_MAP_TOKEN` is set)
- [ ] Support Mainnet Arc deployment of impact contracts with real USDC flows
- [ ] Add event cluster LOD (level-of-detail) for dense earthquake regions
- [ ] Mobile-responsive globe layout with touch gesture controls
- [ ] Project governance: on-chain voting for community verification

---

*ArcEarth — One Planet. Connected by Arc.*

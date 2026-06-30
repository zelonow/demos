# Vava Transport FleetX Demo

Vava-branded public booking demo for FleetX. This app is derived from the ATT white-label booking surface and is intended for local sales/demo use.

## What It Shows

- Vava Transport and Logistics public booking surface
- Vehicle categories: Landcruiser, Volkswagen, Vans, Sedans, Executive buses
- Services: airport transfers, conference/event transportation, corporate fleet solutions, VVIP transfers, tourism, and DMC services
- Mock inventory fallback when FleetX env vars are not configured
- Staff handoff to FleetX Enterprise, defaulting to `http://localhost:3012`

## Quick Start

```bash
npm install
npm run dev
```

## FleetX Integration

Set these variables in `.env.local` when connecting to a real FleetX tenant:

```env
NEXT_PUBLIC_ORG_ID=vava
BACKEND_BASE_URL=http://localhost:3012
NEXT_PUBLIC_ADMIN_URL=http://localhost:3012
NEXT_PUBLIC_SITE_URL=https://vavatransport.rw
```

The local FleetX Enterprise demo exposes public inventory, booking request, assistant, and proof-upload endpoints at `/api/v1/fleet/public/:organizationId/...`. For the seeded demo, `NEXT_PUBLIC_ORG_ID=vava` resolves to the latest Vava supplier fleet organization. `ZELO_FLEETX_API_KEY` is only needed for protected or remote API deployments that require bearer auth.

Without the FleetX backend URL and organization value, the app falls back to local Vava mock data. When `BACKEND_BASE_URL` is configured, FleetX is treated as required; if it is offline or not seeded, `/api/inventory` returns a `502` instead of silently using mock vehicles. Set `FLEETX_ALLOW_MOCK_FALLBACK=true` only for an intentionally offline demo.

## Demo Pairing

Run the operator system from `eco_system/fleetx-enterprise`:

```bash
pnpm demo:seed
pnpm dev
```

The FleetX Enterprise demo route is `/demo`, and the admin/dashboard runs on `http://localhost:3012`.

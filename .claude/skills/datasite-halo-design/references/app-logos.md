# App Logos

SVG logos for Datasite ecosystem apps and partners — used in Marketplace app cards and the App Switcher (top nav).

## Asset location

All logos live at `src/assets/app-logos/` with a typed barrel export at `src/assets/app-logos/index.ts`.

## Import pattern

**Always use the typed map exports — not direct SVG imports.**

```tsx
import { appLogos, partnerLogos } from '~/assets/app-logos';

// Returns string (URL) | null — always handle the null case
const src = appLogos['diligence'];      // Datasite product
const src = partnerLogos['grata'];      // Partner app

// Render
{src ? (
  <img src={src} alt="Grata" width={32} height={32} style={{ borderRadius: 4 }} />
) : (
  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>G</Avatar>
)}
```

Use `<img>` rather than inline SVG — these are third-party brand marks, not icon glyphs.

## Available logos

### `appLogos` — Datasite products

| Key | App | Notes |
|---|---|---|
| `similar-companies` | Similar Companies | |
| `blueflame-research` | Blueflame Research | separate from Blueflame AI |
| `watermark` | Watermark | |
| `cim-summary` | CIM Summary | |
| `convert-excel` | Convert Excel | |
| `doc-comparison` | Doc Comparison | |
| `esignature` | E-Signature | |
| `rapid-redact` | Rapid Redact | |
| `translate` | Translate | |
| `diligence` | Diligence | |
| `acquire` | Acquire | |
| `prepare` | Prepare | |
| `pipeline` | Pipeline | |
| `outreach` | Outreach | |
| `archive` | Archive | |
| `project-dashboard` | Project Dashboard | |
| `mobile` | Mobile | |
| `datasite-apis` | Datasite APIs | |
| `deep-research` | Deep Research | |
| `market-mapper` | Market Mapper | |

### `partnerLogos` — Partner apps

| Key | App | Notes |
|---|---|---|
| `grata` | Grata | |
| `blueflame` | Blueflame AI | separate from Blueflame Research |
| `ontra` | Ontra | |
| `sherpany` | Sherpany | |
| `mergerlinks` | Mergerlinks | |
| `thinkcell` | Thinkcell | returns `null` — use initials fallback |

**Not yet added:** Valu8, Ansarada, Firmex — use the initials fallback for these until their SVGs land.

## Adding a new logo

1. Drop a kebab-case `.svg` into `src/assets/app-logos/`
2. Add an import and entry in `src/assets/app-logos/index.ts` under the appropriate map
3. Any prototype using `appLogos`/`partnerLogos` picks it up automatically

## Null / missing logo fallback

```tsx
import Avatar from '@mui/material/Avatar';

<Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
  V
</Avatar>
```

Tell the designer: "I used a placeholder for [App] — the SVG isn't available yet. Once it's added to `src/assets/app-logos/index.ts`, swap in the map lookup."

## Where these logos appear

### Marketplace page
App listing cards — logo at ~48×48 in the card header alongside app name, description, and CTA. Categories: Data and Analysis, Efficiency and Productivity, Deal Collaboration, Partner Solutions.

### App Switcher (top nav)
The grid menu at the top-right of the Datasite chrome. Shows the apps a user has access to. Logos render at ~32×32 with 4px border-radius, no stroke border.

### Diligence Dashboard (cross-sell widget)
A promotional widget on the Diligence dashboard surface ("Start using Datasite's suite of deal productivity & analysis tools for free") that surfaces free Marketplace apps to buyers. Apps shown: Similar Companies, MergerLinks, E-Signature, Convert to Excel, Document Comparison, Watermark, Rapid Redact. Logos render at ~32×32 alongside app name and description.

These logos may also appear in other cross-sell or upsell surfaces across the product — when in doubt, use this asset set rather than placeholders.

## When to reach for this reference

The workflow skill prompts you automatically when relevant context is detected. Load this file when:
- The prototype involves the Marketplace page or any app listing surface
- The prototype involves the App Switcher, top-nav app menu, or any "apps" context
- The prototype involves a cross-sell widget, dashboard promo, or upsell surface
- The designer mentions any app by name: Grata, Blueflame, Diligence, Acquire, Sherpany, Valu8, Ansarada, Firmex, Similar Companies, Prepare, Market Mapper, Ontra, Mergerlinks

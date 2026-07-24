# DatasitePrototypeShell — customization reference

Load this when the designer answered "yes" to the shell question (Step 1, question 4) and the prototype needs the Datasite app chrome.

## Default usage

```tsx
import { Box } from '@mui/material';
import { DatasitePageHeader, DatasitePrototypeShell } from '~/shared';

export default function DiligenceDocumentRoom() {
  return (
    <DatasitePrototypeShell productMode="diligence">
      <DatasitePageHeader
        title="Documents"
        description="Diligence document room"
      />
      <Box sx={{ p: 4 }}>
        {/* … your design exploration … */}
      </Box>
    </DatasitePrototypeShell>
  );
}
```

The shell auto-wires the centered top-bar search, the Lana button, the app switcher, the per-product left nav, and the bottom-of-nav notifications + profile dropdown. Override any of these via props. **Don't use it as default decoration** — it adds noise around focused explorations.

## Custom offering / persona example

When the design question requires a non-standard shell — new product type, persona-specific nav, custom user:

```tsx
import { faChartLine, faTableCellsLarge } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box } from '@mui/material';
import { DatasitePrototypeShell } from '~/shared';

// New offering type: "Deal Intelligence" — brand-new product, custom nav, custom user
export default function DealIntelligenceProjects() {
  return (
    <DatasitePrototypeShell
      productName="Deal Intelligence"
      navItems={[
        { label: 'Active Projects',     icon: <FontAwesomeIcon icon={faTableCellsLarge} />, active: true },
        { label: 'Market Intelligence', icon: <FontAwesomeIcon icon={faChartLine} /> },
      ]}
      user={{ name: 'Annie Smith', initials: 'AS' }}
      defaultExpanded
    >
      <Box sx={{ p: 4 }}>
        {/* … prototype content … */}
      </Box>
    </DatasitePrototypeShell>
  );
}
```

## Customization axes

Each axis can be customized independently:

| Axis | Prop | When to override |
|---|---|---|
| Product header text | `productName` | New offering type, brand exploration, or a non-standard label |
| Left nav items | `navItems` | New offering type, persona-specific nav, extending a default with `[...diligenceNavItems, customItem]` |
| Profile / user | `user={{ name, initials, avatarUrl }}` | Persona-specific demos, banker/admin/buyer personas |
| Top-bar actions | `topBarActions` | Custom right-side cluster (replace Lana + app switcher) |
| Profile dropdown | `profileMenu` or `profileMenuProps` | Real subscription data, custom help links, persona-specific menu |
| Initial expansion | `defaultExpanded` | Start expanded for nav-heavy mockups; collapsed for content-focused screens |
| Notifications | `notificationsCount`, `hideNotifications` | Hide entirely or show a real badge count |
| Search | `search={false}` or custom `search={<...>}` | Hide for non-search prototypes; replace for custom search UX |

Dark mode "just works" — the shell uses MUI theme tokens, so the gallery's global dark-mode toggle applies automatically.

## What to import from where

| Where | What's there | When to use |
|---|---|---|
| `~/shared` | `DatasitePrototypeShell`, `DatasitePageHeader`, `DatasiteProfileMenu`, product-mode nav arrays (`diligenceNavItems`, `acquireNavItems`, `pipelineNavItems`, `prepareNavItems`, `archiveNavItems`, `homeNavItems`) | **Always start here** when the prototype needs an app shell, page header, or profile menu — never rebuild from scratch. |
| `@mui/material` | All standard MUI components (Button, Card, Dialog, Tabs, etc.) | Inside the shell's content area, for everything else. |
| `~/theme/halo/components` | `HaloDialog`, `HaloAlert`, `HaloEmptyState`, `HaloSnackbar`, `HaloToggleButtonGroup`, `HaloTree` | When the wrapper adds something MUI doesn't (built-in close buttons, icon+title+actions empty state, pill-style toggle group). |
| `~/theme/halo/theme` | `haloTheme`, semantic palette tokens (`moondust`, `ruby`, `amber`, `tanzanite`, `jade`) | When you need a semantic color token directly (rarely — the theme already wires these into MUI's `palette`). |
| `@fortawesome/pro-light-svg-icons` (and other Pro packs) + `@fortawesome/react-fontawesome` | Vendored FA Pro icons. Pro Light is Halo's default weight. | All icons. Free FA packages are not in this repo. See `datasite-halo-design/references/icons.md` for the full pack/weight policy. |

## What NOT to do inside a prototype

- **No `ThemeProvider`** — the shell already provides one. Adding another nests theme contexts and breaks token inheritance.
- **No `BrowserRouter` / `Router` / route definitions** — the shell owns routing. Use internal state (`useState`) for multi-screen flows within one prototype.
- **No `package.json`, `vite.config.ts`, `tsconfig.json`** — every prototype is part of the single MFE bundle.
- **No new top-level dependencies** unless the designer explicitly needs something the existing stack can't do. If they do, surface it before installing.

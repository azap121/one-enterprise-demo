# Component anatomy

Exact specs for every Halo component. Use these values when Figma MCP is not connected or when you need to verify a value before coding. All values sourced from the HALO Figma library (file key `MocqvKfuogd2Re1tyFr4d4`).

**If Figma MCP is connected**, always prefer a live fetch using the node IDs in the Figma Index below — these specs are a snapshot and Figma is the source of truth.

---

## Canonical SVG assets

Inline these verbatim. Never redraw them.

**DS logo mark:**
```svg
<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M28.75 11H28.721H28.6556H28.5249H28.2635H27.7406H26.6948H24.6034C24.4434 11 24.2902 10.9364 24.177 10.8236C24.0637 10.7104 24.0005 10.5572 24.0005 10.3972L24.0003 6.21424C24.0003 6.09607 23.9042 6 23.786 6H10.2143C10.0961 6 10 6.09607 10 6.21424V10.7858C10 10.9039 10.0961 11 10.2143 11H23.396C23.5563 11 23.7099 11.0626 23.8231 11.1762C23.9363 11.2894 24.0003 11.4433 24.0003 11.6033V24.4169C24.0003 24.5715 23.9388 24.72 23.8296 24.8293C23.7203 24.9386 23.5717 25 23.417 25H10.2146C10.0964 25 10.0003 25.0961 10.0003 25.2142L10 29.7857C10 29.9039 10.0961 30 10.2143 30H23.786C23.9042 30 24.0003 29.9039 24.0003 29.7857V25.6234C24.0003 25.4581 24.066 25.2996 24.1828 25.1824C24.2996 25.0653 24.4581 25 24.6235 25H28.7857C28.9039 25 29 24.9039 29 24.7857V11.2133C29 11.0952 28.9042 11 28.786 11H28.75Z" fill="#0D0D0D"/>
</svg>
```

**HALO AI icon (orange circle, white 4-pointed star):**
```svg
<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z" fill="#EF601A"/>
  <path d="M31.3088 17.6175C22.6688 17.5613 18.4275 13.3313 18.3713 4.68V4.48874H17.6175V4.68C17.5613 13.32 13.32 17.5613 4.68002 17.6175H4.48877V18.3712H4.68002C13.32 18.4275 17.5613 22.6687 17.6175 31.3087V31.5H18.3713V31.3087C18.4275 22.6687 22.6688 18.4275 31.3088 18.3712H31.5V17.6175H31.3088Z" fill="white"/>
</svg>
```

---

## Prototype checklist

Run this before every push:

1. Figtree loaded from Google Fonts (weights 300, 400, 500, 600)
2. Icons: FA Pro Light as default weight — no free FA packages
3. `background/alt` is `#FAFAF7` — not `#F7F8FA`
4. Nav: collapsed by default (60px); logo + label + chevron all toggle expand
5. Search: centred in TopNav
6. No borders on LeftNav, TopNav, or LeftDrawer panels
7. AI panel: 440px wide, single panel, two views (chat / menu), hamburger toggles
8. All button text sentence case — never uppercase
9. DS logo and AI icon inlined verbatim from SVGs above

---

## Figma index

**File key:** `MocqvKfuogd2Re1tyFr4d4`
**File URL:** `https://www.figma.com/design/MocqvKfuogd2Re1tyFr4d4/⭐️--HALO--Design-System`

### Foundations
| Component | Node ID |
|---|---|
| Color Palette | `18837-227834` |
| Typography | `18370-45730` |

### Inputs
| Component | Node ID |
|---|---|
| Autocomplete | `11011-142571` |
| Button | `11011-143217` |
| Button Group | `11012-143487` |
| Button Toggle | `11022-146894` |
| Checkbox | `11012-143645` |
| Radio Group | `11012-147021` |
| Rating | `11017-144103` |
| Form Elements | `11140-154337` |
| Select | `11017-144316` |
| Slider | `11017-146185` |
| Switch | `11022-144509` |
| Text Field | `11022-144715` |

### Data Display
| Component | Node ID |
|---|---|
| Avatar | `10990-140796` |
| Badge | `11009-142432` |
| Chip | `11033-144919` |
| List | `11033-145389` |
| Left Drawer List | `27656-573633` |
| Tooltip | `11039-146663` |
| Typography | `11039-146766` |
| Tree | `11061-149673` |
| Left Drawer Tree | `27656-573195` |
| Date Picker | `24257-8199` |
| Time Picker | `24257-8220` |
| Date Range Picker | `24257-8236` |

### Feedback
| Component | Node ID |
|---|---|
| Alert | `10990-229266` |
| Backdrop | `11477-167022` |
| Dialog | `11045-146738` |
| Progress | `11045-146855` |
| Skeleton | `11045-147079` |
| Snackbar | `11045-147195` |

### Surfaces
| Component | Node ID |
|---|---|
| Accordion | `11048-147413` |
| Paper | `11048-150287` |
| Popover | `1488-24844` |

### Navigation
| Component | Node ID |
|---|---|
| Navigation (full reference) | `25988-13054` |
| Breadcrumbs | `11048-152651` |
| Link | `11051-148350` |
| Menu | `11051-148490` |
| Pagination | `11051-148776` |
| Stepper | `11053-152192` |
| Tabs | `11053-152542` |

### Custom components
| Component | Node ID |
|---|---|
| Empty State | `25828-106802` |
| Global Home Left Nav — Expanded | `25988-12727` |
| Global Home Left Nav — Collapsed | `25901-10451` |
| Diligence Left Nav — Expanded | `25988-11618` |
| Diligence Left Nav — Collapsed | `25988-12211` |

---

## Component specs

### INPUTS

#### Button
- Figma node `11011-143217` · Variants: Contained / Outlined / Text · Colors: Primary / Secondary / Error · `ai` prop for Datasite-AI Neon-Deep treatment
- Sizes: S 30 / M 36 / L 42 (height in px)
- Font: Figtree **500 (Medium)**, 14px / 24 lh / 0.4 ls (`button/medium` token)
- Border radius: 8px (`borderRadiusM`) · Padding aligned across contained/outlined/text
- **One Contained primary button maximum per dialog. Never two Contained buttons side by side.**
- Sentence case always — never uppercase

#### IconButton
- Colors: Default / Primary / Secondary / Error
- Sizes: Small 24px / Medium 32px / Large 40px
- Close button in DialogTitle: Default/Medium, 24×24px, `borderRadius 4px`, transparent, no border
- Hover: `rgba(31,34,39,0.04)`

#### Checkbox
- Always `size="small"` · FA icons: `_square` / `_square-check` / `_square-minus`
- MUI: `<FormControl>` + `<FormGroup>` + `<FormControlLabel control={<Checkbox size="small" />}>`

#### Radio
- Always `size="small"` · FA icons: `_circle-dot` / `circle`
- MUI: `<FormControl>` + `<RadioGroup>` + `<FormControlLabel control={<Radio size="small" />}>`

#### Switch
- Always `size="medium"` · Track: `#1F2227` 25% opacity, 36×20px
- MUI: `<Switch color="primary" size="medium" />`

#### TextField
- `<TextField label="Label" variant="outlined" size="small" />`
- Border radius: 4px · Padding: `px-8px` · Min height: 36px
- Value: Figtree 300, 14px · Label: Figtree 300, 12px

| State | Border | Background |
|---|---|---|
| Enabled | `rgba(31,34,39,0.23)` 1px | white |
| Hovered | `#1F2227` 1px | white |
| Focused | `rgba(72,94,240,0.5)` 2px | white |
| Disabled | `rgba(31,34,39,0.12)` 1px | white |
| Error | `#D43034` 1px | white |

Multiline: `<TextField multiline rows={4} />` · Height: 160px · Focused border: `rgba(72,94,240,0.3)` 2px

#### Select
- `<FormControl size="small" variant="outlined" fullWidth>` · Same borders as TextField
- Right slot: `angle-down` icon
- Multi-select chips: `bg #F7F6F2`, `border-radius 100%`, `min-h-24px`, `px-6px`

#### Slider
- `<Slider size="small" color="primary" />` · Track: `#485EF0` · Rail: `#DBDAD7` · Thumb: 16px

---

### DATA DISPLAY

#### Avatar
- Shape: circular · Sizes: 24px / 36px / 48px · Default fill: `#485EF0`

#### Badge
- `<Badge badgeContent={4} color="primary" />` · Number/Light: `bg #DBDAD7`, `text/primary`

#### Chip
- `<Chip label="Label" variant="filled" />` · Figma node `11033-144919`
- Label: Figtree 400 (Regular), 12px / 18 lh / 0.16 ls (`chip/label` token)
- Single height: 24px (no small/medium delta) · Border radius: 100 (pill)
- Filled default: `bg moondust[100]` · hover/focus `moondust[300]`
- Outlined default: `border alpha(moondust[900], 0.7)` (`_components/chip/defaultEnabledBorder` = `#191919b2`)
- Halo `data` color (turquoise) augmentation: filled `turquoise[200]/[700]`, outlined `turquoise[700]/[600]`
- Default deleteIcon: FA Pro Light `xmark`
- Padding: no icon → 12 each side · with start icon → edge-icon 8, icon-label 4, edge 8 · with delete → label-delete 8, edge-delete 8
- Filled colored variants (error/warning/success/info/secondary) — currently inherit MUI palette `<color>.main`. Halo Figma shows tinted bg + colored text (e.g. `RubyBG: #ef59741a`); follow-up needed

#### Divider
- Token: `palette.divider` = `alpha(moondust[900], 0.12)` (Figma `_components/divider/divider` = `#1919191f`). No text variants. Never hardcode the rgba or use a solid grey.

#### List / ListItem
- Width: 260px · Border radius: 8px
- Item: `px-8px py-4px`, `min-h-36px`
- MUI: `<List>` + `<ListItem>` + `<ListItemButton>` + `<ListItemText>` + `<ListItemIcon>`

| State | Background |
|---|---|
| Enabled | transparent |
| Hovered | `rgba(84,89,99,0.04)` |
| Selected | `rgba(72,94,240,0.08)` |
| Focused | `rgba(72,94,240,0.12)` |

#### Tree / TreeItem
- Border radius: 8px · Padding: `pl-8px pr-4px py-4px` (inside row bg)
- Indentation per depth: `[14, 22, 36, 50, 64, 78]px` — pixel-perfect to Figma node 24154:48854. Off-grid vs Halo 8px scale (only L4=64 snaps); flagged for follow-up.
- Expand icons: `angle-right` → `angle-down` · File icons: FA Pro Light (Halo default)
- **Icon swap rule:** `iconOpen` shown when `expanded === true`; `icon` otherwise. Selection alone never swaps the icon.
- **Hover → angle swap:** when `icon` is provided AND row has expandable children, hovering the row replaces the folder icon with `angle-right`/`angle-down`. Leaf rows and rows without children never swap.
- **Right slot (`actions` prop):** `HaloTreeAction[]` — `{ label, icon, onClick }` per action. Component renders `HaloTooltip → HaloIconButton size="small" → FontAwesomeIcon` (14px FA Pro Light). Visible on row hover only; selection alone does not reveal actions. Click stops propagation — actions never toggle expand/collapse.
- Row right padding: 8px (so actions sit 8px from container right edge)
- Left slot: symmetric 28px box with 8px external `mr` to label — folder icon and hover-swap angle center on the same pixel column
- **Selection (single-select):** `HaloTree` accepts `selectedId` / `defaultSelectedId` / `onSelect`. Items addressable via `id` prop. In selection mode (item has `id` AND tree has `onSelect`): chevron click toggles expand only (`stopPropagation`); row click selects via `onSelect(id)`. Selection persists through collapse/expand. No keyboard nav V1. Without `id`, items fall back to legacy whole-row-toggle behaviour.
- Chevron hover bg: 20×20 / radius 4 — matches `HaloIconButton size="small"` for consistent click affordance.

#### LeftDrawerTree
- Width: 260px · Border radius: 8px · Padding: `px-8px py-4px`
- Index variant bg: `background.defaultAlt` · Sandbox variant bg: `background.sandbox` (`alpha(amber[500], 0.1)` = `#FF8818 @ 10%`, mirrors Halo `background/sandbox` Figma variable — proposed token addition pending Halo Team approval)
- Subheader: 32px min height · Figtree Medium 14/1.57/0.1px · `text.secondary`
- **Index pattern:** chevron toggles, label is independent click target (`onLabelClick` → root view nav), ellipsis-vertical menu on by default
- **Sandbox pattern:** whole subheader row toggles, no menu unless `onMenuClick` provided
- **Folder-only surface — never render `<HaloTreeItem isLeaf>` files inside this wrapper.** Files belong in the main grid/table to the right of the drawer. Selection emits the folder id; builders wire it to the right-side folder path / contents display.
- `role="navigation"` + `aria-label="<title> folder navigation"` on root

#### Tooltip
- Background: `rgba(97,97,97,0.9)` · Border radius: 4px · Max width: 320px
- Font: Figtree 300, 12px, line-height 14px, white text
- Medium: `p-8px` · Small: `px-8px py-3px`

---

### FEEDBACK

#### Alert
- Width: 420px · Border radius: 8px · Border: 1px · Padding: `pt-4px pb-8px px-16px`
- Title: Figtree 400, 16px · Description: Figtree 300, 14px

| Severity | Background | Border | Icon |
|---|---|---|---|
| Error | ruby[50] `#feeef1` | `rgba(233,65,96,0.5)` | `circle-exclamation` |
| Warning | amber[50] `#fff4ea` | `rgba(239,96,26,0.5)` | `triangle-exclamation` |
| Info | tanzanite[50] `#eff1f8` | `rgba(47,78,127,0.5)` | `circle-info` |
| Success | jade[50] `#f1f5ed` | `rgba(61,87,37,0.5)` | `circle-check` |
| Tip | moondust[100] `#f7f6f2` | `rgba(25,25,25,0.5)` | `lightbulb` |

Icons are always shown — Figma has no icon-less alert variant. The `icon` prop is intentionally omitted from `HaloAlertProps`.

#### Backdrop
- `rgba(31,34,39,0.5)` scrim
- MUI: `<Backdrop open={open} />`

#### Dialog
- Sizes: xs=444px / sm=600px / md=900px / xl=1536px
- Paper: `bg #FAFAF7`, `border 1px #E0E0E0`, `border-radius 8px`
- **Content area is always white — never `#FAFAF7` inside DialogContent**
- Caution variant: `bg #FFE1E1` + `border rgba(212,48,52,0.5)`

`DialogTitle`: `pt-24px pb-16px px-24px` · Title: Figtree 400, 20px · Close: `xmark` IconButton Default/Medium (transparent, no border)

`DialogContent`: `py-8px px-24px` · Body: Figtree 300 · Background always `#FFFFFF` · With dividers: `border-top + border-bottom rgba(31,34,39,0.12)`

`DialogActions`: `pt-16px pb-24px px-24px` · Gap: 16px · Right-aligned
- 1 action: Contained primary
- 2 actions: Outlined Cancel + Contained primary
- 3 actions: Text + Outlined + Contained
- Caution variant: primary button `bg #C02641`

#### Progress
- Color: monochromatic — ring/fill `primary.dark` (#191919), track `alpha(primary.dark, 0.12)` (rgba(25,25,25,0.12))
- Circular sizes: Small 16px · Medium 24px · Large 48px
- Circular labels: `medium` shows free-text label below (gap 8); `large` determinate shows `${value}%` centered inside the ring
- Circular thickness: 4 for ≤24px, 3.5 for ≥40px (matches Figma ring proportion)
- Linear: 4px tall, square edges (no border-radius), full width
- Linear labels: `'none'` (default) · `'right'` (caption `${value}%` after the bar, gap 8) · `'bottom'` (tooltip-style chip centered below at `left: ${value}%` — bg `rgba(25,25,25,0.9)`, radius 4px, padding 8/3, white 12px/14 line/0.15 tracking)
- Right + circular labels: `typography.caption` (Figtree 400 12px / 1.66 / 0.4px), `text.primary`
- Figma: Linear `16152:91311`, Circular `17351:108422` (HALO Design System)

#### Skeleton
- Background: `rgba(31,34,39,0.04)` all shapes
- MUI: `<Skeleton variant="text" />` / `"circular"` / `"rectangular"`

#### Snackbar
- Background: `#1F2227` · Border: `#747880 1px` · Border radius: 8px · Min width: 420px
- Message: body2 white text
- MUI: `<Snackbar open={open} message="..." action={...} />`

---

### SURFACES

#### Accordion
- Width: 600px · Collapsed: `bg white` · Expanded: `border 1px #E0E0E0`
- Summary: `px-16px py-12px` · Heading: subtitle1 Figtree 400 · Expand icons: `angle-down` / `angle-up`
- Details: `pb-16px pt-8px px-16px` · Body: Figtree 300, 14px

#### Paper
- Background: white · Border: `1px #E0E0E0` · Border radius: 8px
- MUI: `<Paper variant="outlined" />`

#### Popover
- Background: white · Border: `1px #E0E0E0` · Border radius: 8px · Padding: 16px

---

### NAVIGATION

#### Breadcrumbs
- Up to 4 items; 5+ collapses the middle
- Font: Figtree 300, 12px · Non-current: `text/primary` · Current: `#454EB0` · Separator: `angle-right`

#### Link
- Font: Figtree 300, 16px
- MUI: `<Link underline="always">` or `<Link underline="hover">`

#### Menu / MenuItem
- Background: white · Border: `1px #E0E0E0` · Border radius: 4px · Width: 220px
- Item: `px-16px py-8px` · Font: Figtree 300, 14px

#### Pagination
- Item size: 24px · Border radius: 4px · Active: `rgba(72,94,240,0.08)`

#### Stepper
- Inactive: `bg rgba(31,34,39,0.38)`, white number — grey, not blue
- Active: `bg #485EF0` · Done: `circle-check solid` green
- Connector: `#D4D7DB` — grey, not primary blue

#### Tabs
- Tab: `px-16px py-8px` · Font: Figtree 400, 14px · Active: 2px indicator line
- Container: `border-bottom rgba(31,34,39,0.12)`

| State | Label colour | Background |
|---|---|---|
| Active + Enabled | `#485EF0` | transparent |
| Inactive + Enabled | `rgba(31,34,39,0.6)` | transparent |
| Disabled | `rgba(31,34,39,0.38)` | transparent |

---

### CUSTOM ORGANISMS

#### Empty State
- Background: white · Border radius: 16px · Width: 448px · Padding: `px-24px py-32px`
- Layout: `flex flex-col gap-24px items-center`
- Icon: 80×80px FA Duotone · Title: Figtree 400, 20px · Description: Figtree 300, 16px

#### LeftNav
- Background: `#FAFAF7` · Collapsed: 60px · Expanded: 200px · Transition: 150ms ease-out
- **No border on the panel**
- Logo row (h-60px, `px-12px py-6px`): DS logo 36px + product name Figtree 400, 20px + `chevron-left`
  - Logo, product name, and chevron all trigger expand/collapse
- Nav items (`px-12px py-4px`): inner `flex gap-12px items-center min-h-36px px-6px py-4px border-radius-8px`
  - Icon: 25×20px · Label: Figtree 300, 14px · Left-aligned · Hidden when collapsed
- Bottom: `bell` notifications + user row → opens UserMenu

| State | Background |
|---|---|
| Resting | transparent |
| Hovered | `rgba(84,89,99,0.04)` |
| Selected | `rgba(25,25,25,0.08)` |

#### TopNav
- Height: 60px · Background: `#FAFAF7` · **No border-bottom**
- Search: TextField flex-1 max-w-800px centred · Placeholder: "Ask or search for anything" · End adornment: `magnifying-glass`
- Right slot: HALO AI icon 36px + `grid solid` app switcher IconButton 24px

#### UserMenu
- Opens above user row · Width: 220px · Background: white · Border: `1px #E0E0E0` · Border radius: 8px
- Shadow: `0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)`
- Header (`px-16px py-12px`, `border-bottom #1F22271F`): 44px avatar + name Figtree 500, 14px + "Edit profile" Figtree 300, 12px `#1F222799`
- Items: `px-16px py-8px` Figtree 300, 14px · Hover: `rgba(31,34,39,0.04)`

#### AI Panel
- Width: 440px · Full viewport height · Slides from right · Transition: 200ms ease-out
- Background: `#FFFFFF` · Border: `border-left 1px #E0E0E0`
- Single panel, two views toggled by hamburger / ×

**Chat view (default):**
- Header (h-64px, no border): hamburger + AI icon + "Datasite AI" + `plus` / `expand` / `arrow-right-to-line`
- All header icons: 16px, `#1F2227CC`, 24×24px button, border-radius 4px
- Footer: prompt textarea + paperclip + send button (`bg #1F2227DE`, white `arrow-up`)
- Attribution: "Powered by Blueflame AI. Always review for accuracy." Figtree 300, 12px, `#1F222799`

**Menu view:**
- Header: × close only (top-left)
- `+ New Chat` button
- Agents section (`atom` icon): Propane, Dataroom Admin, Blueflame Research
- History section (`history` icon): recent chat threads
- Section labels: Figtree 500, 14px, `#1F2227DE`
- Items: `px-16px py-8px pl-40px` Figtree 300, 14px

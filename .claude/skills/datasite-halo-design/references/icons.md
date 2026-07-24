# Icons

How to pick and use icons in Halo prototypes and production code.

> **Canonical icon catalog:** `src/assets/icons/halo-icon-list.md` is pulled directly from the Halo Figma library and is the authoritative list of icons in the design system. **Always check it first** when picking an icon — the vocabulary table below is a curated subset focused on common UI concepts, but the Figma list is the source of truth.

## Available packs

The `halo-app` repo vendors FA Pro packages locally so designers don't need GAR auth. Imports work like any other npm package.

| Package | When to use |
|---|---|
| `@fortawesome/pro-light-svg-icons` | **Default.** Halo's canonical weight. Reach for this first. |
| `@fortawesome/pro-solid-svg-icons` | High-contrast UI: small icons on color backgrounds, badges, status pills, "filled" variants of toggles. |
| `@fortawesome/pro-regular-svg-icons` | Rare. Use only when Light lacks legibility at very small sizes. |
| `@fortawesome/pro-duotone-svg-icons` | File-type icons (`FileIcon` patterns). |
| `@fortawesome/duotone-light-svg-icons` | FA 7 split-out duotone weight. Use over `pro-duotone` for new code unless matching an existing pattern. |
| `@fortawesome/free-solid-svg-icons` | **Not available — removed from this repo.** Use `pro-solid-svg-icons` instead. |
| `@fortawesome/free-brands-svg-icons` | Company logos (GitHub, Slack, Google, Microsoft, etc.) — useful for prototype screenshots. Add as a regular npm dep when needed. |

**Sharp family is intentionally not vendored.** Halo's icon language is the classic family. If a prototype genuinely needs a Sharp icon, surface it before adding the pack.

## Import patterns

```tsx
import { faUserTie, faGear, faPlus } from '@fortawesome/pro-light-svg-icons';
import { faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

<FontAwesomeIcon icon={faUserTie} />
```

Tree-shaking: import individual icons (named imports), never the whole pack.

## Rules

1. **Don't mix weights on a single surface.** A toolbar of Light icons with one Solid icon among them looks broken.
2. **Only use Pro packs.** Pro Light is the canonical choice. Free FA packages are not in this repo — `pro-solid-svg-icons` covers any solid-weight needs.
3. **Don't use emoji as UI icons.** Emoji is fine for content (user-generated, status reactions). The product UI itself is icon-driven.
4. **Don't invent FA names from intuition.** When unsure, search the FA catalog (https://fontawesome.com/icons) by concept, then verify the name resolves with autocomplete in your editor.

## Concept → icon vocabulary

These are the icons actually used in `ds-ui-libraries` (Halo's canonical implementation) ranked by frequency where helpful. Use these names rather than guessing — they're the ones the production app uses, so prototypes built with them will feel native.

All names below are Pro Light unless marked otherwise. Some have direct Pro Solid equivalents (same name, different package).

### Actions

| Concept | Icon name | Notes |
|---|---|---|
| Add / create | `faPlus`, `faCirclePlus` | `faCirclePlus` for prominent create CTAs |
| Edit | `faPencilAlt` | Halo prefers `faPencilAlt` over `faPen` |
| Delete / remove | `faXmark`, `faTimes` | `faXmark` is the FA 6+ name |
| Close | `faXmark`, `faClose` | Same icon, different aliases |
| Save | `faCloudArrowUp` | For "save to cloud" feel; or `faFloppyDisk` for traditional save |
| Confirm / accept | `faCheck`, `faCircleCheck` | `faCircleCheck` (Pro Solid) for status |
| Copy | `faCopy` | |
| Share | `faShareNodes`, `faArrowUpRightFromSquare` | Latter for "open in new tab" |
| Download | `faCloudDownload`, `faArrowDownToLine` | `faCloudDownload` is Halo's preferred form |
| Upload | `faCloudArrowUp`, `faArrowUpToLine` | |
| Open external | `faArrowUpRightFromSquare`, `faExternalLink` | |
| More / overflow | `faEllipsisVertical` | Prefer vertical over horizontal |
| Expand region | `faArrowUpRightAndArrowDownLeftFromCenter` | |
| Refresh | `faArrowsRotate` | |

### Navigation

| Concept | Icon name |
|---|---|
| Home | `faHouse` |
| Back / left | `faChevronLeft`, `faAngleLeft`, `faCircleChevronLeftLight` |
| Forward / right | `faChevronRight`, `faAngleRight` |
| Up / collapse | `faChevronUp`, `faAngleUp` |
| Down / expand | `faChevronDown`, `faAngleDown`, `faCircleCaretDown` |
| Menu / hamburger | `faBars`, `faBarsStaggered` |
| Grid / cards view | `faGrid`, `faGrid2Plus` |
| List view | `faList` |
| Table view | `faTableColumns` |

### Status

| Concept | Icon name |
|---|---|
| Success | `faCircleCheck` (Pro Solid) |
| Error / failure | `faXmarkCircle`, `faTriangleExclamation` |
| Warning | `faTriangleExclamation` |
| Info | `faInfo`, `faCircleInfo` |
| Loading / processing | `faSpinner`, `faCircle` (with animation) |
| Help / question | `faCircleQuestion` |
| Disabled / blocked | `faBan` |
| Pending / waiting | `faClockRotateLeft` |

### Files & documents

Halo has dedicated file-type icons (Pro Duotone is the canonical weight here):

| Concept | Icon name |
|---|---|
| Generic file | `faFile`, `faFileLines` |
| PDF | `faFilePdf` |
| Word | `faFileWord` |
| Excel / spreadsheet | `faFileExcel` |
| PowerPoint | `faFilePowerpoint` |
| CSV | `faFileCsv` |
| Image | `faFileImage` |
| Video | `faFileVideo` |
| Audio | `faFileAudio` |
| Zip / archive | `faFileZipper` |
| Code | `faCode` |
| Folder (closed) | `faFolder` |
| Folder (open) | `faFolderOpen` |
| Folder settings | `faFolderGear` |

### Communication

| Concept | Icon name |
|---|---|
| Comment / note | `faCommentLines`, `faCommentDots` |
| Email / message | `faEnvelopeOpenText` |
| Inbox | `faInboxFull` |
| Notification (bell, no badge) | `faBell` |
| Notification (active / new) | `faBellOn` |

### User & identity

| Concept | Icon name |
|---|---|
| User (generic) | `faUser`, `faCircleUser` |
| Profile / sign out | `faArrowRightFromBracket` (sign out arrow) |
| Settings / preferences | `faGear` |

### Search & filter

| Concept | Icon name |
|---|---|
| Search | `faMagnifyingGlass` |
| Filter | `faFilter` |
| Sort | `faArrowDownWideShort`, `faArrowUpShortWide` |

### Time

| Concept | Icon name |
|---|---|
| Calendar | `faCalendar`, `faCalendarDays` |
| Clock | `faClock` |
| History / activity log | `faClockRotateLeft` |
| Recent | `faClockRotateLeft`, `faRectangleHistoryCirclePlus` |

### Datasite domain

| Concept | Icon name |
|---|---|
| AI / intelligence ("Lana") | `faSparkles` ⭐ very common in Halo |
| Bookmark / favorite | `faBookmark` |
| Archive (verb) | `faBoxArchive` |
| Theme: light mode | `faSunBright` |
| Theme: dark mode | `faMoon` |
| Brush / formatting | `faBrush` |

### When the catalog doesn't have a clear match

1. Search https://fontawesome.com/icons by concept word — they have synonyms indexed.
2. Pick the closest semantic match in **Pro Light**. Avoid switching weights to find a match.
3. If nothing fits and the prototype needs a custom mark, surface it to the designer before introducing one — "the FA catalog has nothing for X, want to use [closest] or skip the icon?"
4. Never hand-roll an SVG inside a prototype. If the design genuinely needs a non-FA glyph, the right answer is to commit it under `src/assets/icons/` and load it as an `<img>` or inline SVG component.

## Refresh cadence

The vendored FA packages are updated when FA ships a major version bump (annually-ish) by running `~/scripts/vendor-fa-pro.sh` and committing the result. The vocabulary above should be re-checked against `ds-ui-libraries` usage at the same time — new icons that have started showing up in production should be added here.

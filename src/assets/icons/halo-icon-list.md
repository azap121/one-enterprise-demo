# HALO Icon List

Source of truth: [HALO Design System — Icons canvas](https://www.figma.com/design/MocqvKfuogd2Re1tyFr4d4/%E2%AD%90%EF%B8%8F--HALO--Design-System?node-id=6594:47638)

These are the FA Pro icons used in the HALO design system. Organized by weight. Default weight is **Light**. Duotone is used for file-type icons (`FileIcon`). Solid is used for active/selected states.

---

## FA Pro Light

| Icon name |
|---|
| address-book |
| align-left |
| angle-down |
| angle-left |
| angle-right |
| angle-up |
| angles-left |
| angles-right |
| arrow-down |
| arrow-down-1-9 |
| arrow-down-9-1 |
| arrow-down-a-z |
| arrow-down-z-a |
| arrow-left |
| arrow-left-to-line |
| arrow-right |
| arrow-right-to-line |
| arrow-rotate-left |
| arrow-rotate-right |
| arrow-up |
| arrow-up-arrow-down |
| arrow-up-right-and-arrow-down-left-from-center |
| arrow-up-right-from-square |
| arrows-rotate-reverse |
| asterisk |
| award |
| bars |
| bars-staggered |
| bell |
| bold (b) |
| bolt |
| bookmark |
| books |
| box-archive |
| browser |
| cabinet-filing |
| calendar-check |
| calendar-day |
| certificate |
| chart-area |
| chart-bar |
| chart-line-up |
| chart-pie |
| chart-waterfall |
| check |
| circle |
| circle-check |
| circle-exclamation |
| circle-info |
| circle-minus |
| circle-plus |
| circle-question |
| circle-user |
| circle-xmark |
| clipboard |
| clipboard-check |
| clock |
| clock-rotate-left |
| clone |
| cloud-arrow-down |
| cloud-arrow-up |
| cloud-slash |
| columns-3 |
| comment |
| comment-dollar |
| comment-dots |
| comment-lines |
| comments |
| compass |
| copy |
| crosshairs |
| cube |
| display |
| droplet |
| ellipsis |
| ellipsis-vertical |
| envelope |
| envelope-open |
| envelope-open-text |
| expand |
| eye |
| eye-slash |
| file |
| file-arrow-down |
| file-circle-check |
| file-circle-minus |
| file-excel |
| file-invoice |
| file-lines |
| file-plus |
| file-slash |
| files |
| filter |
| flag |
| folder |
| folder-arrow-right |
| folder-arrow-up |
| folder-gear |
| folder-grid |
| folder-magnifying-glass |
| folder-open |
| folder-plus |
| font |
| function |
| gear |
| gears |
| grip-dots |
| grip-dots-vertical |
| grid-2-plus |
| hashtag |
| highlighter |
| house |
| i-cursor |
| inbox |
| inbox-full |
| italic |
| key |
| language |
| layer-group |
| lightbulb |
| link |
| list |
| list-check |
| list-ol |
| list-radio |
| list-tree |
| lock |
| lock-open |
| magnifying-glass |
| map |
| map-pin |
| memo |
| microchip |
| note-sticky |
| palette |
| paperclip |
| paper-plane-top |
| pen |
| pen-ruler |
| pen-to-square |
| plus |
| power-off |
| print |
| print-slash |
| puzzle |
| quote-left |
| rectangle-history |
| rectangle-history-circle-plus |
| recycle |
| reply |
| reply-all |
| right-left |
| robot |
| road-barrier |
| rocket |
| share-nodes |
| shield-halved |
| signature |
| sliders |
| sparkles |
| spinner |
| square |
| square-check |
| square-dashed-circle-plus |
| square-minus |
| square-plus |
| star |
| suitcase |
| table |
| table-cells |
| table-columns |
| table-layout |
| tag |
| tags |
| text-slash |
| thumbs-down |
| thumbs-up |
| thumbtack |
| trash-can |
| triangle-exclamation |
| underline |
| unlock |
| usb-drive |
| user |
| user-gear |
| user-lock |
| user-plus |
| user-slash |
| users |
| users-gear |
| users-medical |
| wave-pulse |
| window-minimize |
| wrench |
| xmark |

---

## FA Pro Duotone

Used primarily for `FileIcon` / file-type representations.

| Icon name |
|---|
| bookmark |
| box-archive |
| comment-lines |
| file |
| file-csv |
| file-excel |
| file-image |
| file-lines |
| file-pdf |
| file-powerpoint |
| file-video |
| file-word |
| file-zipper |
| folder |
| folder-arrow-right |
| folder-gear |
| folder-open |
| star |
| thumbtack |

---

## FA Pro Solid

Used for active/selected states.

| Icon name |
|---|
| address-book |
| award |
| books |
| cabinet-filing |
| chart-bar |
| chart-line-up |
| chart-pie |
| circle |
| circle-check |
| comments |
| file-lines |
| flag |
| gear |
| grid |
| grid-2-plus |
| highlighter |
| house |
| inbox |
| list-check |
| magnifying-glass |
| rectangle-history |
| star |
| thumbtack |
| user-lock |
| users |

---

## Custom HALO Icons

Not from FA — these are bespoke icons designed for HALO-specific use cases.

| Icon name | Weight |
|---|---|
| Blueflame | custom |
| box-archive-circle-plus | custom light |
| box-archive-gear | custom light + duotone |
| box-archive-link | custom duotone |
| box-archive-triangle-exclamation | custom light |
| clock-rotate-left-slash | custom light |
| file-line | custom light |
| files-checkmark | custom light |
| highlighter-sparkle | custom light |
| list-sparkle | custom light |
| shield-acrobat | custom light |
| shield-acrobat-gear | custom light |
| shield-halved-gear | custom light |
| table-sparkle | custom light |
| circle-dot | custom light |

---

## Notes for engineering

- **Total FA Pro icons:** ~155 light, 19 duotone, 25 solid
- **Custom icons:** 15 bespoke HALO SVGs (not in FA Pro package)
- **Package:** `@fortawesome/pro-light-svg-icons`, `@fortawesome/pro-duotone-svg-icons`, `@fortawesome/pro-solid-svg-icons` — all via GAR (`us-npm.pkg.dev/utils-prod-ds01/ds-font-awesome/`)
- **Custom icons** are not in any FA package — these need to be sourced from Figma SVG exports
- **Wireframing cursors** (Default, Hand Pointer, Type, Move/Drag, Resize variants, Zoom In/Out, Hourglass, Unavailable) exist in Figma for design use only — not needed in code

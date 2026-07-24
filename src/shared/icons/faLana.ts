// Datasite Lana brand icon — path extracted from Figma top-bar SVG (April 2026).
// Original coords: center (1310, 30) in a 1380×60 frame.
// Normalized: bounding box translated to (0,0), natural size ≈ 27×27.
//
// Usage: <FontAwesomeIcon icon={faLana as IconProp} />
// The orange circle comes from the parent button's bgcolor — this is just the white star.

export const faLana = {
  prefix: 'fac',
  iconName: 'lana',
  icon: [
    27,    // viewBox width
    27,    // viewBox height
    [],
    '',
    'M26.82 13.13C18.18 13.07 13.94 8.84 13.88 0.19V0H13.13V0.19C13.07 8.83 8.83 13.07 0.19 13.13H0V13.88H0.19C8.83 13.94 13.07 18.18 13.13 26.82V27.01H13.88V26.82C13.94 18.18 18.18 13.94 26.82 13.88H27.01V13.13H26.82Z',
  ],
} as const;

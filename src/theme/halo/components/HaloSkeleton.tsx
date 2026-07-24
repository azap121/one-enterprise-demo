/**
 * HaloSkeleton
 *
 * Full Halo-spec wrapper around MUI Skeleton.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Skeleton> (node 11045:147079)
 * Tokens:
 *   background: rgba(31,34,39,0.04) — all shapes (text, circular, rectangular)
 *   Uses animation="wave" per Halo motion spec (calm, no bounce)
 *
 * Usage:
 *   <HaloSkeleton variant="text" width={200} />
 *   <HaloSkeleton variant="circular" width={36} height={36} />
 *   <HaloSkeleton variant="rectangular" width={320} height={120} />
 *
 *   // Inline with content:
 *   <Typography><HaloSkeleton /></Typography>
 */
import { Skeleton, type SkeletonProps } from '@mui/material';

export function HaloSkeleton({ animation = 'wave', sx, ...props }: SkeletonProps) {
  return (
    <Skeleton
      animation={animation}
      sx={{
        backgroundColor: 'rgba(31,34,39,0.04)',
        '&::after': {
          background: 'linear-gradient(90deg, transparent, rgba(31,34,39,0.04), transparent)',
        },
        ...sx,
      }}
      {...props}
    />
  );
}

export type HaloSkeletonProps = SkeletonProps;

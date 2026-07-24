/**
 * HaloAISparkleStartIcon — canonical Datasite-AI affordance for any button,
 * icon button, chip, link, menu item, or surface that invokes a Datasite-AI
 * feature.
 *
 * Pattern: a Font Awesome icon as the base layer + a 4-pointed Neon Deep
 * sparkle pinned to the top-right corner with a circular mask behind it that
 * matches the host surface background. The sparkle reads cleanly against any
 * FA icon, no corner dot needed.
 *
 * Brand color: #EF601A (Datasite-AI Neon Deep). Disabled: dim gray so the
 * sparkle fades alongside its host control. Disabled mask is transparent to
 * avoid alpha doubling against `action.disabledBackground`.
 *
 * Usage:
 *   <HaloButton ai startIcon={<HaloAISparkleStartIcon icon={faLightbulb} />}>
 *     Ask AI
 *   </HaloButton>
 *
 *   <HaloButton ai disabled startIcon={<HaloAISparkleStartIcon icon={faList} disabled />}>
 *     Disabled
 *   </HaloButton>
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export const AI_NEON_DEEP = '#EF601A';
const AI_DISABLED_FILL = '#9E9E9E';

const SPARKLE_PATH =
  'M8.80851 4.30851C6.53745 4.30851 4.69149 2.46255 4.69149 0.191489C4.69149 0.0842553 4.60723 0 4.5 0C4.39277 0 4.30851 0.0842553 4.30851 0.191489C4.30851 2.46255 2.46255 4.30851 0.191489 4.30851C0.0842553 4.30851 0 4.39277 0 4.5C0 4.60723 0.0842553 4.69149 0.191489 4.69149C2.46255 4.69149 4.30851 6.53745 4.30851 8.80851C4.30851 8.91574 4.39277 9 4.5 9C4.60723 9 4.69149 8.91574 4.69149 8.80851C4.69149 6.53745 6.53745 4.69149 8.80851 4.69149C8.91574 4.69149 9 4.60723 9 4.5C9 4.39277 8.91574 4.30851 8.80851 4.30851Z';

export interface HaloAISparkleStartIconProps {
  icon: IconDefinition;
  disabled?: boolean;
}

export const HaloAISparkleStartIcon: React.FC<HaloAISparkleStartIconProps> = ({ icon, disabled = false }) => {
  const sparkleColor = disabled ? AI_DISABLED_FILL : AI_NEON_DEEP;
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <FontAwesomeIcon icon={icon} />
      <Box
        aria-hidden
        sx={(theme) => {
          const isDark = theme.palette.mode === 'dark';
          // ai Button hover/focus tint values from theme.ts (light: 0.04, dark: 0.08).
          // Mask must layer the same amber alpha over background.paper so it tracks
          // the parent button's bg state — no white circle on hover/focus.
          const hoverAlpha = isDark ? 0.08 : 0.04;
          const focusAlpha = isDark ? 0.12 : 0.08;
          const tint = (a: number) => `linear-gradient(${alpha(AI_NEON_DEEP, a)}, ${alpha(AI_NEON_DEEP, a)})`;
          return {
            position: 'absolute',
            top: 0,
            right: 0,
            width: 14,
            height: 14,
            transform: 'translate(40%, -40%)',
            borderRadius: '50%',
            // Disabled: transparent so button's disabled bg shows through cleanly
            // (avoids doubled alpha when layering action.disabledBackground twice).
            backgroundColor: disabled ? 'transparent' : theme.palette.background.paper,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            // Track parent button's hover + focus state so mask color matches
            // the surrounding button bg blend exactly.
            //
            // Why background.default on hover (not paper): the ai Button hover
            // sets backgroundColor to alpha(amber[600], 0.0X), which is
            // translucent — it composites against the page behind the button
            // (background.default), not the button's rest paper. To match
            // exactly, the mask switches its base from paper → default on
            // hover/focus, then layers the same amber alpha on top. In light
            // mode paper === default so this is a no-op; in dark mode it
            // removes the visible mask contrast.
            ...(disabled
              ? {}
              : {
                  '.MuiButtonBase-root:hover &': {
                    backgroundColor: theme.palette.background.default,
                    backgroundImage: tint(hoverAlpha),
                  },
                  '.MuiButtonBase-root.Mui-focusVisible &': {
                    backgroundColor: theme.palette.background.default,
                    backgroundImage: tint(focusAlpha),
                  },
                }),
          };
        }}
      >
        <svg width={12} height={12} viewBox="0 0 9 9" fill="none" style={{ display: 'block' }}>
          <path d={SPARKLE_PATH} fill={sparkleColor} />
        </svg>
      </Box>
    </Box>
  );
};

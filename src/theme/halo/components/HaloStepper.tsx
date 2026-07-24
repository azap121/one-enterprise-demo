/**
 * HaloStepper
 *
 * Halo-spec wrapper around MUI Stepper.
 *
 * Figma: ⭐️ [HALO] Design System → <HALO_Stepper> (node 11053:152192)
 *                                   <HALO_Step>    (node 6576:50986)
 *                                   <HALO_Step Icon> (node 6576:51232)
 * Tokens (get_variable_defs, node 11053:152192):
 *   step icon size:    24×24px, border-radius 100px (50%)
 *   active bg:         primary/main (#4e4e4d) — dark charcoal, NOT tanzanite
 *   inactive bg:       action/disabled rgba(78,78,77,0.38)
 *   completed icon:    faCircleCheck solid, color primary/main (#4e4e4d)
 *   icon number:       fontWeightMedium=500, 14px, lh 1.57, ls 0.1px, white
 *   connector:         _components/stepper/connector (#bfbebb), 1px
 *   vertical connector ml: 11px (center under 24px icon)
 *   label typography:  subtitle2 — fontWeightMedium=500, 14px, lh 1.57, ls 0.1px
 *   active label:      text/primary (#323232)
 *   inactive label:    text/disabled rgba(78,78,77,0.38)
 *   completed label:   text/primary (#323232)
 *   optional label:    caption — fontWeightRegular=400, 12px, lh 1.66, ls 0.4px, text/secondary
 *
 * Usage:
 *   <HaloStepper
 *     activeStep={1}
 *     steps={[
 *       { label: 'Deal info' },
 *       { label: 'Participants', optional: 'Optional' },
 *       { label: 'Documents' },
 *       { label: 'Review' },
 *     ]}
 *   />
 *
 *   // Vertical:
 *   <HaloStepper orientation="vertical" activeStep={2} steps={[...]} />
 *
 *   // Non-linear (any step clickable):
 *   <HaloStepper nonLinear activeStep={active} onStepClick={setActive} steps={[...]} />
 */
import { faCircleCheck } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Box,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  type StepLabelProps,
  Stepper,
  type StepperProps,
  Typography,
} from '@mui/material';
import React from 'react';

// ── Custom step icon ──────────────────────────────────────────────────────────

interface HaloStepIconProps {
  active: boolean;
  completed: boolean;
  icon: React.ReactNode;
}

function HaloStepIcon({ active, completed, icon }: HaloStepIconProps) {
  if (completed) {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4e4e4d', // primary/main
          fontSize: 24,
        }}
      >
        <FontAwesomeIcon icon={faCircleCheck} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: active
          ? '#4e4e4d'                   // primary/main — dark charcoal
          : 'rgba(78,78,77,0.38)',       // action/disabled
        color: '#ffffff',               // primary/contrastText
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Figtree, system-ui, sans-serif',
        fontWeight: 500,                // fontWeightMedium
        fontSize: '0.875rem',           // 14px
        lineHeight: 1.57,               // subtitle2
        letterSpacing: '0.1px',         // subtitle2
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
  );
}

// ── Custom connector ──────────────────────────────────────────────────────────

const HaloStepConnector = (
  <StepConnector
    sx={{
      [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 12,
      },
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#bfbebb', // _components/stepper/connector
        borderTopWidth: 1,
      },
      [`&.${stepConnectorClasses.vertical}`]: {
        ml: '11px', // center under 24px icon (12px center - 1px border = 11px)
        [`& .${stepConnectorClasses.line}`]: {
          borderLeftWidth: 1,
          borderColor: '#bfbebb', // _components/stepper/connector
          minHeight: 16,
        },
      },
    }}
  />
);

// ── HaloStepper ───────────────────────────────────────────────────────────────

export interface HaloStepItem {
  label: React.ReactNode;
  /** Small caption below the step label */
  optional?: React.ReactNode;
  /** Override label props */
  labelProps?: Partial<StepLabelProps>;
}

export interface HaloStepperProps extends Omit<StepperProps, 'children'> {
  steps: HaloStepItem[];
  activeStep: number;
  onStepClick?: (index: number) => void;
}

export function HaloStepper({
  steps,
  activeStep,
  onStepClick,
  sx,
  ...props
}: HaloStepperProps) {
  return (
    <Stepper
      activeStep={activeStep}
      connector={HaloStepConnector}
      sx={[
        (theme) => ({
          '& .MuiStepLabel-label': {
            fontFamily: theme.typography.fontFamily,
            fontWeight: theme.typography.fontWeightMedium ?? 500, // subtitle2
            fontSize: '0.875rem',
            lineHeight: 1.57,          // subtitle2
            letterSpacing: '0.1px',    // subtitle2
            color: 'text.disabled',    // inactive = text/disabled
            '&.Mui-active': {
              fontWeight: theme.typography.fontWeightMedium ?? 500,
              color: 'text.primary',
            },
            '&.Mui-completed': {
              fontWeight: theme.typography.fontWeightMedium ?? 500,
              color: 'text.primary',
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    >
      {steps.map((step, index) => (
        <Step
          key={index}
          onClick={onStepClick ? () => onStepClick(index) : undefined}
          sx={{ cursor: onStepClick ? 'pointer' : 'default' }}
        >
          <StepLabel
            StepIconComponent={(iconProps) => (
              <HaloStepIcon
                active={iconProps.active ?? false}
                completed={iconProps.completed ?? false}
                icon={iconProps.icon}
              />
            )}
            optional={
              step.optional ? (
                <Typography
                  sx={(theme) => ({
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeightRegular ?? 400, // caption
                    fontSize: '0.75rem',    // 12px
                    lineHeight: 1.66,       // caption
                    letterSpacing: '0.4px', // caption
                    color: 'text.secondary',
                  })}
                >
                  {step.optional}
                </Typography>
              ) : undefined
            }
            {...step.labelProps}
          >
            {step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

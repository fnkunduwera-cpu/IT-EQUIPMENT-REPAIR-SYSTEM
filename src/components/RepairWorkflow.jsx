import { Box, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { STATUSES } from '../data/seed';

export default function RepairWorkflow({ status }) {
  const active = Math.max(0, STATUSES.indexOf(status));
  return (
    <Box>
      <Stepper activeStep={active} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
        {STATUSES.map((label) => (
          <Step key={label} completed={STATUSES.indexOf(label) < active || status === 'Collected'}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexWrap: 'wrap', gap: 1 }}>
        {STATUSES.map((label, index) => (
          <Typography
            key={label}
            variant="caption"
            sx={{
              px: 1, py: 0.5, borderRadius: 99,
              bgcolor: index === active ? 'primary.main' : index < active ? 'success.light' : 'action.hover',
              color: index <= active ? 'white' : 'text.secondary',
              fontWeight: 700,
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

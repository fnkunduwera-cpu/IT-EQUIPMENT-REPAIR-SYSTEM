import { Box, Card, CardContent, Typography } from '@mui/material';

export default function StatCard({ label, value, hint, icon, tone = '#0B3D6E' }) {
  return (
    <Card className="stat-card" sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: `${tone}14`, color: tone, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" sx={{ lineHeight: 1.2 }}>{value}</Typography>
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

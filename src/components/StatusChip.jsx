import { Chip } from '@mui/material';
import { COLLECTION_COLORS, PRIORITY_COLORS, STATUS_COLORS, TECH_COLORS } from '../theme';

export default function StatusChip({ value, kind = 'status' }) {
  const map = { status: STATUS_COLORS, priority: PRIORITY_COLORS, collection: COLLECTION_COLORS, tech: TECH_COLORS };
  const color = map[kind]?.[value] || 'default';
  return <Chip size="small" label={value || '—'} color={color} variant={color === 'default' ? 'outlined' : 'filled'} />;
}

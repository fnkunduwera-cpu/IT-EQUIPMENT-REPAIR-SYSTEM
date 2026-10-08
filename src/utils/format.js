export const money = (n) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const today = () => new Date().toISOString().slice(0, 10);

export const nowParts = () => {
  const d = new Date();
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 8),
    iso: d.toISOString(),
  };
};

export const pct = (part, whole) => {
  if (!whole) return 0;
  return Math.round((Number(part) / Number(whole)) * 1000) / 10;
};

export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`)
        .join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function nextSerial(list, field, prefix, year = 2026) {
  const max = list.reduce((m, item) => {
    const match = String(item[field] || '').match(/(\d+)$/);
    return Math.max(m, match ? Number(match[1]) : 0);
  }, 0);
  return `${prefix}-${year}-${String(max + 1).padStart(4, '0')}`;
}

export function nextId(list, prefix) {
  const max = list.reduce((m, item) => {
    const match = String(item.id || '').match(/(\d+)$/);
    return Math.max(m, match ? Number(match[1]) : 0);
  }, 0);
  return `${prefix}-${max + 1}`;
}

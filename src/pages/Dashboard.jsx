import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Alert, Box, Card, CardContent, Chip, LinearProgress, Stack, Typography,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import InboxIcon from '@mui/icons-material/Inbox';
import BiotechIcon from '@mui/icons-material/Biotech';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PaymentsIcon from '@mui/icons-material/Payments';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useStore } from '../context/StoreContext';
import StatCard from '../components/StatCard';
import StatusChip from '../components/StatusChip';
import { formatDate, money } from '../utils/format';

const COLORS = ['#1C6EA4', '#E07A1F', '#0E8A6A', '#1F8A4C', '#7A8797', '#C4382A'];

function Panel({ title, children, action }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6">{title}</Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function MiniList({ rows, empty, onClick }) {
  if (!rows.length) return <Typography color="text.secondary">{empty}</Typography>;
  return (
    <Stack spacing={1}>
      {rows.map((row) => (
        <Box key={row.id} onClick={() => onClick(row)} sx={{ p: 1.2, border: '1px solid #E6EDF5', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#F7FAFD' } }}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <Box>
              <Typography fontWeight={700}>{row.title}</Typography>
              <Typography variant="body2" color="text.secondary">{row.subtitle}</Typography>
            </Box>
            {row.chip}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

export default function Dashboard() {
  const store = useStore();
  const navigate = useNavigate();
  const { notify } = useOutletContext();
  const cards = [
    { label: 'Total Customers', value: store.stats.customers, icon: <PeopleIcon />, tone: '#0B3D6E' },
    { label: 'Total Equipment', value: store.stats.equipment, icon: <DevicesIcon />, tone: '#1C6EA4' },
    { label: 'Total Repair Tickets', value: store.stats.tickets, icon: <ConfirmationNumberIcon />, tone: '#0E8A6A' },
    { label: 'Received', value: store.stats.received, icon: <InboxIcon />, tone: '#1C6EA4' },
    { label: 'Under Diagnosis', value: store.stats.diagnosis, icon: <BiotechIcon />, tone: '#E07A1F' },
    { label: 'Repairing', value: store.stats.repairing, icon: <BuildIcon />, tone: '#0E8A6A' },
    { label: 'Ready for Collection', value: store.stats.ready, icon: <CheckCircleIcon />, tone: '#1F8A4C' },
    { label: 'Collected', value: store.stats.collected, icon: <InventoryIcon />, tone: '#5C6B7A' },
    { label: 'Unassigned Tickets', value: store.stats.unassigned, icon: <PersonOffIcon />, tone: '#C4382A' },
    { label: 'Total Estimated Cost', value: money(store.stats.estimated), icon: <RequestQuoteIcon />, tone: '#0B3D6E' },
    { label: 'Total Actual Cost', value: money(store.stats.actual), icon: <PaymentsIcon />, tone: '#0E8A6A' },
    { label: 'Outstanding Collection', value: store.stats.outstandingCount, hint: money(store.stats.outstandingAmount), icon: <NotificationsActiveIcon />, tone: '#E07A1F' },
  ];

  const statusData = ['Received', 'Diagnosis', 'Repairing', 'Ready', 'Collected'].map((name) => ({
    name, value: store.tickets.filter((t) => t.status === name).length,
  }));
  const typeData = useMemo(() => {
    const map = {};
    store.tickets.forEach((t) => {
      const type = store.equipmentById(t.equipmentId)?.equipmentType || 'Other';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [store]);
  const techData = useMemo(() => store.technicians.slice(0, 8).map((t) => ({
    name: t.fullName.split(' ')[0],
    active: store.techActive(t.id),
    done: store.techDone(t.id),
  })), [store]);
  const monthly = useMemo(() => {
    const map = {};
    store.tickets.forEach((t) => {
      const key = t.dateReceived.slice(0, 7);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map).sort().map((name) => ({ name, tickets: map[name] }));
  }, [store]);
  const costCompare = [
    { name: 'Estimated', amount: store.stats.estimated },
    { name: 'Actual', amount: store.stats.actual },
  ];
  const priorityData = ['Low', 'Medium', 'High', 'Urgent'].map((name) => ({
    name, value: store.tickets.filter((t) => t.priority === name).length,
  }));

  const recent = [...store.tickets].sort((a, b) => b.dateReceived.localeCompare(a.dateReceived)).slice(0, 5);
  const repairing = store.tickets.filter((t) => t.status === 'Repairing').slice(0, 5);
  const awaiting = store.tickets.filter((t) => t.status === 'Received' || t.status === 'Diagnosis').slice(0, 5);
  const ready = store.tickets.filter((t) => t.status === 'Ready').slice(0, 5);
  const completed = store.tickets.filter((t) => t.status === 'Collected').slice(0, 5);
  const highCost = [...store.tickets].filter((t) => t.actualCost > 0).sort((a, b) => b.actualCost - a.actualCost).slice(0, 5);
  const recentCustomers = [...store.customers].sort((a, b) => b.registrationDate.localeCompare(a.registrationDate)).slice(0, 5);

  const rowFor = (t) => ({
    id: t.id,
    title: `${t.ticketNumber} · ${store.equipmentById(t.equipmentId)?.brand || ''} ${store.equipmentById(t.equipmentId)?.model || ''}`,
    subtitle: `${store.customerById(t.customerId)?.fullName || '—'} · ${formatDate(t.dateReceived)}`,
    chip: <StatusChip value={t.status} />,
  });

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h4">Repair center dashboard</Typography>
        <Typography color="text.secondary">Live counts from repair tickets, costs, and collection status. Charts update when data changes.</Typography>
      </Box>
      {store.stats.ready > 0 && (
        <Alert severity="success" action={<Chip label="View queue" onClick={() => navigate('/queue')} />}>
          {store.stats.ready} equipment item(s) are ready for customer collection ({money(store.stats.outstandingAmount)}).
        </Alert>
      )}
      {store.stats.unassigned > 0 && (
        <Alert severity="warning">{store.stats.unassigned} open ticket(s) have no technician assigned.</Alert>
      )}
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' } }}>
        <Panel title="Repair tickets by status">
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0B3D6E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Panel>
        <Panel title="Priority distribution">
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {priorityData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Panel>
      </Box>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        <Panel title="Monthly repair volume">
          <Box sx={{ height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="tickets" stroke="#0E8A6A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Panel>
        <Panel title="Estimated vs actual cost">
          <Box sx={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={costCompare}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="amount" fill="#E07A1F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Panel>
      </Box>
      <Panel title="Repairs by equipment type">
        <Box sx={{ height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1C6EA4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Panel>
      <Panel title="Technician workload">
        <Stack spacing={1.2}>
          {techData.map((t) => (
            <Box key={t.name}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{t.name}</Typography>
                <Typography variant="caption">{t.active} active · {t.done} completed</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={Math.min(100, t.active * 20)} />
            </Box>
          ))}
        </Stack>
      </Panel>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Panel title="Recent repair tickets">
          <MiniList rows={recent.map(rowFor)} empty="No tickets yet." onClick={(r) => navigate(`/repair-tickets/${r.id}`)} />
        </Panel>
        <Panel title="Equipment currently being repaired">
          <MiniList rows={repairing.map(rowFor)} empty="Nothing is in repair." onClick={(r) => navigate(`/repair-tickets/${r.id}`)} />
        </Panel>
        <Panel title="Tickets awaiting diagnosis">
          <MiniList rows={awaiting.map(rowFor)} empty="Diagnosis queue is clear." onClick={(r) => navigate(`/repair-tickets/${r.id}`)} />
        </Panel>
        <Panel title="Ready-for-collection equipment">
          <MiniList rows={ready.map(rowFor)} empty="No equipment is waiting." onClick={(r) => navigate(`/repair-tickets/${r.id}`)} />
        </Panel>
        <Panel title="Recent completed repairs">
          <MiniList rows={completed.map(rowFor)} empty="No completed repairs." onClick={(r) => navigate(`/repair-tickets/${r.id}`)} />
        </Panel>
        <Panel title="High-cost repairs">
          <MiniList
            rows={highCost.map((t) => ({ ...rowFor(t), subtitle: `${rowFor(t).subtitle} · ${money(t.actualCost)}` }))}
            empty="No actual costs recorded."
            onClick={(r) => navigate(`/repair-tickets/${r.id}`)}
          />
        </Panel>
      </Box>
      <Panel title="Recent customer registrations">
        <Stack spacing={1}>
          {recentCustomers.map((c) => (
            <Stack key={c.id} direction="row" justifyContent="space-between" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/customers/${c.id}`)}>
              <Box>
                <Typography fontWeight={700}>{c.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{c.customerNumber} · {c.customerType}</Typography>
              </Box>
              <Typography variant="body2">{formatDate(c.registrationDate)}</Typography>
            </Stack>
          ))}
        </Stack>
      </Panel>
      <Typography variant="caption" color="text.secondary">Desk officer actions show a success message. Try creating a ticket to see the dashboard update. {notify ? '' : ''}</Typography>
    </Stack>
  );
}

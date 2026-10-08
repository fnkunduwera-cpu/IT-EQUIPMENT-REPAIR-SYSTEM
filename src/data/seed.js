export const EQUIPMENT_TYPES = [
  'Desktop Computer', 'Laptop', 'Printer', 'Monitor', 'UPS', 'Router',
  'Switch', 'Projector', 'Tablet', 'Smartphone', 'Server', 'Other Electronics',
];

export const BRANDS = ['HP', 'Dell', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Canon', 'Epson', 'Brother', 'Samsung', 'LG', 'APC', 'TP-Link', 'Cisco', 'Huawei', 'BenQ', 'Tecno', 'Sony'];

export const SPECIALIZATIONS = [
  'Computer Hardware', 'Networking', 'Printer Repair', 'Software Support',
  'Electronics', 'Mobile Devices', 'Server Support',
];

export const STATUSES = ['Received', 'Diagnosis', 'Repairing', 'Ready', 'Collected'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const CUSTOMER_TYPES = ['Individual', 'Business', 'Organization', 'Institution'];
export const COLLECTION_STATUSES = ['Not Ready', 'Ready for Collection', 'Collected'];
export const TECH_STATUSES = ['Available', 'Busy', 'On Leave', 'Inactive'];
export const GENDERS = ['Female', 'Male'];
export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Damaged', 'Not powering on'];

const NEXT = { Received: 'Diagnosis', Diagnosis: 'Repairing', Repairing: 'Ready', Ready: 'Collected' };
export const nextStatus = (status) => NEXT[status] || null;

function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n) => String(n).padStart(4, '0');
const num = (prefix, n) => `${prefix}-2026-${pad(n)}`;

export function buildSeed() {
  const rand = mulberry32(20261003);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const irand = (min, max) => min + Math.floor(rand() * (max - min + 1));
  const dateBetween = (start, end) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return new Date(s + rand() * (e - s)).toISOString().slice(0, 10);
  };

  const first = ['Jean', 'Alice', 'Eric', 'Diane', 'Patrick', 'Aline', 'Samuel', 'Grace', 'Kevin', 'Marie', 'Olivier', 'Chantal', 'David', 'Immaculee', 'Fabrice', 'Sandrine', 'Emmanuel', 'Claudine', 'Joseph', 'Ange', 'Thierry', 'Nadia', 'Claude', 'Beata', 'Innocent', 'Vestine', 'Bosco', 'Josiane', 'Felix', 'Uwase', 'Pierre', 'Solange', 'Didier', 'Yvette', 'Honore', 'Clarisse', 'Modeste', 'Esperance', 'Alexis', 'Divine'];
  const last = ['Uwimana', 'Mukamana', 'Habimana', 'Niyonsenga', 'Bizimana', 'Uwase', 'Ndayisaba', 'Munyaneza', 'Iradukunda', 'Nsengimana', 'Mukeshimana', 'Hakizimana', 'Tuyishime', 'Nsabimana', 'Ingabire', 'Mugisha', 'Uwineza', 'Nkurunziza', 'Kayitesi', 'Manzi'];
  const areas = ['Karongi Town', 'Bwishyura', 'Rubengera', 'Gitesi', 'Ruganda', 'Mubuga', 'Murambi', 'Kiziba', 'Nyamishaba', 'Gisovu'];
  const orgs = ['Karongi Hospital', 'RP Karongi College', 'Vision Finance', 'Kivu Coffee Coop', 'District Office', 'Green Hills School', 'Lake Hotel', 'AgriTech Ltd', 'Kivu Health Post', 'Nyungwe Tours'];
  const brandsByType = {
    'Desktop Computer': ['HP', 'Dell', 'Lenovo', 'Acer'],
    Laptop: ['HP', 'Dell', 'Lenovo', 'Asus', 'Apple'],
    Printer: ['HP', 'Canon', 'Epson', 'Brother'],
    Monitor: ['Samsung', 'LG', 'Dell', 'AOC'],
    UPS: ['APC', 'Eaton', 'CyberPower'],
    Router: ['TP-Link', 'Cisco', 'Huawei', 'MikroTik'],
    Switch: ['Cisco', 'TP-Link', 'HP', 'Netgear'],
    Projector: ['Epson', 'BenQ', 'ViewSonic'],
    Tablet: ['Samsung', 'Apple', 'Lenovo'],
    Smartphone: ['Samsung', 'Apple', 'Tecno', 'Infinix'],
    Server: ['Dell', 'HP', 'Lenovo'],
    'Other Electronics': ['Sony', 'LG', 'Generic'],
  };
  const problems = [
    'Device does not power on after a power surge.',
    'Laptop screen flickers and eventually goes black.',
    'Printer produces blank pages and jams frequently.',
    'Desktop fails to detect the hard drive.',
    'Router restarts every few minutes.',
    'Smartphone battery drains within two hours.',
    'UPS beeps continuously and does not hold charge.',
    'Projector lamp is dim and shuts down mid-use.',
    'Server fan error and overheating alerts.',
    'Monitor has vertical lines across the display.',
    'Switch ports are dead on one side of the rack.',
    'Tablet touchscreen does not respond.',
  ];
  const findings = ['Faulty power supply', 'Damaged display panel', 'Failed hard disk', 'Corrupted firmware', 'Worn fuser unit', 'Bad capacitor', 'Broken charging port', 'Overheating heatsink', 'Failed network chip', 'Worn battery cells'];
  const causes = ['Power surge', 'Physical impact', 'Age and wear', 'Liquid exposure', 'Dust buildup', 'Manufacturing defect'];
  const solutions = ['Replace component', 'Clean and reseat', 'Reinstall firmware', 'Replace battery', 'Board-level repair', 'Replace power board'];
  const parts = ['Power adapter', 'LCD panel', 'SSD 512GB', 'Fuser kit', 'Battery', 'RAM 8GB', 'Charging port', 'None'];

  const technicians = Array.from({ length: 15 }, (_, i) => {
    const fn = first[i];
    const ln = last[(i * 3) % last.length];
    return {
      id: `tec-${i + 1}`,
      staffNumber: num('TEC', i + 1),
      fullName: `${fn} ${ln}`,
      phone: `+250 78${irand(100, 999)} ${irand(100, 999)}`,
      email: `${fn}.${ln}${i + 1}@karongi-repair.rw`.toLowerCase(),
      specialization: SPECIALIZATIONS[i % SPECIALIZATIONS.length],
      experience: irand(1, 14),
      status: i === 12 ? 'On Leave' : i === 13 ? 'Inactive' : 'Available',
    };
  });

  const customers = Array.from({ length: 50 }, (_, i) => {
    const fn = first[i % first.length];
    const ln = last[i % last.length];
    const customerType = CUSTOMER_TYPES[i % CUSTOMER_TYPES.length];
    return {
      id: `cus-${i + 1}`,
      customerNumber: num('CUS', i + 1),
      fullName: customerType === 'Individual' ? `${fn} ${ln}` : orgs[i % orgs.length],
      contactPerson: customerType === 'Individual' ? '' : `${fn} ${ln}`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      phone: `+250 7${irand(2, 9)}${irand(0, 9)} ${irand(100, 999)} ${irand(100, 999)}`,
      email: `${fn}.${ln}${i + 1}@mail.rw`.toLowerCase(),
      address: `${areas[i % areas.length]}, Karongi`,
      customerType,
      registrationDate: dateBetween('2026-01-06', '2026-09-20'),
      status: i % 17 === 0 ? 'Inactive' : 'Active',
    };
  });

  const usedSerials = new Set();
  const equipment = Array.from({ length: 70 }, (_, i) => {
    const equipmentType = EQUIPMENT_TYPES[i % EQUIPMENT_TYPES.length];
    const brand = pick(brandsByType[equipmentType]);
    let serialNumber = '';
    do {
      serialNumber = `${brand.slice(0, 3).toUpperCase()}${irand(100000, 999999)}${String.fromCharCode(65 + irand(0, 25))}`;
    } while (usedSerials.has(serialNumber));
    usedSerials.add(serialNumber);
    return {
      id: `eqp-${i + 1}`,
      equipmentNumber: num('EQP', i + 1),
      customerId: customers[i % customers.length].id,
      equipmentType,
      brand,
      model: `${brand} ${equipmentType.split(' ')[0]} ${irand(100, 9990)}`,
      serialNumber,
      color: pick(['Black', 'Silver', 'Grey', 'White', 'Blue']),
      accessories: pick(['Power adapter', 'Bag', 'Mouse', 'Cables', 'None', 'Power adapter, Mouse', 'Remote, Cables']),
      conditionOnArrival: pick(CONDITIONS),
      registrationDate: dateBetween('2026-01-10', '2026-09-28'),
      description: pick(problems),
    };
  });

  const statusPlan = [
    ...Array(12).fill('Received'),
    ...Array(12).fill('Diagnosis'),
    ...Array(14).fill('Repairing'),
    ...Array(12).fill('Ready'),
    ...Array(50).fill('Collected'),
  ];
  const activeTechs = technicians.filter((t) => t.status === 'Available');
  const tickets = [];
  const diagnoses = [];
  const history = [];
  const costs = [];
  const collections = [];

  statusPlan.forEach((status, i) => {
    const eq = equipment[i % equipment.length];
    const received = dateBetween('2026-02-01', '2026-09-25');
    const tech = status === 'Received' && i % 3 === 0 ? null : activeTechs[i % activeTechs.length];
    const estimatedCost = status === 'Received' ? 0 : irand(8, 180) * 1000;
    const swing = irand(-15, 35) * 1000;
    const actualCost = status === 'Ready' || status === 'Collected' ? Math.max(8000, estimatedCost + swing) : 0;
    const expected = new Date(received);
    expected.setDate(expected.getDate() + irand(2, 12));
    const expectedCompletionDate = expected.toISOString().slice(0, 10);
    const ticket = {
      id: `tkt-${i + 1}`,
      ticketNumber: num('RPR', i + 1),
      customerId: eq.customerId,
      equipmentId: eq.id,
      dateReceived: received,
      problemDescription: problems[i % problems.length],
      priority: i % 11 === 0 ? 'Urgent' : PRIORITIES[i % 3],
      technicianId: tech ? tech.id : '',
      status,
      estimatedCost,
      actualCost,
      expectedCompletionDate,
      collectionStatus: status === 'Collected' ? 'Collected' : status === 'Ready' ? 'Ready for Collection' : 'Not Ready',
      notes: i % 5 === 0 ? 'Customer requested a call before collection.' : '',
      collectionDate: status === 'Collected' ? expectedCompletionDate : '',
      collectedBy: status === 'Collected' ? 'Front Desk Officer' : '',
    };
    tickets.push(ticket);

    const flow = STATUSES.slice(0, STATUSES.indexOf(status) + 1);
    let cursor = received;
    flow.forEach((stage, s) => {
      if (s === 0) {
        history.push({
          id: `hst-${history.length + 1}`,
          ticketId: ticket.id,
          action: 'Ticket created',
          previousStatus: '',
          newStatus: 'Received',
          staffId: '',
          staffName: 'Front Desk Officer',
          date: cursor,
          time: '09:15:00',
          comment: 'Equipment received at the repair center.',
        });
        return;
      }
      const next = new Date(cursor);
      next.setDate(next.getDate() + irand(1, 2));
      cursor = next.toISOString().slice(0, 10);
      const actionMap = {
        Diagnosis: 'Moved to diagnosis',
        Repairing: 'Repair started',
        Ready: 'Marked ready for collection',
        Collected: 'Equipment collected',
      };
      history.push({
        id: `hst-${history.length + 1}`,
        ticketId: ticket.id,
        action: actionMap[stage],
        previousStatus: flow[s - 1],
        newStatus: stage,
        staffId: tech ? tech.id : '',
        staffName: stage === 'Collected' ? 'Front Desk Officer' : tech?.fullName || 'Front Desk Officer',
        date: cursor,
        time: `${String(8 + (s % 8)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
        comment: `${flow[s - 1]} → ${stage}`,
      });
    });

    if (tech) {
      history.push({
        id: `hst-${history.length + 1}`,
        ticketId: ticket.id,
        action: 'Technician assigned',
        previousStatus: ticket.status,
        newStatus: ticket.status,
        staffId: tech.id,
        staffName: 'Front Desk Officer',
        date: received,
        time: '10:05:00',
        comment: `Assigned to ${tech.fullName}`,
      });
    }

    if (status !== 'Received' && diagnoses.length < 80) {
      const diagnosis = {
        id: `dia-${diagnoses.length + 1}`,
        diagnosisNumber: num('DIA', diagnoses.length + 1),
        ticketId: ticket.id,
        technicianId: tech ? tech.id : activeTechs[0].id,
        diagnosisDate: received,
        problemIdentified: pick(findings),
        cause: pick(causes),
        recommendedSolution: pick(solutions),
        requiredParts: pick(parts),
        estimatedRepairTime: `${irand(1, 5)} day(s)`,
        estimatedCost: estimatedCost || irand(15, 90) * 1000,
        notes: 'Diagnosis recorded during workshop review.',
      };
      diagnoses.push(diagnosis);
      if (!ticket.estimatedCost) ticket.estimatedCost = diagnosis.estimatedCost;
    }

    if (ticket.estimatedCost > 0) {
      costs.push({
        id: `cost-${costs.length + 1}`,
        ticketId: ticket.id,
        type: 'estimated',
        amount: ticket.estimatedCost,
        date: received,
        staffName: tech?.fullName || 'Front Desk Officer',
      });
    }
    if (ticket.actualCost > 0) {
      costs.push({
        id: `cost-${costs.length + 1}`,
        ticketId: ticket.id,
        type: 'actual',
        amount: ticket.actualCost,
        date: ticket.expectedCompletionDate,
        staffName: tech?.fullName || 'Front Desk Officer',
      });
    }
    if (status === 'Collected') {
      collections.push({
        id: `col-${collections.length + 1}`,
        ticketId: ticket.id,
        date: ticket.collectionDate,
        time: '15:30:00',
        staffName: 'Front Desk Officer',
        notes: 'Customer collected the equipment after payment confirmation.',
      });
    }
  });

  return {
    customers,
    equipment,
    technicians,
    tickets,
    diagnoses,
    history,
    costs,
    collections,
    settings: {
      officerName: 'Front Desk Officer',
      centerName: 'RP Karongi IT Repair Center',
    },
  };
}

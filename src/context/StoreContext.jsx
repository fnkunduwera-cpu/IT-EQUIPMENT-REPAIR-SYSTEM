import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { buildSeed, nextStatus, STATUSES } from '../data/seed';
import { nextId, nextSerial, nowParts } from '../utils/format';

const KEYS = {
  customers: 'irms_customers',
  equipment: 'irms_equipment',
  tickets: 'irms_tickets',
  technicians: 'irms_technicians',
  diagnoses: 'irms_diagnoses',
  history: 'irms_history',
  costs: 'irms_costs',
  collections: 'irms_collections',
  settings: 'irms_settings',
};

const StoreContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(KEYS.customers);
    if (!raw) return buildSeed();
    const state = {};
    Object.entries(KEYS).forEach(([key, storageKey]) => {
      state[key] = JSON.parse(localStorage.getItem(storageKey) || 'null');
    });
    if (!state.customers || !state.tickets || !state.equipment) return buildSeed();
    return state;
  } catch {
    return buildSeed();
  }
}

function pushHistory(state, entry) {
  const stamp = nowParts();
  return [
    {
      id: nextId(state.history, 'hst'),
      date: stamp.date,
      time: stamp.time,
      staffId: entry.staffId || '',
      staffName: entry.staffName || state.settings.officerName,
      comment: entry.comment || '',
      ...entry,
    },
    ...state.history,
  ];
}

function reducer(state, action) {
  switch (action.type) {
    case 'REPLACE':
      return action.state;
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [action.customer, ...state.customers] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.customer.id ? action.customer : c)),
      };
    case 'DELETE_CUSTOMER':
      return { ...state, customers: state.customers.filter((c) => c.id !== action.id) };
    case 'ADD_EQUIPMENT':
      return { ...state, equipment: [action.equipment, ...state.equipment] };
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.map((e) => (e.id === action.equipment.id ? action.equipment : e)),
      };
    case 'DELETE_EQUIPMENT':
      return { ...state, equipment: state.equipment.filter((e) => e.id !== action.id) };
    case 'ADD_TECHNICIAN':
      return { ...state, technicians: [action.technician, ...state.technicians] };
    case 'UPDATE_TECHNICIAN':
      return {
        ...state,
        technicians: state.technicians.map((t) => (t.id === action.technician.id ? action.technician : t)),
      };
    case 'DELETE_TECHNICIAN':
      return { ...state, technicians: state.technicians.filter((t) => t.id !== action.id) };
    case 'ADD_TICKET':
      return {
        ...state,
        tickets: [action.ticket, ...state.tickets],
        history: pushHistory(state, {
          ticketId: action.ticket.id,
          action: 'Ticket created',
          previousStatus: '',
          newStatus: 'Received',
          comment: 'Equipment received and ticket opened.',
        }),
      };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === action.ticket.id ? action.ticket : t)),
        history: action.historyEntry ? pushHistory(state, action.historyEntry) : state.history,
      };
    case 'ASSIGN_TECHNICIAN': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId);
      const tech = state.technicians.find((t) => t.id === action.technicianId);
      const updated = {
        ...ticket,
        technicianId: action.technicianId,
        priority: action.priority || ticket.priority,
      };
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === ticket.id ? updated : t)),
        history: pushHistory(state, {
          ticketId: ticket.id,
          action: 'Technician assigned',
          previousStatus: ticket.status,
          newStatus: ticket.status,
          staffId: tech?.id || '',
          staffName: state.settings.officerName,
          comment: `Assigned to ${tech?.fullName || 'technician'}${action.priority ? ` · priority ${action.priority}` : ''}`,
        }),
      };
    }
    case 'CHANGE_STATUS': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId);
      const tech = state.technicians.find((t) => t.id === ticket.technicianId);
      const collectionStatus = action.status === 'Ready'
        ? 'Ready for Collection'
        : action.status === 'Collected'
          ? 'Collected'
          : ticket.collectionStatus === 'Collected'
            ? 'Collected'
            : 'Not Ready';
      const updated = {
        ...ticket,
        status: action.status,
        collectionStatus,
        collectionDate: action.status === 'Collected' ? nowParts().date : ticket.collectionDate,
        collectedBy: action.status === 'Collected' ? state.settings.officerName : ticket.collectedBy,
      };
      let collections = state.collections;
      if (action.status === 'Collected') {
        collections = [
          {
            id: nextId(state.collections, 'col'),
            ticketId: ticket.id,
            date: nowParts().date,
            time: nowParts().time,
            staffName: state.settings.officerName,
            notes: action.comment || 'Customer collected the equipment.',
          },
          ...state.collections,
        ];
      }
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === ticket.id ? updated : t)),
        collections,
        history: pushHistory(state, {
          ticketId: ticket.id,
          action: action.action || `Status changed to ${action.status}`,
          previousStatus: ticket.status,
          newStatus: action.status,
          staffId: tech?.id || '',
          staffName: action.staffName || tech?.fullName || state.settings.officerName,
          comment: action.comment || `${ticket.status} → ${action.status}`,
        }),
      };
    }
    case 'SAVE_DIAGNOSIS': {
      const existing = state.diagnoses.find((d) => d.ticketId === action.diagnosis.ticketId && d.id === action.diagnosis.id);
      const diagnoses = existing
        ? state.diagnoses.map((d) => (d.id === action.diagnosis.id ? action.diagnosis : d))
        : [action.diagnosis, ...state.diagnoses];
      const ticket = state.tickets.find((t) => t.id === action.diagnosis.ticketId);
      const tech = state.technicians.find((t) => t.id === action.diagnosis.technicianId);
      let updated = {
        ...ticket,
        estimatedCost: Number(action.diagnosis.estimatedCost) || ticket.estimatedCost,
        technicianId: ticket.technicianId || action.diagnosis.technicianId,
      };
      let history = state.history;
      if (action.advance && ticket.status === 'Received') {
        updated = { ...updated, status: 'Diagnosis', collectionStatus: 'Not Ready' };
        history = pushHistory({ ...state, history }, {
          ticketId: ticket.id,
          action: 'Moved to diagnosis',
          previousStatus: 'Received',
          newStatus: 'Diagnosis',
          staffId: tech?.id || '',
          staffName: tech?.fullName || state.settings.officerName,
          comment: action.diagnosis.problemIdentified,
        });
      }
      if (action.advance === 'repair' && (ticket.status === 'Diagnosis' || updated.status === 'Diagnosis')) {
        const prev = updated.status;
        updated = { ...updated, status: 'Repairing', collectionStatus: 'Not Ready' };
        history = pushHistory({ ...state, history }, {
          ticketId: ticket.id,
          action: 'Diagnosis completed — repair started',
          previousStatus: prev === 'Repairing' ? 'Diagnosis' : prev,
          newStatus: 'Repairing',
          staffId: tech?.id || '',
          staffName: tech?.fullName || state.settings.officerName,
          comment: action.diagnosis.recommendedSolution,
        });
      }
      const costs = [
        {
          id: nextId(state.costs, 'cost'),
          ticketId: ticket.id,
          type: 'estimated',
          amount: Number(action.diagnosis.estimatedCost) || 0,
          date: action.diagnosis.diagnosisDate,
          staffName: tech?.fullName || state.settings.officerName,
        },
        ...state.costs,
      ];
      history = pushHistory({ ...state, history }, {
        ticketId: ticket.id,
        action: existing ? 'Diagnosis updated' : 'Diagnosis recorded',
        previousStatus: ticket.status,
        newStatus: updated.status,
        staffId: tech?.id || '',
        staffName: tech?.fullName || state.settings.officerName,
        comment: action.diagnosis.problemIdentified,
      });
      return {
        ...state,
        diagnoses,
        tickets: state.tickets.map((t) => (t.id === ticket.id ? updated : t)),
        costs,
        history,
      };
    }
    case 'SET_COST': {
      const ticket = state.tickets.find((t) => t.id === action.ticketId);
      const tech = state.technicians.find((t) => t.id === ticket.technicianId);
      const updated = {
        ...ticket,
        estimatedCost: action.kind === 'estimated' ? action.amount : ticket.estimatedCost,
        actualCost: action.kind === 'actual' ? action.amount : ticket.actualCost,
      };
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === ticket.id ? updated : t)),
        costs: [
          {
            id: nextId(state.costs, 'cost'),
            ticketId: ticket.id,
            type: action.kind,
            amount: action.amount,
            date: nowParts().date,
            staffName: tech?.fullName || state.settings.officerName,
          },
          ...state.costs,
        ],
        history: pushHistory(state, {
          ticketId: ticket.id,
          action: action.kind === 'actual' ? 'Actual cost recorded' : 'Estimated cost recorded',
          previousStatus: ticket.status,
          newStatus: ticket.status,
          staffId: tech?.id || '',
          staffName: tech?.fullName || state.settings.officerName,
          comment: `${action.kind} cost set to RWF ${action.amount}`,
        }),
      };
    }
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    Object.entries(KEYS).forEach(([key, storageKey]) => {
      localStorage.setItem(storageKey, JSON.stringify(state[key]));
    });
  }, [state]);

  const api = useMemo(() => {
    const customerById = (id) => state.customers.find((c) => c.id === id);
    const equipmentById = (id) => state.equipment.find((e) => e.id === id);
    const technicianById = (id) => state.technicians.find((t) => t.id === id);
    const ticketById = (id) => state.tickets.find((t) => t.id === id);
    const diagnosisFor = (ticketId) => state.diagnoses.find((d) => d.ticketId === ticketId);

    const activeTickets = state.tickets.filter((t) => t.status !== 'Collected');
    const equipmentCount = (customerId) => state.equipment.filter((e) => e.customerId === customerId).length;
    const ticketCount = (customerId) => state.tickets.filter((t) => t.customerId === customerId).length;
    const techActive = (technicianId) => state.tickets.filter((t) => t.technicianId === technicianId && t.status !== 'Collected').length;
    const techDone = (technicianId) => state.tickets.filter((t) => t.technicianId === technicianId && t.status === 'Collected').length;

    const currentEquipmentStatus = (equipmentId) => {
      const open = state.tickets.find((t) => t.equipmentId === equipmentId && t.status !== 'Collected');
      if (open) return open.status;
      const any = state.tickets.find((t) => t.equipmentId === equipmentId);
      return any ? any.status : 'No ticket';
    };

    const stats = {
      customers: state.customers.length,
      equipment: state.equipment.length,
      tickets: state.tickets.length,
      received: state.tickets.filter((t) => t.status === 'Received').length,
      diagnosis: state.tickets.filter((t) => t.status === 'Diagnosis').length,
      repairing: state.tickets.filter((t) => t.status === 'Repairing').length,
      ready: state.tickets.filter((t) => t.status === 'Ready').length,
      collected: state.tickets.filter((t) => t.status === 'Collected').length,
      unassigned: state.tickets.filter((t) => !t.technicianId && t.status !== 'Collected').length,
      estimated: state.tickets.reduce((s, t) => s + Number(t.estimatedCost || 0), 0),
      actual: state.tickets.reduce((s, t) => s + Number(t.actualCost || 0), 0),
      outstandingCount: state.tickets.filter((t) => t.collectionStatus === 'Ready for Collection').length,
      outstandingAmount: state.tickets
        .filter((t) => t.collectionStatus === 'Ready for Collection')
        .reduce((s, t) => s + Number(t.actualCost || t.estimatedCost || 0), 0),
    };

    const validateTransition = (ticket, target) => {
      const expected = nextStatus(ticket.status);
      if (target !== expected) return `Invalid transition. ${ticket.status} can only move to ${expected || 'nowhere'}.`;
      if (target === 'Diagnosis' && !ticket.technicianId) return 'Assign a technician before moving to Diagnosis.';
      if (target === 'Repairing' && !diagnosisFor(ticket.id)) return 'Record a diagnosis before starting the repair.';
      if (target === 'Ready' && Number(ticket.actualCost) <= 0) return 'Enter a positive actual cost before marking Ready.';
      if (target === 'Collected' && ticket.status !== 'Ready') return 'Equipment can be collected only when the repair status is Ready.';
      return '';
    };

    return {
      ...state,
      stats,
      customerById,
      equipmentById,
      technicianById,
      ticketById,
      diagnosisFor,
      equipmentCount,
      ticketCount,
      techActive,
      techDone,
      currentEquipmentStatus,
      activeTickets,
      addCustomer: (payload) => {
        if (!payload.fullName || !payload.phone) return 'Full name and phone are required.';
        const customer = {
          id: nextId(state.customers, 'cus'),
          customerNumber: nextSerial(state.customers, 'customerNumber', 'CUS'),
          contactPerson: '',
          gender: 'Female',
          email: '',
          address: '',
          customerType: 'Individual',
          registrationDate: nowParts().date,
          status: 'Active',
          ...payload,
        };
        dispatch({ type: 'ADD_CUSTOMER', customer });
        return customer;
      },
      updateCustomer: (customer) => {
        if (!customer.fullName || !customer.phone) return 'Full name and phone are required.';
        dispatch({ type: 'UPDATE_CUSTOMER', customer });
        return customer;
      },
      deleteCustomer: (id) => {
        if (state.equipment.some((e) => e.customerId === id) || state.tickets.some((t) => t.customerId === id)) {
          return 'Cannot delete a customer who still has equipment or repair tickets.';
        }
        dispatch({ type: 'DELETE_CUSTOMER', id });
        return true;
      },
      addEquipment: (payload) => {
        if (!payload.customerId || !payload.equipmentType || !payload.brand || !payload.model || !payload.serialNumber) {
          return 'Customer, type, brand, model, and serial number are required.';
        }
        const serial = payload.serialNumber.trim().toUpperCase();
        if (state.equipment.some((e) => e.serialNumber.toUpperCase() === serial)) return 'Serial number already exists.';
        const equipment = {
          id: nextId(state.equipment, 'eqp'),
          equipmentNumber: nextSerial(state.equipment, 'equipmentNumber', 'EQP'),
          color: '',
          accessories: '',
          conditionOnArrival: 'Good',
          registrationDate: nowParts().date,
          description: '',
          ...payload,
          serialNumber: serial,
        };
        dispatch({ type: 'ADD_EQUIPMENT', equipment });
        return equipment;
      },
      updateEquipment: (equipment) => {
        const serial = equipment.serialNumber.trim().toUpperCase();
        if (state.equipment.some((e) => e.id !== equipment.id && e.serialNumber.toUpperCase() === serial)) {
          return 'Serial number already exists.';
        }
        dispatch({ type: 'UPDATE_EQUIPMENT', equipment: { ...equipment, serialNumber: serial } });
        return { ...equipment, serialNumber: serial };
      },
      deleteEquipment: (id) => {
        if (state.tickets.some((t) => t.equipmentId === id)) return 'Cannot delete equipment that has repair tickets.';
        dispatch({ type: 'DELETE_EQUIPMENT', id });
        return true;
      },
      addTechnician: (payload) => {
        if (!payload.fullName || !payload.phone || !payload.specialization) return 'Name, phone, and specialization are required.';
        const technician = {
          id: nextId(state.technicians, 'tec'),
          staffNumber: nextSerial(state.technicians, 'staffNumber', 'TEC'),
          email: '',
          experience: 1,
          status: 'Available',
          ...payload,
        };
        dispatch({ type: 'ADD_TECHNICIAN', technician });
        return technician;
      },
      updateTechnician: (technician) => {
        if (!technician.fullName || !technician.phone) return 'Name and phone are required.';
        dispatch({ type: 'UPDATE_TECHNICIAN', technician });
        return technician;
      },
      deleteTechnician: (id) => {
        if (state.tickets.some((t) => t.technicianId === id && t.status !== 'Collected')) {
          return 'Cannot delete a technician with active repair tickets.';
        }
        dispatch({ type: 'DELETE_TECHNICIAN', id });
        return true;
      },
      createTicket: (payload) => {
        if (!payload.customerId) return 'Select a customer.';
        if (!payload.equipmentId) return 'Select equipment.';
        if (!payload.problemDescription || payload.problemDescription.trim().length < 8) {
          return 'Problem description must be at least 8 characters.';
        }
        const open = state.tickets.find((t) => t.equipmentId === payload.equipmentId && t.status !== 'Collected');
        if (open) return `This equipment already has an open ticket (${open.ticketNumber}).`;
        const ticket = {
          id: nextId(state.tickets, 'tkt'),
          ticketNumber: nextSerial(state.tickets, 'ticketNumber', 'RPR'),
          dateReceived: nowParts().date,
          priority: 'Medium',
          technicianId: '',
          status: 'Received',
          estimatedCost: 0,
          actualCost: 0,
          expectedCompletionDate: '',
          collectionStatus: 'Not Ready',
          notes: '',
          collectionDate: '',
          collectedBy: '',
          ...payload,
        };
        dispatch({ type: 'ADD_TICKET', ticket });
        return ticket;
      },
      updateTicket: (ticket, comment) => {
        if (!ticket.problemDescription) return 'Problem description is required.';
        dispatch({
          type: 'UPDATE_TICKET',
          ticket,
          historyEntry: comment
            ? {
                ticketId: ticket.id,
                action: 'Ticket updated',
                previousStatus: ticket.status,
                newStatus: ticket.status,
                comment,
              }
            : null,
        });
        return ticket;
      },
      assignTechnician: ({ ticketId, technicianId, priority }) => {
        const ticket = ticketById(ticketId);
        const tech = technicianById(technicianId);
        if (!ticket) return 'Ticket not found.';
        if (!tech) return 'Select a valid technician.';
        if (tech.status === 'Inactive' || tech.status === 'On Leave') return `${tech.fullName} is ${tech.status.toLowerCase()} and cannot be assigned.`;
        dispatch({ type: 'ASSIGN_TECHNICIAN', ticketId, technicianId, priority });
        return true;
      },
      changeStatus: (ticketId, comment) => {
        const ticket = ticketById(ticketId);
        if (!ticket) return 'Ticket not found.';
        const target = nextStatus(ticket.status);
        if (!target || target === 'Collected') return 'Use collection to close a ready ticket.';
        const error = validateTransition(ticket, target);
        if (error) return error;
        dispatch({
          type: 'CHANGE_STATUS',
          ticketId,
          status: target,
          comment,
          action: target === 'Diagnosis' ? 'Moved to diagnosis' : target === 'Repairing' ? 'Repair started' : 'Marked ready for collection',
        });
        return true;
      },
      collectEquipment: (ticketId, comment) => {
        const ticket = ticketById(ticketId);
        if (!ticket) return 'Ticket not found.';
        if (ticket.status !== 'Ready' || ticket.collectionStatus !== 'Ready for Collection') {
          return 'Collection is allowed only when the repair status is Ready.';
        }
        dispatch({
          type: 'CHANGE_STATUS',
          ticketId,
          status: 'Collected',
          comment: comment || 'Customer collected the equipment.',
          action: 'Equipment collected',
          staffName: state.settings.officerName,
        });
        return true;
      },
      saveDiagnosis: (payload, advance) => {
        if (!payload.ticketId) return 'Diagnosis must be linked to a repair ticket.';
        if (!payload.technicianId) return 'Select the diagnosing technician.';
        if (!payload.problemIdentified || !payload.recommendedSolution) return 'Problem and recommended solution are required.';
        if (Number(payload.estimatedCost) <= 0) return 'Estimated cost must be a positive amount.';
        const existing = state.diagnoses.find((d) => d.ticketId === payload.ticketId);
        const diagnosis = {
          id: existing?.id || nextId(state.diagnoses, 'dia'),
          diagnosisNumber: existing?.diagnosisNumber || nextSerial(state.diagnoses, 'diagnosisNumber', 'DIA'),
          diagnosisDate: nowParts().date,
          cause: '',
          requiredParts: '',
          estimatedRepairTime: '',
          notes: '',
          ...existing,
          ...payload,
          estimatedCost: Number(payload.estimatedCost),
        };
        dispatch({ type: 'SAVE_DIAGNOSIS', diagnosis, advance });
        return diagnosis;
      },
      setCost: (ticketId, kind, amount) => {
        const value = Number(amount);
        if (!value || value <= 0) return 'Enter a positive cost.';
        dispatch({ type: 'SET_COST', ticketId, kind, amount: value });
        return true;
      },
      updateSettings: (settings) => dispatch({ type: 'SET_SETTINGS', settings }),
      resetData: () => {
        const fresh = buildSeed();
        dispatch({ type: 'REPLACE', state: fresh });
      },
      statuses: STATUSES,
    };
  }, [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

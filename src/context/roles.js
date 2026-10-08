export const ACCESS = {
  Manager: ['/', '/queue', '/repair-tickets', '/diagnosis', '/payments', '/customers', '/equipment', '/technicians', '/history', '/reports', '/staff', '/password'],
  'Desk Officer': ['/', '/queue', '/repair-tickets', '/diagnosis', '/payments', '/customers', '/equipment', '/technicians', '/history', '/password'],
  Technician: ['/', '/queue', '/repair-tickets', '/diagnosis', '/equipment', '/history', '/password'],
};

export function canOpen(role, path) {
  const allowed = ACCESS[role] || ACCESS.Technician;
  if (path === '/staff') return role === 'Manager';
  if (path === '/repair-tickets/create') return role === 'Manager' || role === 'Desk Officer';
  return allowed.some((item) => path === item || (item !== '/' && path.startsWith(`${item}/`)));
}

export function canCreateTicket(role) {
  return role === 'Manager' || role === 'Desk Officer';
}

export function canResetData(role) {
  return role === 'Manager';
}

export function canManageAccounts(role) {
  return role === 'Manager';
}
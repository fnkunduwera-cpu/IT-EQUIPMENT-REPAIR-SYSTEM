const SESSION_KEY = 'irms_session';
const USERS_KEY = 'irms_users';
const REMOVED_KEY = 'irms_removed_users';
const OVERRIDES_KEY = 'irms_password_overrides';

export const DEMO_USERS = [
  {
    id: 'usr-1',
    name: 'nkunduwera felix',
    email: 'fnkunduwera@gmail.com',
    password: 'Admin@2026',
    role: 'Manager',
  },
  {
    id: 'usr-2',
    name: 'Eric Habimana',
    email: 'eric@gmail.com',
    password: 'Officer@2026',
    role: 'Desk Officer',
  },
  {
    id: 'usr-3',
    name: 'Jean Uwimana',
    email: 'tech@karongi-repair.rw',
    password: 'Tech@2026',
    role: 'Technician',
  },
];

export function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSession(user) {
  const session = { id: user.id, name: user.name, email: user.email, role: user.role, loggedInAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function readUsers() {
  try {
    const extra = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const removed = new Set(JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]').map((email) => email.toLowerCase()));
    const overrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
    const byEmail = new Map();
    [...DEMO_USERS, ...extra].forEach((user) => {
      const email = user.email.toLowerCase();
      if (!removed.has(email)) byEmail.set(email, { ...user, password: overrides[email] || user.password });
    });
    return [...byEmail.values()];
  } catch {
    return [...DEMO_USERS];
  }
}

export function removeUser(email, currentEmail) {
  const target = email.trim().toLowerCase();
  if (target === currentEmail?.toLowerCase()) return 'You cannot delete the account you are using.';
  const users = readUsers();
  if (!users.some((user) => user.email.toLowerCase() === target)) return 'Account not found.';
  const extra = users.filter((user) => !DEMO_USERS.some((seed) => seed.email === user.email) && user.email.toLowerCase() !== target);
  localStorage.setItem(USERS_KEY, JSON.stringify(extra));
  const removed = new Set(JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]'));
  if (DEMO_USERS.some((seed) => seed.email === target)) removed.add(target);
  localStorage.setItem(REMOVED_KEY, JSON.stringify([...removed]));
  return true;
}

export function registerUser({ name, email, password, role }) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName || !cleanEmail || !password) return 'Name, email, and password are required.';
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) return 'Enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  const users = readUsers();
  if (users.some((user) => user.email.toLowerCase() === cleanEmail)) return 'An account with this email already exists.';
  const account = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password,
    role: role || 'Desk Officer',
  };
  const extra = users.filter((user) => !DEMO_USERS.some((seed) => seed.email === user.email));
  localStorage.setItem(USERS_KEY, JSON.stringify([...extra, account]));
  return account;
}

export function changePassword(email, password) {
  const target = email.trim().toLowerCase();
  if (!password || password.length < 6) return 'Password must be at least 6 characters.';
  const users = readUsers();
  const account = users.find((user) => user.email.toLowerCase() === target);
  if (!account) return 'Account not found.';
  const overrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
  overrides[target] = password;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  const extra = users
    .filter((user) => !DEMO_USERS.some((seed) => seed.email === user.email))
    .map((user) => (user.email.toLowerCase() === target ? { ...user, password } : user));
  localStorage.setItem(USERS_KEY, JSON.stringify(extra));
  return true;
}

export function changeOwnPassword(email, currentPassword, nextPassword) {
  const users = readUsers();
  const account = users.find((user) => user.email.toLowerCase() === String(email || '').toLowerCase());
  if (!account || account.password !== currentPassword) return 'Current password is incorrect.';
  return changePassword(email, nextPassword);
}

export function authenticate(email, password) {
  const normalized = email.trim().toLowerCase();
  const user = readUsers().find((item) => item.email.toLowerCase() === normalized);
  if (!user || user.password !== password) return 'Invalid email or password.';
  return writeSession(user);
}
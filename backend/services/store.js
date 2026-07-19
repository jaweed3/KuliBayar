let projects = [
  { id: 1, kontraktor: '0xac09...f2ff80', kuli: '0x59c6...8690d', name: 'Pondasi Gudang Logistik', location: 'Cikarang, Bekasi', dailyRate: '0.01', durationDays: 10, daysCompleted: 3, totalAmount: '0.100', totalReleased: '0.030', status: 'Active', kontraktorName: 'Budi Santoso', kuliName: 'Aldi P.' },
  { id: 2, kontraktor: '0xac09...f2ff80', kuli: '0x5678...abcd', name: 'Renovasi Ruko Blok A', location: 'Tebet, Jakarta', dailyRate: '0.015', durationDays: 5, daysCompleted: 0, totalAmount: '0.000', totalReleased: '0.000', status: 'Created', kontraktorName: 'Ahmad Wijaya', kuliName: 'Siti R.' },
  { id: 3, kontraktor: '0xac09...f2ff80', kuli: '0x59c6...8690d', name: 'Pemasangan Keramik Lt 2', location: 'Bintaro, Tangsel', dailyRate: '0.008', durationDays: 12, daysCompleted: 8, totalAmount: '0.060', totalReleased: '0.036', status: 'Disputed', kontraktorName: 'Dewi Lestari', kuliName: 'Rudi H.' },
];

let nextProjectId = 4;

let payments = [
  { id: 1, projectId: 1, projectName: 'Pondasi Gudang Logistik', day: 3, amount: '0.010', timestamp: '15 Jan 2026, 16:30 WIB', status: 'success', txHash: '0x7f3a...8a21' },
  { id: 2, projectId: 1, projectName: 'Pondasi Gudang Logistik', day: 2, amount: '0.010', timestamp: '14 Jan 2026, 15:45 WIB', status: 'success', txHash: '0x8b2c...3d45' },
  { id: 3, projectId: 1, projectName: 'Pondasi Gudang Logistik', day: 1, amount: '0.010', timestamp: '13 Jan 2026, 14:20 WIB', status: 'success', txHash: '0x9d4e...5f67' },
  { id: 4, projectId: 2, projectName: 'Renovasi Ruko Blok A', day: 1, amount: '0.015', timestamp: '12 Jan 2026, 17:00 WIB', status: 'success', txHash: '0xa1b2...c3d4' },
  { id: 5, projectId: 1, projectName: 'Pondasi Gudang Logistik', day: 4, amount: '0.010', timestamp: '16 Jan 2026, 15:30 WIB', status: 'pending', txHash: 'Menunggu verifikasi...' },
];
let nextPaymentId = 6;

let disputes = [
  { id: 'DISP-0012', projectId: 3, reason: 'Kualitas Buruk', raisedBy: 'kontraktor', date: '02 Sep 2026', result: 'Favor Kuli (50%)', status: 'completed' },
  { id: 'DISP-0005', projectId: 3, reason: 'Foto Tidak Sesuai', raisedBy: 'kuli', date: '15 Agu 2026', result: 'Kompromi', status: 'cancelled' },
];

export function getProjectsByRole(role) {
  if (role === 'kontraktor') return projects;
  return projects.filter(p => !['Created'].includes(p.status));
}

export function getKuliProjects(address) {
  return projects.filter(p => p.kuli === address || p.kuliName?.toLowerCase().includes(address?.toLowerCase() || ''));
}

export function getMyWork(address) {
  return projects.filter(p => p.kuli === address || p.kuliName?.toLowerCase().includes(address?.toLowerCase() || '')).map(p => ({
    id: p.id, name: p.name, location: p.location,
    kontraktor: p.kontraktorName || p.kontraktor,
    kontraktorAddress: p.kontraktor,
    status: p.status === 'Active' ? 'active' : p.status === 'Created' ? 'pending' : 'active',
    statusLabel: p.status === 'Active' ? 'Aktif' : p.status === 'Created' ? 'Menunggu' : p.status,
    daysCompleted: p.daysCompleted, durationDays: p.durationDays,
    dailyRate: p.dailyRate, totalEarned: p.totalReleased,
    lastProof: p.daysCompleted > 0 ? `${p.daysCompleted} hari dikonfirmasi` : 'Belum ada',
  }));
}

export function getPayments(address) {
  return payments;
}

export function getDisputeHistory(address) {
  return disputes;
}

export function addPayment(projectId, projectName, day, amount, status) {
  const p = { id: nextPaymentId++, projectId, projectName, day, amount, timestamp: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB', status, txHash: status === 'success' ? '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6) : 'Menunggu verifikasi...' };
  payments.unshift(p);
  return p;
}

export function addDispute(projectId, reason, raisedBy) {
  const d = { id: 'DISP-' + String(Date.now()).slice(-4), projectId, reason, raisedBy, date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }), result: '', status: 'reviewing' };
  disputes.unshift(d);
  return d;
}

export function getProject(id) {
  return projects.find(p => p.id === Number(id));
}

export function addProject(data) {
  const p = { id: nextProjectId++, ...data, daysCompleted: 0, totalReleased: '0', status: 'Created' };
  projects.unshift(p);
  return p;
}

export function updateProject(id, updates) {
  const idx = projects.findIndex(p => p.id === Number(id));
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...updates };
  return projects[idx];
}

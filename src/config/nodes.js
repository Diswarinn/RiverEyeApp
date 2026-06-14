/**
 * Sumber tunggal transformasi data node untuk semua layar.
 * Mengubah data backend (locations + logs) menjadi bentuk node yang dipakai UI,
 * dan menghitung status risiko memakai ambang per-node (dikelola di web admin).
 */

const PALETTE = {
  safe: '#10B981', // Aman
  warning: '#F59E0B', // Waspada
  danger: '#EF4444', // Siaga / Bahaya
};

// risk: label peta/dashboard (AMAN/WASPADA/BAHAYA), text: label riwayat (Aman/Waspada/Siaga)
export const riskFromLevel = (levelCm, loc = {}) => {
  const med = Number(loc.risk_medium_cm ?? 150);
  const high = Number(loc.risk_high_cm ?? 200);
  const cm = Number(levelCm);
  if (cm >= high) return { risk: 'BAHAYA', text: 'Siaga', color: PALETTE.danger };
  if (cm >= med) return { risk: 'WASPADA', text: 'Waspada', color: PALETTE.warning };
  return { risk: 'AMAN', text: 'Aman', color: PALETTE.safe };
};

// Ketinggian air terakhir per location_id
export const latestLogByLocation = (logs) => {
  const latest = {};
  for (const log of logs) {
    const prev = latest[log.location_id];
    if (!prev || new Date(log.timestamp) > new Date(prev.timestamp)) latest[log.location_id] = log;
  }
  return latest;
};

export const buildNodes = (locations, logs) => {
  const latest = latestLogByLocation(logs);
  return locations.map((loc) => {
    const level = latest[loc.id] ? Number(latest[loc.id].water_level_cm) : 0;
    const r = riskFromLevel(level, loc);
    return {
      id: String(loc.id),
      name: loc.name,
      coordinates: { latitude: Number(loc.latitude), longitude: Number(loc.longitude) },
      hardware: { has_sensor: loc.has_sensor !== false, has_camera: loc.has_camera === true },
      cctvUrl: loc.cctv_url || null,
      status: { level_cm: level, risk: r.risk, color: r.color },
    };
  });
};

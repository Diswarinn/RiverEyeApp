/**
 * Konfigurasi API terpusat untuk RiverEyeApp
 * Semua endpoint dan base URL didefinisikan di sini
 */

export const BASE_URL = 'http://100.71.62.7:3000';

export const ENDPOINTS = {
  // Lokasi monitoring sungai
  LOCATIONS: '/api/locations',

  // Log sensor ketinggian air
  LOGS: '/api/logs',

  // Prediksi banjir
  PREDICTIONS: '/api/predictions',
};

// Timeout default (ms)
export const API_TIMEOUT = 10000;

// Risk label mapping ke Bahasa Indonesia
export const RISK_LABELS = {
  low: { text: 'Aman', color: '#27AE60' },
  medium: { text: 'Waspada', color: '#F39C12' },
  high: { text: 'Siaga', color: '#E74C3C' },
};

/**
 * Menentukan level risiko berdasarkan ketinggian air (cm)
 * Karena backend tidak menyimpan risk_label, kita hitung di client
 * @param {number} levelCm - Ketinggian air dalam cm
 * @returns {{ text: string, color: string }}
 */
export const getRiskFromLevel = (levelCm) => {
  if (levelCm >= 200) return RISK_LABELS.high;
  if (levelCm >= 150) return RISK_LABELS.medium;
  return RISK_LABELS.low;
};


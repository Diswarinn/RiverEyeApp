import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // <-- IMPORT MAPS DI SINI
import { getLocations, getLogs, getPredictions } from '../config/apiClient';
import { RISK_LABELS, getRiskFromLevel } from '../config/api';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [latestLog, setLatestLog] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [locations, setLocations] = useState([]);

  // Koordinat default fallback (Area Jakarta - Manggarai)
  const defaultRegion = {
    latitude: -6.2088,
    longitude: 106.8456,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil semua data secara paralel
      const [locationsData, logsData, predictionsData] = await Promise.all([
        getLocations(),
        getLogs(),
        getPredictions(),
      ]);

      // Simpan lokasi
      setLocations(locationsData || []);

      // Ambil log terbaru (data terakhir berdasarkan timestamp)
      if (logsData && logsData.length > 0) {
        const sorted = [...logsData].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );
        setLatestLog(sorted[0]);
      }

      // Ambil prediksi terbaru (berdasarkan timestamp pembuatan)
      if (predictionsData && predictionsData.length > 0) {
        const sorted = [...predictionsData].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );
        setLatestPrediction(sorted[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Tentukan status dan warna berdasarkan prediksi atau level air
  const getStatusInfo = () => {
    // Prioritaskan data prediksi jika ada
    if (latestPrediction) {
      return getRiskFromLevel(latestPrediction.predicted_level_cm);
    }
    // Fallback berdasarkan water level aktual
    if (latestLog) {
      return getRiskFromLevel(latestLog.water_level_cm);
    }
    return RISK_LABELS.low;
  };

  const statusInfo = getStatusInfo();
  const waterLevelText = latestLog
    ? `${(latestLog.water_level_cm / 100).toFixed(1)} Meter`
    : '-- Meter';

  // Hitung region peta dari lokasi pertama atau gunakan default
  const mapRegion =
    locations.length > 0
      ? {
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : defaultRegion;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Memuat data dari server...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498DB']} />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RiverEye 🌊</Text>
          <Text style={styles.subHeader}>Pemantauan Debit Air Real-time</Text>
        </View>

        {/* Hero Section: Status Ketinggian Air */}
        <View style={[styles.card, { backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color, borderWidth: 1 }]}>
          <Text style={styles.cardTitle}>Status Saat Ini</Text>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          <Text style={styles.waterLevel}>{waterLevelText}</Text>
          {latestLog && (
            <Text style={styles.timestampText}>
              Terakhir update: {new Date(latestLog.timestamp).toLocaleString('id-ID')}
            </Text>
          )}
        </View>

        {/* Prediksi Banjir */}
        {latestPrediction && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prediksi Banjir 🔮</Text>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Level Prediksi:</Text>
              <Text style={styles.predictionValue}>
                {(latestPrediction.predicted_level_cm / 100).toFixed(1)} m
              </Text>
            </View>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Risiko:</Text>
              <Text style={[styles.predictionValue, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Prediksi Untuk:</Text>
              <Text style={styles.predictionValue}>
                {new Date(latestPrediction.prediction_for_time).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        )}

        {/* Quick View: Live CCTV Placeholder (Masih abu-abu) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live CCTV (Area Papan Duga)</Text>
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>[ Video Player RTSP Akan Tampil Di Sini ]</Text>
          </View>
        </View>

        {/* Interaktif: Peta Lokasi (SUDAH DIGANTI MAPS) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lokasi Sensor & Kamera</Text>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={mapRegion}
              scrollEnabled={false} // Dimatikan agar tidak bentrok dengan ScrollView halaman
              zoomEnabled={false}   // Dimatikan agar pengguna harus buka halaman Peta utuh untuk interaksi
            >
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                  title={loc.name}
                />
              ))}
            </MapView>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: 16 },
  header: { marginBottom: 20, marginTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  subHeader: { fontSize: 14, color: '#7F8C8D' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 }, 
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#34495E', marginBottom: 8 },
  statusText: { fontSize: 24, fontWeight: 'bold' },
  waterLevel: { fontSize: 48, fontWeight: 'bold', color: '#2C3E50', marginTop: 8 },
  timestampText: { fontSize: 12, color: '#95A5A6', marginTop: 8 },
  
  predictionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  predictionLabel: { fontSize: 14, color: '#7F8C8D' },
  predictionValue: { fontSize: 14, fontWeight: 'bold', color: '#2C3E50' },

  placeholderBox: { height: 200, backgroundColor: '#BDC3C7', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#FFFFFF', fontWeight: '500' },
  
  // Style khusus untuk wadah peta di Dashboard
  mapContainer: { 
    height: 200, // Tinggi yang sama dengan placeholder sebelumnya
    borderRadius: 8, 
    overflow: 'hidden' // Agar ujung peta ikut membulat (rounded corners)
  },
  map: { 
    flex: 1 
  },

  // Loading & Error states
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7F8C8D', fontSize: 14 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, color: '#E74C3C', textAlign: 'center', marginHorizontal: 32, marginBottom: 20 },
  retryButton: { backgroundColor: '#3498DB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});

export default DashboardScreen;
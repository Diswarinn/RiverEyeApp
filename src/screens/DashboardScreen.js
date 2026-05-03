import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getLocations, getLogs, getPredictions } from '../config/apiClient';
import { RISK_LABELS, getRiskFromLevel } from '../config/api';

// Palet warna premium (Ultra-Clean Slate & Sky UI)
const COLORS = {
  background: '#F8FAFC', 
  cardBg: '#FFFFFF',
  textMain: '#0F172A',   
  textMuted: '#64748B',  
  border: '#E2E8F0', // Slate 200 untuk border yang sangat halus dan tipis     
  primary: '#0EA5E9',    
};

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [latestLog, setLatestLog] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [locations, setLocations] = useState([]);

  // Koordinat default Jakarta - Manggarai
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
      const [locationsData, logsData, predictionsData] = await Promise.all([
        getLocations(),
        getLogs(),
        getPredictions(),
      ]);

      setLocations(locationsData || []);

      if (logsData && logsData.length > 0) {
        const sorted = [...logsData].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );
        setLatestLog(sorted[0]);
      }

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const getStatusInfo = () => {
    if (latestPrediction) return getRiskFromLevel(latestPrediction.predicted_level_cm);
    if (latestLog) return getRiskFromLevel(latestLog.water_level_cm);
    return RISK_LABELS.low;
  };

  const statusInfo = getStatusInfo();
  const waterLevelText = latestLog
    ? `${(latestLog.water_level_cm / 100).toFixed(1)}`
    : '--';

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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Menyinkronkan data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        
        {/* Header Seksi */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RiverEye</Text>
          <Text style={styles.subHeader}>Pemantauan Debit Air Real-time</Text>
        </View>

        {/* Hero Card: Status Air (Murni menggunakan style card standar, PASTI bersih) */}
        <View style={styles.card}>
          <View style={styles.heroHeader}>
            <Text style={styles.cardLabel}>STATUS SAAT INI</Text>
            <View style={[styles.badge, { backgroundColor: statusInfo.color + '1A' }]}>
              <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
              <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
          </View>

          <View style={styles.waterLevelContainer}>
            <Text style={styles.waterLevelNumber}>{waterLevelText}</Text>
            <Text style={styles.waterLevelUnit}>Meter</Text>
          </View>

          {latestLog && (
            <View style={styles.timestampBox}>
              <Text style={styles.timestampText}>
                Update: {new Date(latestLog.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute:'2-digit', day:'numeric', month:'short' })}
              </Text>
            </View>
          )}
        </View>

        {/* Card: Prediksi AI */}
        {latestPrediction && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prediksi AI</Text>
            <View style={styles.predictionRow}>
              <Text style={styles.predictionLabel}>Estimasi Ketinggian</Text>
              <Text style={styles.predictionValue}>{(latestPrediction.predicted_level_cm / 100).toFixed(1)} m</Text>
            </View>
            <View style={[styles.predictionRow, styles.predictionRowLast]}>
              <Text style={styles.predictionLabel}>Risiko Mendatang</Text>
              <Text style={[styles.predictionValue, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
          </View>
        )}

        {/* Card: CCTV (Klik ke Tab Kamera) */}
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Kamera')}
        >
          <View style={styles.cardHeaderWithLink}>
            <Text style={styles.cardTitle}>Live CCTV Area</Text>
            <Text style={styles.linkText}>Lihat Detail →</Text>
          </View>
          <View style={styles.mediaBox} pointerEvents="none">
            <Text style={styles.placeholderIcon}>📹</Text>
            <Text style={styles.placeholderText}>Ketuk untuk buka siaran...</Text>
          </View>
        </TouchableOpacity>

        {/* Card: Peta (Klik ke Tab Peta) */}
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Peta')}
        >
          <View style={styles.cardHeaderWithLink}>
            <Text style={styles.cardTitle}>Lokasi Sensor</Text>
            <Text style={styles.linkText}>Buka Peta →</Text>
          </View>
          <View style={styles.mediaBox} pointerEvents="none">
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                />
              ))}
            </MapView>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  header: { marginBottom: 24, marginTop: 8 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: COLORS.textMain, letterSpacing: -1 },
  subHeader: { fontSize: 16, fontWeight: '500', color: COLORS.textMuted, marginTop: 4 },

  // GAYA KARTU DASAR DENGAN BORDER & SHADOW HALUS (KONSISTEN UNTUK SEMUA)
  card: { 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, 
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  cardLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  cardHeaderWithLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  linkText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },

  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  waterLevelContainer: { flexDirection: 'row', alignItems: 'baseline' },
  waterLevelNumber: { fontSize: 72, fontWeight: '900', color: COLORS.textMain, letterSpacing: -2, lineHeight: 80 },
  waterLevelUnit: { fontSize: 24, fontWeight: '600', color: COLORS.textMuted, marginLeft: 8 },
  
  timestampBox: { marginTop: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  timestampText: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  
  predictionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  predictionRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  predictionLabel: { fontSize: 15, fontWeight: '500', color: COLORS.textMuted },
  predictionValue: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },

  mediaBox: { height: 180, backgroundColor: '#F1F5F9', borderRadius: 16, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  placeholderIcon: { fontSize: 32, marginBottom: 8 },
  placeholderText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },
  map: { flex: 1, width: '100%' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: COLORS.textMuted, fontWeight: '500', fontSize: 15 },
});

export default DashboardScreen;
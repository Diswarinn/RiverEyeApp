import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { getLogs, getLocations } from '../config/apiClient';
import { getRiskFromLevel } from '../config/api';

const HistoryScreen = () => {
  const [historyData, setHistoryData] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil logs dan lokasi secara paralel
      const [logsData, locationsData] = await Promise.all([
        getLogs(),
        getLocations(),
      ]);

      // Buat map lokasi untuk lookup cepat: { id: name }
      const locMap = {};
      if (locationsData) {
        locationsData.forEach((loc) => {
          locMap[loc.id] = loc.name;
        });
      }
      setLocations(locMap);

      // Sort logs berdasarkan waktu terbaru
      if (logsData && logsData.length > 0) {
        const sorted = [...logsData].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );
        setHistoryData(sorted);
      } else {
        setHistoryData([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect akan otomatis menjalankan fungsi fetch saat halaman dibuka
  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Tentukan status berdasarkan water_level_cm (menggunakan fungsi terpusat dari api.js)

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistoryData();
    setRefreshing(false);
  }, [fetchHistoryData]);

  // Desain untuk setiap baris data
  const renderItem = ({ item }) => {
    const status = getRiskFromLevel(item.water_level_cm);
    const locationName = locations[item.location_id] || `Lokasi #${item.location_id}`;
    const timestamp = new Date(item.timestamp).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.locationText}>📍 {locationName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
        <Text style={styles.levelText}>
          Ketinggian: {(item.water_level_cm / 100).toFixed(2)} m ({item.water_level_cm} cm)
        </Text>
        <Text style={styles.timeText}>🕐 {timestamp}</Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Riwayat Ketinggian Air 📊</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistoryData}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Riwayat Ketinggian Air 📊</Text>
        {!loading && (
          <Text style={styles.subText}>{historyData.length} catatan ditemukan</Text>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Mengambil data dari server...</Text>
        </View>
      ) : historyData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Belum ada data riwayat.</Text>
        </View>
      ) : (
        <FlatList
          data={historyData}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3498DB']} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { padding: 16, backgroundColor: '#FFFFFF', elevation: 2 },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  subText: { fontSize: 12, color: '#7F8C8D', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7F8C8D' },
  listContainer: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 16, marginBottom: 10, borderRadius: 8, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  locationText: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
  timeText: { fontSize: 12, color: '#95A5A6', marginTop: 4 },
  levelText: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },

  // Error & Empty states
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, color: '#E74C3C', textAlign: 'center', marginHorizontal: 32, marginBottom: 20 },
  retryButton: { backgroundColor: '#3498DB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#7F8C8D' },
});

export default HistoryScreen;
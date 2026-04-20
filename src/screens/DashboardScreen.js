import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // <-- IMPORT MAPS DI SINI

const DashboardScreen = () => {
  // Koordinat dummy untuk tampilan peta di Dashboard
  const initialRegion = {
    latitude: -7.2823,
    longitude: 112.7949,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>RiverEye 🌊</Text>
          <Text style={styles.subHeader}>Pemantauan Debit Air Real-time</Text>
        </View>

        {/* Hero Section: Status Ketinggian Air */}
        <View style={[styles.card, styles.cardSafe]}>
          <Text style={styles.cardTitle}>Status Saat Ini</Text>
          <Text style={styles.statusText}>AMAN</Text>
          <Text style={styles.waterLevel}>1.2 Meter</Text>
        </View>

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
              initialRegion={initialRegion}
              scrollEnabled={false} // Dimatikan agar tidak bentrok dengan ScrollView halaman
              zoomEnabled={false}   // Dimatikan agar pengguna harus buka halaman Peta utuh untuk interaksi
            >
              <Marker
                coordinate={{ latitude: -7.2823, longitude: 112.7949 }}
                title="CCTV & Sensor A"
              />
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
  cardSafe: { backgroundColor: '#E8F8F5', borderColor: '#2ECC71', borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#34495E', marginBottom: 8 },
  statusText: { fontSize: 24, fontWeight: 'bold', color: '#27AE60' },
  waterLevel: { fontSize: 48, fontWeight: 'bold', color: '#2C3E50', marginTop: 8 },
  
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
});

export default DashboardScreen;
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const MapScreen = () => {
  // Koordinat dummy (Area Surabaya / Sungai terdekat)
  const initialRegion = {
    latitude: -7.2823,
    longitude: 112.7949,
    latitudeDelta: 0.05, // Tingkat zoom in/out
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Pemetaan Sensor RiverEye</Text>
      </View>

      {/* Komponen Google Maps */}
      <MapView
        provider={PROVIDER_GOOGLE} // Menggunakan Google Maps
        style={styles.map}
        initialRegion={initialRegion}
      >
        {/* Pin Lokasi Dummy CCTV/Sensor */}
        <Marker
          coordinate={{ latitude: -7.2823, longitude: 112.7949 }}
          title="Titik Pantau A"
          description="Status: Aman (1.2m)"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    zIndex: 1, // Agar header berada di atas peta
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  map: {
    flex: 1, // Memenuhi sisa layar
  },
});

export default MapScreen;
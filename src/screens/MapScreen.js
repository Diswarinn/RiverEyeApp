import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getLocations } from '../config/apiClient';

const MapScreen = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Koordinat default fallback (Area Jakarta - Manggarai)
  const defaultRegion = {
    latitude: -6.2088,
    longitude: 106.8456,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLocations();
      setLocations(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Hitung region dari data lokasi
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Pemetaan Sensor RiverEye</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Memuat lokasi sensor...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Pemetaan Sensor RiverEye</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLocations}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Pemetaan Sensor RiverEye</Text>
        <Text style={styles.subText}>
          {locations.length} titik pantau ditemukan
        </Text>
      </View>

      {/* Komponen Google Maps */}
      <MapView
        provider={PROVIDER_GOOGLE} // Menggunakan Google Maps
        style={styles.map}
        initialRegion={mapRegion}
      >
        {/* Pin Lokasi dari API */}
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={`Lat: ${loc.latitude}, Lng: ${loc.longitude}`}
          />
        ))}
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
  subText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  map: {
    flex: 1, // Memenuhi sisa layar
  },
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7F8C8D',
    fontSize: 14,
  },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MapScreen;
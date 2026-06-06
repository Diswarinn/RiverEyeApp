import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const COLORS = {
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#0EA5E9',
  safe: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

// --- MOCK DATA (Sinkron dengan Dashboard) ---
const MOCK_NODES = [
  {
    id: 'ND-001',
    name: 'Pintu Air ITS',
    coordinates: { latitude: -7.2823, longitude: 112.7949 },
    hardware: { has_sensor: true, has_camera: true },
    status: { level_cm: 210, risk: 'BAHAYA', color: COLORS.danger }
  },
  {
    id: 'ND-002',
    name: 'Sungai Keputih',
    coordinates: { latitude: -7.2855, longitude: 112.7988 },
    hardware: { has_sensor: true, has_camera: false },
    status: { level_cm: 150, risk: 'WASPADA', color: COLORS.warning }
  },
  {
    id: 'ND-003',
    name: 'Saluran Mulyorejo',
    coordinates: { latitude: -7.2711, longitude: 112.7889 },
    hardware: { has_sensor: true, has_camera: true },
    status: { level_cm: 80, risk: 'AMAN', color: COLORS.safe }
  }
];

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const mapRef = useRef(null);

  // Pusatkan peta ke area Surabaya Timur
  const initialRegion = {
    latitude: -7.2800,
    longitude: 112.7950,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  const handleMarkerPress = (node) => {
    setSelectedNode(node);
    // Animasikan peta agak turun sedikit agar pin tidak tertutup Bottom Sheet
    mapRef.current?.animateToRegion({
      ...node.coordinates,
      latitude: node.coordinates.latitude - 0.005, 
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  };

  const closeBottomSheet = () => {
    setSelectedNode(null);
  };

  const handleOpenCCTV = (node) => {
    // Navigasi ke CameraScreen dan bawa data node.id agar dinamis
    navigation.navigate('Kamera', { nodeId: node.id, nodeName: node.name });
  };

  const handleOpenHistory = (node) => {
    // Navigasi ke HistoryScreen dan bawa data node untuk difilter
    navigation.navigate('Riwayat', { nodeId: node.id, nodeName: node.name });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={mapStyle}
        onPress={closeBottomSheet} // Tutup detail jika area kosong diklik
      >
        {/* Render Semua Node Aktif */}
        {MOCK_NODES.map((node) => (
          <Marker
            key={node.id}
            coordinate={node.coordinates}
            onPress={(e) => {
              e.stopPropagation(); // Mencegah trigger onPress dari MapView
              handleMarkerPress(node);
            }}
          >
            {/* Custom Marker dengan Aura Bahaya */}
            <View style={[styles.customMarker, { backgroundColor: node.status.color + '33', borderColor: node.status.color + '66' }]}>
              <View style={[styles.markerInner, { backgroundColor: node.status.color }]} />
            </View>
          </Marker>
        ))}

        {/* Dummy Rute jika mode routing aktif */}
        {isRoutingMode && (
          <Polyline
            coordinates={[
              { latitude: -7.2880, longitude: 112.7900 },
              { latitude: -7.2711, longitude: 112.7889 }, // Rute menghindar ND-001 yg banjir
            ]}
            strokeColor={COLORS.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      <SafeAreaView style={styles.headerWrapper} pointerEvents="box-none">
        <View style={styles.routingCard}>
          <View style={styles.routingHeader}>
            <Text style={styles.routingTitle}>Smart Routing Bencana</Text>
            <TouchableOpacity 
              style={[styles.routeToggleBtn, isRoutingMode && styles.routeToggleActive]}
              onPress={() => setIsRoutingMode(!isRoutingMode)}
            >
              <Text style={[styles.routeToggleText, isRoutingMode && {color: '#FFF'}]}>
                {isRoutingMode ? 'Batalkan' : 'Cari Rute Aman'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isRoutingMode && (
            <View style={styles.inputContainer}>
              <View style={styles.routeInputs}>
                <View style={styles.inputBox}>
                  <Text style={styles.dotStart}>●</Text>
                  <Text style={styles.inputText}>Lokasi Anda (Otomatis)</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.inputBox}>
                  <Text style={styles.dotEnd}>📍</Text>
                  <Text style={styles.inputText}>Pilih tujuan...</Text>
                </View>
              </View>
              <Text style={styles.routeWarningText}>⚠️ Rute akan menghindari {MOCK_NODES.filter(n=>n.status.risk === 'BAHAYA').length} titik banjir.</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {selectedNode && (
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.nodeName}>{selectedNode.name}</Text>
              <Text style={styles.nodeId}>Node ID: {selectedNode.id}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: selectedNode.status.color + '1A' }]}>
              <View style={[styles.dot, { backgroundColor: selectedNode.status.color }]} />
              <Text style={[styles.badgeText, { color: selectedNode.status.color }]}>{selectedNode.status.risk}</Text>
            </View>
          </View>

          <View style={styles.sheetBody}>
            <View style={styles.dataBlock}>
              <Text style={styles.dataLabel}>Ketinggian Air</Text>
              <Text style={styles.dataValue}>{(selectedNode.status.level_cm / 100).toFixed(2)} <Text style={styles.dataUnit}>Meter</Text></Text>
            </View>
            <View style={styles.dataBlock}>
              <Text style={styles.dataLabel}>Perangkat Keras</Text>
              <View style={styles.hardwareRow}>
                {selectedNode.hardware.has_sensor && <Text style={styles.hwIcon}>💧 Sensor Aktif</Text>}
                {selectedNode.hardware.has_camera && <Text style={styles.hwIcon}>📹 CCTV Aktif</Text>}
              </View>
            </View>
          </View>

          {/* Action Buttons: Sekarang dibagi menjadi 2 tombol berdampingan */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => handleOpenHistory(selectedNode)}
            >
              <Text style={styles.secondaryButtonText}>📊 Riwayat</Text>
            </TouchableOpacity>

            {selectedNode.hardware.has_camera ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={() => handleOpenCCTV(selectedNode)}
              >
                <Text style={styles.primaryButtonText}>🎥 Live CCTV</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.disabledButton}>
                <Text style={styles.disabledButtonText}>📵 CCTV Off</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const mapStyle = [
  { "featureType": "poi", "elementType": "labels.text", "stylers": [{ "visibility": "off" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { ...StyleSheet.absoluteFillObject },
  
  // Custom Markers
  customMarker: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  markerInner: { width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: '#FFFFFF' },

  // Floating Routing Panel
  headerWrapper: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  routingCard: { marginHorizontal: 20, marginTop: 16, padding: 16, backgroundColor: COLORS.cardBg, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  routingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routingTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textMain },
  routeToggleBtn: { backgroundColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  routeToggleActive: { backgroundColor: COLORS.primary },
  routeToggleText: { fontSize: 12, fontWeight: '700', color: COLORS.textMain },
  
  inputContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  routeInputs: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  inputBox: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  dotStart: { color: COLORS.primary, fontSize: 16, marginRight: 12 },
  dotEnd: { fontSize: 16, marginRight: 12 },
  inputText: { fontSize: 14, color: COLORS.textMain, fontWeight: '500' },
  routeLine: { width: 2, height: 20, backgroundColor: COLORS.border, marginLeft: 5 },
  routeWarningText: { fontSize: 11, color: COLORS.warning, fontWeight: '700', marginTop: 12, textAlign: 'center' },

  // Bottom Sheet Node Detail
  bottomSheet: { position: 'absolute', bottom: 32, left: 20, right: 20, backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, zIndex: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  nodeName: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginBottom: 2 },
  nodeId: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
  
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  sheetBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  dataBlock: { flex: 1 },
  dataLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4 },
  dataValue: { fontSize: 28, fontWeight: '900', color: COLORS.textMain, letterSpacing: -1 },
  dataUnit: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  
  hardwareRow: { flexDirection: 'column', gap: 6, marginTop: 4 },
  hwIcon: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden', alignSelf: 'flex-start' },

  actionRow: { marginTop: 8, flexDirection: 'row', gap: 12 },
  primaryButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: COLORS.primary + '15', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  secondaryButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  disabledButton: { flex: 1, backgroundColor: COLORS.border, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  disabledButtonText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
});

export default MapScreen;
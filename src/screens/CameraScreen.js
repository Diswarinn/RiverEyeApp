import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons'; // Menggunakan icon untuk tombol kembali

// Palet warna modern (Slate & Sky UI)
const COLORS = {
  background: '#F8FAFC', // Slate 50
  cardBg: '#FFFFFF',
  textMain: '#0F172A',   // Slate 900
  textMuted: '#64748B',  // Slate 500
  border: '#E2E8F0',     // Slate 200
  primary: '#0EA5E9',    // Sky 500
  danger: '#EF4444',     // Red 500
};

const CameraScreen = ({ route, navigation }) => {
  const [streamUrl, setStreamUrl] = useState(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Menerima data operan dari layar sebelumnya (Map/Dashboard)
  const { nodeId, nodeName } = route?.params || {};

  // Simulasi pemanggilan API untuk mendapatkan RTSP URL berdasarkan nodeId
  useEffect(() => {
    if (nodeId) {
      setIsFetchingUrl(true);
      setVideoError(false);
      
      // Simulasi delay jaringan (Nanti diganti dengan fetch() ke backend API)
      const timer = setTimeout(() => {
        // Mock URL, di sistem asli ini akan mereturn link RTSP spesifik untuk node ini
        setStreamUrl("https://www.w3schools.com/html/mov_bbb.mp4");
        setIsFetchingUrl(false);
        setIsBuffering(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [nodeId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(Date.now()); 
  };

  // Jika user langsung membuka tab Kamera tanpa memilih node
  if (!nodeId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyIcon}>🎥</Text>
          <Text style={styles.emptyTitle}>Pilih Titik Pantau</Text>
          <Text style={styles.emptyText}>Buka halaman Peta, pilih salah satu lokasi sensor, lalu ketuk "Lihat Live CCTV" untuk mulai memantau.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Peta')}>
            <Text style={styles.primaryButtonText}>Buka Peta Sekarang</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Area dengan Tombol Back */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Live Monitoring</Text>
            <Text style={styles.subHeader}>{nodeName || `Node ${nodeId}`}</Text>
          </View>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Video Player Container */}
      <View style={styles.videoWrapper}>
        <View style={styles.videoCard}>
          {/* Tampilkan loading saat fetch URL atau buffering video */}
          {(isFetchingUrl || isBuffering) && !videoError && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>
                {isFetchingUrl ? 'Mengambil rute kamera...' : 'Menghubungkan siaran...'}
              </Text>
            </View>
          )}

          {videoError ? (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorIcon}>📵</Text>
              <Text style={styles.errorText}>Kamera offline atau koneksi terputus.</Text>
            </View>
          ) : streamUrl ? (
            <Video
              key={refreshKey}
              source={{ uri: streamUrl }}
              style={styles.videoPlayer}
              resizeMode="cover"
              onReadyForDisplay={() => setIsBuffering(false)}
              onLoadStart={() => setIsBuffering(true)}
              onLoad={() => setIsBuffering(false)}
              onError={(e) => {
                console.log("Error Video:", e);
                setIsBuffering(false);
                setVideoError(true);
              }}
              controls={false}
              repeat={true}
              muted={true}
            />
          ) : null}

          {/* Overlay Info di pojok video */}
          <View style={styles.videoOverlayInfo}>
            <Text style={styles.overlayText}>{nodeId} | HD 1080p</Text>
          </View>
        </View>
      </View>

      {/* Info & Status Section */}
      <View style={styles.infoSection}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status Perangkat</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: videoError ? COLORS.danger : '#10B981' }]} />
              <Text style={styles.statusValue}>{videoError ? 'Offline' : 'Online'}</Text>
            </View>
            <Text style={styles.latencyText}>{isFetchingUrl ? '-- ms' : 'Latency: 120ms'}</Text>
          </View>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>Informasi Jaringan:</Text>
          <Text style={styles.descriptionText}>
            Siaran langsung dari modul kamera pada {nodeName || `Node ${nodeId}`}. Stream dikirimkan melalui jaringan privat Tailscale.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isFetchingUrl}
        >
          <Text style={styles.refreshButtonText}>
            {isFetchingUrl ? 'Memuat...' : 'Refresh Stream'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    paddingHorizontal: 24, 
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: COLORS.textMain,
    letterSpacing: -1
  },
  subHeader: { 
    fontSize: 14, 
    color: COLORS.textMuted,
    fontWeight: '600'
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
    marginRight: 6
  },
  liveText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '800',
  },

  // Video Styles
  videoWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24
  },
  videoCard: { 
    width: '100%', 
    height: 240, 
    backgroundColor: '#0F172A', 
    borderRadius: 24, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  videoPlayer: {
    flex: 1
  },
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2 
  },
  loadingText: { 
    color: '#FFFFFF', 
    marginTop: 12,
    fontWeight: '600',
    fontSize: 14
  },
  errorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  errorText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500'
  },
  videoOverlayInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  overlayText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold'
  },

  // Info Section Styles
  infoSection: {
    paddingHorizontal: 24
  },
  statusCard: {
    backgroundColor: COLORS.cardBg,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain
  },
  latencyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500'
  },
  descriptionBox: {
    padding: 16,
    backgroundColor: COLORS.primary + '0A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '20'
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18
  },
  refreshButton: {
    marginTop: 24,
    backgroundColor: COLORS.textMain,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16
  },
  
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  }
});

export default CameraScreen;
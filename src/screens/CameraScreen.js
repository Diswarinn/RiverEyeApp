import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';

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

const CameraScreen = () => {
  const [isBuffering, setIsBuffering] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now()); // Kunci untuk memaksa reload video

  // Link MP4 untuk testing (Nanti diganti RTSP dari Tamim)
  const streamUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; 

  const handleRefresh = () => {
    setVideoError(false);
    setIsBuffering(true);
    setRefreshKey(Date.now()); // Mengubah key akan memaksa Video component untuk re-mount
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Area */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Live Monitoring</Text>
          <Text style={styles.subHeader}>Area Papan Duga ITS</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Video Player Container */}
      <View style={styles.videoWrapper}>
        <View style={styles.videoCard}>
          {isBuffering && !videoError && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Menghubungkan ke Kamera...</Text>
            </View>
          )}

          {videoError ? (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorIcon}>📵</Text>
              <Text style={styles.errorText}>Stream terputus atau link tidak valid</Text>
            </View>
          ) : (
            <Video
              key={refreshKey} // Penambahan key di sini adalah kunci perbaikannya
              source={{ uri: streamUrl }}
              style={styles.videoPlayer}
              resizeMode="cover"
              onReadyForDisplay={() => setIsBuffering(false)}
              onLoadStart={() => setIsBuffering(true)}
              onLoad={() => setIsBuffering(false)} // Tambahan untuk memastikan loading hilang setelah load sukses
              onError={(e) => {
                console.log("Error Video:", e);
                setIsBuffering(false);
                setVideoError(true);
              }}
              controls={false}
              repeat={true}
              muted={true}
            />
          )}

          {/* Overlay Info di pojok video */}
          <View style={styles.videoOverlayInfo}>
            <Text style={styles.overlayText}>CAM_01 | HD 1080p</Text>
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
            <Text style={styles.latencyText}>Latency: 120ms</Text>
          </View>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>Catatan Tim Hardware:</Text>
          <Text style={styles.descriptionText}>
            Kamera ini menggunakan transmisi RTSP via Tailscale. Pastikan mesin 'trexbbqpanggang' aktif untuk menerima siaran video real-time.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh Stream</Text>
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
  headerTitle: { 
    fontSize: 28, 
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
  }
});

export default CameraScreen;
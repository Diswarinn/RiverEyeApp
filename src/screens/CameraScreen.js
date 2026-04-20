import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CameraScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Live CCTV Stream 🎥</Text>
      <Text style={styles.subText}>[Menunggu link RTSP dari tim Hardware]</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }, // Background hitam agar terasa seperti viewer CCTV
  text: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subText: { fontSize: 14, color: '#BDC3C7', marginTop: 10 },
});

export default CameraScreen;
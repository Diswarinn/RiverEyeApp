import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HistoryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Riwayat Ketinggian Air 📊</Text>
      <Text style={styles.subText}>[Menunggu API dari tim Backend]</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F7FA' },
  text: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  subText: { fontSize: 14, color: '#7F8C8D', marginTop: 10 },
});

export default HistoryScreen;
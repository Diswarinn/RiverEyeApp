import React from 'react';
import { Text } from 'react-native'; // <-- INI YANG TERLEWAT TADI 🙏
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import semua halaman dari folder screens
import DashboardScreen from './src/screens/DashboardScreen';
import MapScreen from './src/screens/MapScreen';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2ECC71', // Warna hijau saat tab aktif
          tabBarInactiveTintColor: '#7F8C8D', // Warna abu-abu saat tidak aktif
          headerShown: false, // Menyembunyikan header bawaan navigasi
          tabBarStyle: { paddingBottom: 5, height: 60 },
        }}
      >
        <Tab.Screen 
          name="Beranda" 
          component={DashboardScreen} 
          options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>🏠</Text> }}
        />
        <Tab.Screen 
          name="Peta" 
          component={MapScreen} 
          options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>🗺️</Text> }}
        />
        <Tab.Screen 
          name="Kamera" 
          component={CameraScreen} 
          options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>🎥</Text> }}
        />
        <Tab.Screen 
          name="Riwayat" 
          component={HistoryScreen} 
          options={{ tabBarIcon: () => <Text style={{fontSize: 20}}>📊</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
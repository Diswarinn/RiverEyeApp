import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Pastikan library ini sudah terinstall

// Import Screens (Pastikan ekstensi file screen-nya juga sudah sesuai dengan project Anda, e.g. .tsx atau .js)
import DashboardScreen from './src/screens/DashboardScreen';
import MapScreen from './src/screens/MapScreen';
import CameraScreen from './src/screens/CameraScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// 1. Definisikan tipe untuk parameter navigasi agar TypeScript tidak protes
type RootTabParamList = {
  Beranda: undefined;
  Peta: undefined;
  Kamera: undefined;
  Riwayat: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// 2. Palet warna agar sinkron dengan UI "Slate & Sky" layar lain
const COLORS = {
  primary: '#0EA5E9',    // Sky 500 (Aktif)
  inactive: '#94A3B8',   // Slate 400 (Tidak Aktif)
  background: '#FFFFFF', 
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, // Sembunyikan header bawaan navigasi
          
          // 3. Konfigurasi Ikon Dinamis
          tabBarIcon: ({ focused, color }) => {
            let iconName = 'help-outline'; // Default icon jika terjadi kesalahan type

            if (route.name === 'Beranda') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Peta') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'Kamera') {
              iconName = focused ? 'videocam' : 'videocam-outline';
            } else if (route.name === 'Riwayat') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }

            // Sedikit memperbesar ukuran ikon saat aktif agar lebih interaktif
            return <Icon name={iconName} size={focused ? 26 : 24} color={color} />;
          },
          
          // 4. Styling Premium Tab Bar
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopWidth: 0, // Menghilangkan garis abu-abu kaku di atas tab
            elevation: 15, // Shadow lembut untuk Android
            shadowColor: '#0F172A', // Shadow premium untuk iOS
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            height: 85, // Ditingkatkan dari 70 agar ada ruang untuk gesture bar
            paddingBottom: 24, // Ruang ekstra di bawah agar ikon naik menjauhi garis HP
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 4,
          },
          // Efek visual saat tab ditekan (Android Ripple Effect bounds)
          tabBarItemStyle: {
            borderRadius: 10,
          }
        })}
      >
        <Tab.Screen name="Beranda" component={DashboardScreen} />
        <Tab.Screen name="Peta" component={MapScreen} />
        <Tab.Screen name="Kamera" component={CameraScreen} />
        <Tab.Screen name="Riwayat" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
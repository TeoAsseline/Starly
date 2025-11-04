import { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Animated, Easing, Image, StyleSheet } from 'react-native';
import FlashMessage, { showMessage } from "react-native-flash-message";
import { initDatabase } from './database/db';

// Import des écrans
import ConnexionScreen from './screens/ConnexionScreen';
import RechercheScreen from './screens/RechercheScreen';
import ProfileScreen from './screens/ProfileScreen';
import DetailScreen from './screens/DetailScreen';
import WatchlistScreen from './screens/WatchlistScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const AuthContext = createContext(null);

const Loader = () => {
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })
  ).start();
  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '3600deg'] });
  return (
    <View style={styles.loaderContainer}>
      <Animated.Image style={{ width: 100, height: 100, transform: [{ rotate: spin }] }} source={require('./assets/icon-transparent-bg.png')} />
      <Text style={styles.loaderText}>Chargement de l'application...</Text>
    </View>
  );
};

const HeaderTitleWithLogo = ({ title }) => (
  <View style={styles.headerContainer}>
    <Image source={require('./assets/icon-transparent-bg.png')} style={styles.headerLogo} />
    <Text style={styles.headerTitleText}>{title}</Text>
  </View>
);

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen name="RechercheHome" component={RechercheScreen} options={{ headerTitle: () => <HeaderTitleWithLogo title="Rechercher un film" /> }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={({ route }) => ({ headerTitle: () => <HeaderTitleWithLogo title={route.params.film.Title || route.params.film.title || 'Détail'} /> })} />
    </Stack.Navigator>
  );
}

function WatchlistStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen name="WatchlistHome" component={WatchlistScreen} options={{ headerTitle: () => <HeaderTitleWithLogo title="Ma Watchlist" /> }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={({ route }) => ({ headerTitle: () => <HeaderTitleWithLogo title={route.params.film.Title || route.params.film.title || 'Détail'} /> })} />
    </Stack.Navigator>
  );
}

// Pile de navigation pour l'onglet "Profil"
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerTitle: () => <HeaderTitleWithLogo title="Mes Films Notés" /> }} />
      {/* L'écran "Watchlist" a été retiré d'ici pour devenir un onglet principal */}
      <Stack.Screen name="Detail" component={DetailScreen} options={({ route }) => ({ headerTitle: () => <HeaderTitleWithLogo title={route.params.film.Title || route.params.film.title || 'Détail'} /> })} />
    </Stack.Navigator>
  );
}

// MODIFIÉ : Ajout du nouvel onglet dans la barre de navigation principale
function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Recherche') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Watchlist') { // NOUVEAU
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#141414', borderTopColor: '#222' },
      })}
    >
      <Tab.Screen name="Recherche" component={SearchStack} />
      <Tab.Screen name="Watchlist" component={WatchlistStack} />
      <Tab.Screen name="Profil" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setDbReady(true)).catch(e => {
      console.error("Erreur d'initialisation de la DB:", e);
      showMessage({ message: "Erreur Critique", description: "Impossible d'initialiser la base de données.", type: "danger", autoHide: false });
    });
  }, []);

  if (!dbReady) return <Loader />;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <Stack.Screen name="MainApp" component={MainAppTabs} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="Connexion" component={ConnexionScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
      <FlashMessage position="top" />
    </AuthContext.Provider>
  );
}

const stackNavigatorOptions = {
  headerStyle: { backgroundColor: '#141414' },
  headerTintColor: '#fff',
};

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, backgroundColor: '#141414', justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#fff', marginTop: 20 },
  headerContainer: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: { width: 50, height: 50, marginRight: 10, resizeMode: 'contain' },
  headerTitleText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
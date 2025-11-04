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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const AuthContext = createContext(null);

// Composant pour l'écran de chargement
const Loader = () => {
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 20000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3600deg'],
  });
  return (
    <View style={styles.loaderContainer}>
      <Animated.Image
        style={{ width: 100, height: 100, transform: [{ rotate: spin }] }}
        source={require('./assets/icon-transparent-bg.png')}
      />
      <Text style={styles.loaderText}>Chargement de l'application...</Text>
    </View>
  );
};

const HeaderTitleWithLogo = ({ title }) => (
  <View style={styles.headerContainer}>
    <Image
      source={require('./assets/icon-transparent-bg.png')} 
      style={styles.headerLogo}
    />
    <Text style={styles.headerTitleText}>{title}</Text>
  </View>
);

// Pile de navigation pour l'onglet "Recherche"
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen
        name="RechercheHome"
        component={RechercheScreen}
        // MODIFIÉ: Utilisation de headerTitle au lieu de title
        options={{
          headerTitle: () => <HeaderTitleWithLogo title="Rechercher un film" />,
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        // MODIFIÉ: Utilisation de headerTitle avec titre dynamique
        options={({ route }) => ({
          headerTitle: () => <HeaderTitleWithLogo title={route.params.film.Title || route.params.film.title || 'Détail'} />,
        })}
      />
    </Stack.Navigator>
  );
}

// Pile de navigation pour l'onglet "Profil"
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        // MODIFIÉ: Utilisation de headerTitle
        options={{
          headerTitle: () => <HeaderTitleWithLogo title="Mes Films Notés" />,
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        // MODIFIÉ: Utilisation de headerTitle avec titre dynamique
        options={({ route }) => ({
          headerTitle: () => <HeaderTitleWithLogo title={route.params.film.Title || route.params.film.title || 'Détail'} />,
        })}
      />
    </Stack.Navigator>
  );
}

// Le conteneur principal des onglets
function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Recherche') {
            iconName = focused ? 'search' : 'search-outline';
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
      <Tab.Screen name="Profil" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => {
      setDbReady(true);
    }).catch(e => {
      console.error("Erreur d'initialisation de la DB:", e);
      showMessage({
        message: "Erreur Critique",
        description: "Impossible d'initialiser la base de données.",
        type: "danger",
        autoHide: false,
      });
    });
  }, []);

  if (!dbReady) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <Stack.Screen
              name="MainApp"
              component={MainAppTabs}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="Connexion"
              component={ConnexionScreen}
              options={{ headerShown: false }}
            />
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
  loaderContainer: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#fff',
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
    resizeMode: 'contain',
  },
  headerTitleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
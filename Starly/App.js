import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './database/db'; // Import de la fonction d'initialisation

// Import des écrans
import ConnexionScreen from './screens/ConnexionScreen';
import RechercheScreen from './screens/RechercheScreen';
import ProfileScreen from './screens/ProfileScreen';
import DetailScreen from './screens/DetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Création d'un contexte pour l'utilisateur
export const AuthContext = createContext(null);

// Pile de navigation pour l'onglet "Recherche"
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen 
        name="RechercheHome" 
        component={RechercheScreen} 
        options={{ title: 'Rechercher un film' }} 
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={({ route }) => ({ title: route.params.film.Title || route.params.film.title || 'Détail' })}
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
        options={{ title: 'Mes Films Notés' }} 
      />
       {/* On peut aussi naviguer vers le détail depuis le profil */}
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={({ route }) => ({ title: route.params.film.Title || route.params.film.title || 'Détail' })}
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
    // Initialise la base de données au démarrage de l'application
    initDatabase().then(() => {
      setDbReady(true);
    }).catch(e => {
      console.error("Erreur d'initialisation de la DB:", e);
      // Gérer l'erreur (ex: afficher un message à l'utilisateur)
    });
  }, []);

  if (!dbReady) {
    // Écran de chargement simple en attendant l'initialisation de la DB
    return (
      <View style={{ flex: 1, backgroundColor: '#141414', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>Chargement de l'application...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            // Utilisateur connecté
            <Stack.Screen 
              name="MainApp" 
              component={MainAppTabs} 
              options={{ headerShown: false }} 
            />
          ) : (
            // Utilisateur déconnecté
            <Stack.Screen 
              name="Connexion" 
              component={ConnexionScreen} 
              options={{ headerShown: false }} 
            />
          )}
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

// Options communes pour les headers des piles
const stackNavigatorOptions = {
  headerStyle: { backgroundColor: '#141414' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

// Ajout de l'import de View et Text pour l'écran de chargement
import { View, Text } from 'react-native';

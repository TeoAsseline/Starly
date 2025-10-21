import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Import des écrans
import ConnexionScreen from './screens/ConnexionScreen';
import RechercheScreen from './screens/RechercheScreen';
import ProfileScreen from './screens/ProfileScreen'; // Le nouvel écran de profil
import DetailScreen from './screens/DetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pile de navigation pour l'onglet "Recherche"
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen 
        name="RechercheHome" // Nom unique pour l'écran de base de la pile
        component={RechercheScreen} 
        options={{ title: 'Rechercher un film' }} 
      />
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={({ route }) => ({ title: route.params.film.title || 'Détail' })}
      />
    </Stack.Navigator>
  );
}

// Pile de navigation pour l'onglet "Profil"
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackNavigatorOptions}>
      <Stack.Screen 
        name="ProfileHome" // Nom unique
        component={ProfileScreen} 
        options={{ title: 'Mes Films Notés' }} 
      />
       {/* On peut aussi naviguer vers le détail depuis le profil */}
      <Stack.Screen 
        name="Detail" 
        component={DetailScreen}
        options={({ route }) => ({ title: route.params.film.title || 'Détail' })}
      />
    </Stack.Navigator>
  );
}

// Le conteneur principal des onglets
function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // On cache le header des onglets, car les Stacks en ont déjà un
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Recherche') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E50914', // Couleur de l'icône active
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
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Connexion" 
          component={ConnexionScreen} 
          options={{ headerShown: false }} 
        />
        {/* L'écran suivant est le conteneur des onglets */}
        <Stack.Screen 
          name="MainApp" 
          component={MainAppTabs} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

// Options communes pour les headers des piles
const stackNavigatorOptions = {
  headerStyle: { backgroundColor: '#141414' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};
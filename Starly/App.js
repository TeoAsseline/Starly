// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// On importera nos écrans ici (on les crée juste après)
import ConnexionScreen from './screens/ConnexionScreen';
import RechercheScreen from './screens/RechercheScreen';
import DetailScreen from './screens/DetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      const db = await initDatabase();
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        // Options pour un design plus sobre et moderne
        screenOptions={{
          headerStyle: {
            backgroundColor: '#141414', // Fond du header sombre
          },
          headerTintColor: '#fff', // Couleur du texte du header en blanc
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* L'écran initial sera la connexion */}
        <Stack.Screen 
          name="Connexion" 
          component={ConnexionScreen} 
          options={{ headerShown: false }} // On cache le header sur la page de connexion
        />
        <Stack.Screen 
          name="Recherche" 
          component={RechercheScreen} 
          options={{ title: 'Rechercher un film' }}
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen}
          // Le titre de cette page sera dynamique (le nom du film)
          options={({ route }) => ({ title: route.params.film.title })} 
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
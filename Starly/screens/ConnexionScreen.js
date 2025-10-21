// screens/ConnexionScreen.js
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

// On reçoit "navigation" en props grâce à React Navigation
export default function ConnexionScreen({ navigation }) {
  
  // Fonction pour naviguer vers l'écran de recherche
  const handleLogin = () => {
    // Ici, tu mettrais ta logique de vérification de login/mot de passe
    // Pour l'exemple, on navigue directement
    navigation.replace('Recherche'); // .replace empêche de revenir en arrière à la connexion
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starly</Text>
      <Text style={styles.subtitle}>Notez et archivez vos films préférés.</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#888"
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414', // Fond sombre type Netflix
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E50914', // Rouge Netflix
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#E50914',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
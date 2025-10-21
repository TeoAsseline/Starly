import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { loginUser, registerUser } from '../database/db'; // Import des fonctions DB
import { AuthContext } from '../App'; // Import du contexte utilisateur

export default function ConnexionScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // État pour basculer entre connexion et inscription

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert("Erreur", "Veuillez entrer un login et un mot de passe.");
      return;
    }
    
    try {
      const user = await loginUser(login, password);
      if (user) {
        setUser(user); // Met à jour l'utilisateur dans le contexte, ce qui navigue vers MainApp
      } else {
        Alert.alert("Erreur de connexion", "Login ou mot de passe incorrect.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la connexion.");
    }
  };

  const handleRegister = async () => {
    if (!nom || !login || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      const userId = await registerUser(nom, login, password);
      Alert.alert("Succès", "Compte créé ! Vous pouvez maintenant vous connecter.");
      setIsRegistering(false); // Revient à l'écran de connexion
      setNom('');
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      Alert.alert("Erreur", "Ce login est peut-être déjà utilisé.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Starly</Text>
      <Text style={styles.subtitle}>Notez et archivez vos films préférés.</Text>
      
      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Nom / Pseudo"
          placeholderTextColor="#888"
          value={nom}
          onChangeText={setNom}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Login (Email)"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={login}
        onChangeText={setLogin}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={isRegistering ? handleRegister : handleLogin}
      >
        <Text style={styles.buttonText}>{isRegistering ? "Créer un compte" : "Se connecter"}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton} 
        onPress={() => setIsRegistering(!isRegistering)}
      >
        <Text style={styles.linkText}>
          {isRegistering ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Inscrivez-vous"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414', 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E50914', 
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
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: '#ccc',
    fontSize: 14,
  }
});

import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { showMessage } from "react-native-flash-message"; 
import { loginUser, registerUser } from '../database/db';
import { AuthContext } from '../App';

export default function ConnexionScreen({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // État pour basculer entre connexion et inscription

  const handleLogin = async () => {
    if (!login || !password) {
      showMessage({
        message: "Attention",
        description: "Veuillez entrer un login et un mot de passe.",
        type: "warning",
      });
      return;
    }
    
    try {
      const user = await loginUser(login, password);
      if (user) {
        showMessage({
          message: "Connexion réussie",
          description: `Bienvenue, ${user.nom}!`,
          type: "success",
        });
        setUser(user); // Met à jour l'utilisateur dans le contexte, ce qui navigue vers MainApp
      } else {
        showMessage({
          message: "Échec de la connexion",
          description: "Login ou mot de passe incorrect.",
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      showMessage({
        message: "Erreur Système",
        description: "Une erreur est survenue lors de la connexion. Réessayez.",
        type: "danger",
      });
    }
  };

  const handleRegister = async () => {
    if (!nom || !login || !password) {
      showMessage({
        message: "Attention",
        description: "Veuillez remplir tous les champs.",
        type: "warning",
      });
      return;
    }

    try {
      const userId = await registerUser(nom, login, password);
      showMessage({
        message: "Succès de l'inscription",
        description: "Compte créé ! Veuillez vous connecter.",
        type: "success",
      });
      setIsRegistering(false); // Revient à l'écran de connexion
      setNom('');
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      showMessage({
        message: "Échec de l'inscription",
        description: "Ce login est peut-être déjà utilisé ou une erreur est survenue.",
        type: "danger",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/icon-transparent-bg.png')}
        style={styles.logo}
      />
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
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain', 
    marginBottom: 20,
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
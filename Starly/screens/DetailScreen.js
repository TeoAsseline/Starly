// screens/DetailScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
// On va installer `expo-vector-icons` pour les étoiles
// npx expo install @expo/vector-icons
import { Ionicons } from '@expo/vector-icons'; 

// Composant pour la notation par étoiles
const StarRating = ({ rating, onRatingChange }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={40}
            color="#FFD700" // Couleur or
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};


export default function DetailScreen({ route }) {
  // On récupère les données du film passées depuis l'écran de recherche
  const { film } = route.params;

  // Variables d'état pour la note et le commentaire de l'utilisateur
  const [note, setNote] = useState(0); // Note de 0 à 5
  const [commentaire, setCommentaire] = useState('');

  const handleSave = () => {
    // ICI, tu enregistreras la "note" et le "commentaire" dans ta base de données SQLite
    console.log(`Film: ${film.title}, Note: ${note}, Commentaire: ${commentaire}`);
    alert('Note enregistrée !');
  };

  const posterUrl = film.poster_path
    ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
    : 'https://via.placeholder.com/200/141414/FFFFFF/?text=Pas+d\'affiche';

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: posterUrl }} style={styles.poster} />
      <View style={styles.content}>
        <Text style={styles.title}>{film.title}</Text>
        <Text style={styles.description}>
          {film.overview || "Aucune description disponible."} {/* Pour les données d'exemple */}
        </Text>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Votre note</Text>
          <StarRating rating={note} onRatingChange={setNote} />
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Votre commentaire</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Ajoutez un commentaire..."
            placeholderTextColor="#888"
            multiline
            value={commentaire}
            onChangeText={setCommentaire}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  poster: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
  },
  ratingSection: {
    marginVertical: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  starContainer: {
    flexDirection: 'row',
  },
  commentSection: {
    marginBottom: 30,
  },
  commentInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top', // Pour que le texte commence en haut
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#E50914',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
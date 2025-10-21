// screens/DetailScreen.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import StarRating from '../components/StarRating'; 


export default function DetailScreen({ route }) {
  // On récupère les données du film passées depuis l'écran de recherche
  const { film } = route.params;

  const [note, setNote] = useState(film.user_note || 0); 
  const [commentaire, setCommentaire] = useState(film.user_comment || '');

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
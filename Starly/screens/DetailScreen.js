import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import StarRating from '../components/StarRating'; // Assurez-vous que StarRating est dans le dossier components ou importez-le correctement
import { saveFilm, getFilmNote } from '../database/db'; // Import des fonctions DB
import { AuthContext } from '../App'; // Import du contexte utilisateur

export default function DetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  // On récupère les données du film passées depuis l'écran de recherche
  const { film } = route.params;

  const [note, setNote] = useState(0); 
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(true);

  // Détermine la source de l'affiche (TMDB ou OMDb/DB)
  const posterUrl = film.Poster 
    ? film.Poster // OMDb Poster
    : film.poster_path 
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}` // TMDB Poster
      : 'https://via.placeholder.com/200/141414/FFFFFF/?text=Pas+d\'affiche';

  // Récupère la note et le commentaire existants au chargement
  useEffect(() => {
    async function loadExistingNote() {
      if (user && film.imdbID) {
        try {
          const existingFilm = await getFilmNote(user.id, film.imdbID);
          if (existingFilm) {
            setNote(existingFilm.note);
            setCommentaire(existingFilm.commentaire || '');
          }
        } catch (error) {
          console.error("Erreur lors du chargement de la note:", error);
        }
      }
      setLoading(false);
    }
    loadExistingNote();
  }, [user, film.imdbID]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour noter un film.");
      return;
    }
    if (note === 0) {
        Alert.alert("Erreur", "Veuillez donner une note de 1 à 5 étoiles.");
        return;
    }

    try {
      // Données à enregistrer
      const filmData = {
        imdbID: film.imdbID,
        titre: film.Title || film.title,
        note: note,
        commentaire: commentaire,
        poster: posterUrl,
        annee: film.Year || new Date(film.release_date).getFullYear().toString(),
      };

      await saveFilm(user.id, filmData);
      Alert.alert("Succès", "Votre note et votre commentaire ont été enregistrés !");
      
      // Optionnel: Retourner à l'écran précédent ou rafraîchir le profil
      navigation.goBack(); 

    } catch (error) {
      console.error("Erreur lors de l'enregistrement du film:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: posterUrl }} style={styles.poster} />
      <View style={styles.content}>
        <Text style={styles.title}>{film.Title || film.title}</Text>
        <Text style={styles.description}>
          {film.Plot || film.overview || "Aucune description disponible."}
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
          <Text style={styles.saveButtonText}>Enregistrer ma note</Text>
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
  commentSection: {
    marginBottom: 30,
  },
  commentInput: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top', 
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

import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { showMessage } from "react-native-flash-message"; 
import StarRating from '../components/StarRating';
import { saveFilm, getFilmNote } from '../database/db';
import { AuthContext } from '../App';

export default function DetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { film } = route.params;

  const [note, setNote] = useState(0); 
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(true);

  const posterUrl = film.Poster 
    ? film.Poster
    : film.poster_path 
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
      : 'https://via.placeholder.com/200/141414/FFFFFF/?text=Pas+d\'affiche';

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
          // Pas d'alerte critique ici, juste un échec silencieux du chargement
        }
      }
      setLoading(false);
    }
    loadExistingNote();
  }, [user, film.imdbID]);

  const handleSave = async () => {
    if (!user) {
      showMessage({
        message: "Action non autorisée",
        description: "Vous devez être connecté pour noter un film.",
        type: "danger",
      });
      return;
    }
    // Validation adaptée : 0 signifie qu'aucune étoile (même pas une demi) n'a été sélectionnée.
    if (note === 0) {
        showMessage({
          message: "Note manquante",
          description: "Veuillez attribuer au moins une demi-étoile (0,5/10).",
          type: "warning",
        });
        return;
    }

    try {
      const filmData = {
        imdbID: film.imdbID,
        titre: film.Title || film.title,
        note: note,
        commentaire: commentaire,
        poster: posterUrl,
        // Utilisez le Year pour les films OMDB ou extrayez l'année de release_date pour TMDB
        annee: film.Year || (film.release_date ? new Date(film.release_date).getFullYear().toString() : 'N/A'),
      };

      // Supposons que saveFilm retourne 'UPDATE' ou 'INSERT'
      const operationType = await saveFilm(user.id, filmData); 
      
      const successMessage = operationType === 'UPDATE' 
        ? "Votre note et votre commentaire ont été mis à jour !" 
        : "Le film a été ajouté à votre liste !";

      showMessage({
        message: "Succès de l'enregistrement",
        description: successMessage,
        type: "success",
      });
      
      // On navigue uniquement après le succès
      navigation.goBack(); 

    } catch (error) {
      console.error("Erreur lors de l'enregistrement du film:", error);
      showMessage({
        message: "Erreur d'enregistrement",
        description: "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.",
        type: "danger",
        autoHide: true,
        duration: 5000,
      });
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
          
          {/* Le composant StarRating gère l'affichage, on lui passe juste la note sur 10 */}
          <StarRating rating={note} onRatingChange={setNote} />
          
          {/* PETIT AJOUT UTILE : Affiche la valeur numérique pour confirmer à l'utilisateur */}
          {note > 0 && (
            <Text style={styles.ratingValue}>
              {note}/10
            </Text>
          )}
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
  ratingValue: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
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
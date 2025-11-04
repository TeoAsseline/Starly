import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import StarRating from '../components/StarRating';
import { saveFilm, getFilmNote } from '../database/db';
import { AuthContext } from '../App';
import { Ionicons } from '@expo/vector-icons';

export default function DetailScreen({ route }) {
  const { user } = useContext(AuthContext);
  const { film } = route.params;

  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [aRegarder, setARegarder] = useState(false);
  const [loading, setLoading] = useState(true);

  const filmId = film.imdbID || film.id?.toString();

  const posterUrl =
    film.Poster && film.Poster !== 'N/A'
      ? film.Poster
      : film.poster_path
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
      : "https://via.placeholder.com/200/141414/FFFFFF/?text=Pas+d'affiche";

  const saveTimeout = useRef(null); // debounce commentaire

  useEffect(() => {
    async function loadExistingData() {
      if (!user || !filmId) {
        setLoading(false);
        return;
      }
      try {
        const existingFilm = await getFilmNote(user.id, filmId);
        if (existingFilm) {
          setNote(existingFilm.note || 0);
          setCommentaire(existingFilm.commentaire || '');
          setARegarder(!!existingFilm.a_regarder);
        }
      } catch (error) {
        console.error('Erreur chargement film:', error);
      } finally {
        setLoading(false);
      }
    }
    loadExistingData();
  }, [user, filmId]);

  const autoSave = async (newValues) => {
    if (!user || !filmId) return;

    const filmData = {
      imdbID: filmId,
      titre: film.Title || film.title || 'Titre inconnu',
      note: newValues.note ?? note,
      commentaire: newValues.commentaire ?? commentaire,
      a_regarder: newValues.a_regarder ?? aRegarder,
      poster: posterUrl,
      annee:
        film.Year ||
        (film.release_date
          ? new Date(film.release_date).getFullYear().toString()
          : 'N/A'),
    };

    try {
      await saveFilm(user.id, filmData);
    } catch (error) {
      showMessage({ message: 'Erreur de sauvegarde', type: 'danger' });
    }
  };

  // 👁 Flip direct pour le bouton "À voir"
  const handleToggleARegarder = async () => {
    if (!aRegarder && note > 0) {
      // Cas : le film a une note et on veut le mettre "à voir" → on supprime la note
      setARegarder(true);
      setNote(0);
      setCommentaire('');
      await autoSave({ a_regarder: true, note: 0, commentaire: '' });
      showMessage({
        message: "Le film a été ajouté dans les films 'À voir'",
        type: 'info',
      });
    } else if (aRegarder) {
      // Cas : on retire de "à voir"
      setARegarder(false);
      await autoSave({ a_regarder: false });
      showMessage({
        message: "Le film a été retiré de la liste 'À voir'",
        type: 'info',
      });
    } else {
      // Cas simple : film sans note, on l’ajoute à “à voir”
      setARegarder(true);
      await autoSave({ a_regarder: true });
      showMessage({
        message: "Le film a été ajouté dans les films 'À voir'",
        type: 'info',
      });
    }
  };

  // ⭐ Quand on note → on retire le film de "à voir"
  const handleRatingChange = async (newNote) => {
    setNote(newNote);
    if (newNote > 0 && aRegarder) {
      setARegarder(false);
      showMessage({
        message: "Le film a été retiré de la liste 'À voir'",
        type: 'info',
      });
      await autoSave({ note: newNote, a_regarder: false });
    } else {
      await autoSave({ note: newNote });
    }
  };

  // 💬 Debounce pour commentaire
  const handleCommentChange = (text) => {
    setCommentaire(text);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      autoSave({ commentaire: text });
    }, 800);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
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
          {film.Plot || film.overview || 'Aucune description disponible.'}
        </Text>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.watchListButton}
            onPress={handleToggleARegarder}
          >
            <Ionicons
              name={aRegarder ? 'eye-off' : 'eye'}
              size={24}
              color={aRegarder ? '#E50914' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Votre note</Text>
          <StarRating rating={note} onRatingChange={handleRatingChange} />
          {note > 0 && (
            <Text style={styles.ratingValue}>{note}/10</Text>
          )}
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Votre commentaire</Text>
          <TextInput
            style={[
              styles.commentInput,
              { backgroundColor: aRegarder ? '#222' : '#333' },
            ]}
            placeholder={
              aRegarder
                ? 'Notez le film pour pouvoir commenter'
                : 'Ajoutez un commentaire...'
            }
            placeholderTextColor="#888"
            multiline
            value={commentaire}
            onChangeText={handleCommentChange}
            editable={!aRegarder}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 300, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  description: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  actionSection: {
    marginVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 20,
  },
  watchListButton: { padding: 10 },
  ratingSection: { marginVertical: 20, alignItems: 'center' },
  ratingValue: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  commentSection: { marginBottom: 30 },
  commentInput: {
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
});

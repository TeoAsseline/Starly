import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ce composant reçoit les données d'un film et une fonction onPress
export default function FilmCard({ film, onPress, userNote }) {
  // Détermine l'URL de l'affiche
  const posterUrl = film.Poster && film.Poster !== 'N/A'
    ? film.Poster // Affiche OMDb (URL complète)
    : film.poster_path 
      ? `https://image.tmdb.org/t/p/w500${film.poster_path}` // Affiche TMDB (path)
      : '';

  // Détermine le titre et l'année
  const title = film.Title || film.title;
  const year = film.Year || (film.release_date ? new Date(film.release_date).getFullYear() : 'N/A');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image 
        source={{ uri: posterUrl }} 
        style={styles.poster} 
        // Ajout d'une prop pour éviter l'erreur si l'URI est invalide
        onError={(e) => console.log('Erreur de chargement de l\'image:', e.nativeEvent.error)}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.year}>{year}</Text>
        {/* On affiche la note si elle est fournie */}
        {userNote && (
          <View style={styles.noteContainer}>
            <Ionicons name="star" color="#FFD700" size={16} />
            <Text style={styles.noteText}>{userNote} / 10</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    overflow: 'hidden', 
  },
  poster: {
    width: 100,
    height: 150,
    backgroundColor: '#333', // Fond en cas d'absence d'image
  },
  info: {
    padding: 15,
    flex: 1, 
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  year: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
   noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  noteText: {
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: 'bold',
  }
});

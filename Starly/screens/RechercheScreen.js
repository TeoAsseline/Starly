import React, { useState } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, ActivityIndicator, Alert } from 'react-native';
import FilmCard from '../components/FilmCard'; 
import { searchMoviesByTitle, getMovieDetails } from '../api'; // Import des fonctions API

export default function RechercheScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.trim() === '') {
      setFilms([]);
      return;
    }

    setLoading(true);
    try {
      const resultats = await searchMoviesByTitle(query);
      setFilms(resultats);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      Alert.alert("Erreur", "Impossible de contacter l'API de films.");
      setFilms([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCardPress = async (film) => {
    setLoading(true);
    try {
        // Récupère les détails complets (Plot, etc.)
        const details = await getMovieDetails(film.imdbID);
        if (details) {
            // Navigue vers la page de détail en passant les données complètes
            navigation.navigate('Detail', { film: details });
        } else {
            Alert.alert("Erreur", "Impossible de récupérer les détails du film.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des détails:", error);
        Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Entrez le nom d'un film..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch} 
      />
      {loading ? (
        <ActivityIndicator size="large" color="#E50914" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={films}
          keyExtractor={(item) => item.imdbID}
          renderItem={({ item }) => (
            <FilmCard
              film={item}
              onPress={() => handleCardPress(item)}
            />
          )}
          ListEmptyComponent={
            query.trim() !== '' && films.length === 0 && !loading ? (
              <Text style={styles.emptyText}>Aucun film trouvé pour "{query}".</Text>
            ) : (
              <Text style={styles.emptyText}>Commencez à taper un titre pour rechercher.</Text>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  searchBar: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    margin: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  }
});

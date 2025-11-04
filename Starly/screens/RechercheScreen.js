// RechercheScreen.js

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { MaterialIcons } from '@expo/vector-icons';
import FilmCard from '../components/FilmCard';
import { searchMoviesByTitle, getMovieDetails } from '../api';

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
    setFilms([]); // Vide les résultats précédents avant une nouvelle recherche
    try {
      const resultats = await searchMoviesByTitle(query);

      if (resultats && resultats.length > 0) {
        setFilms(resultats);
      } else {
        showMessage({
          message: 'Aucun Résultat',
          description: `Aucun film trouvé pour la recherche : "${query}".`,
          type: 'info',
        });
        setFilms([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      
      // **ICI : Vérification du message de l'erreur**
      if (error.message === "Trop de résultats, affinez la recherche.") {
        showMessage({
          message: 'Trop de résultats',
          description: "Veuillez affiner votre recherche pour obtenir des résultats plus précis.",
          type: 'warning', // 'warning' est plus approprié ici
        });
      } else {
        // Erreur générique si ce n'est pas celle que nous attendons
        showMessage({
          message: 'Erreur API',
          description: "Impossible de contacter l'API de films. Vérifiez votre connexion.",
          type: 'danger',
        });
      }
      setFilms([]); // Assure que la liste est vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // ... (le reste de votre composant reste inchangé)

  const handleCardPress = async (film) => {
    setLoading(true);
    try {
      const details = await getMovieDetails(film.imdbID);
      if (details) {
        navigation.navigate('Detail', { film: details });
      } else {
        showMessage({
          message: 'Détails Manquants',
          description: 'Impossible de récupérer les détails complets du film sélectionné.',
          type: 'danger',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      showMessage({
        message: 'Erreur Système',
        description: 'Une erreur est survenue lors de la récupération des détails.',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setFilms([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Entrez le nom d'un film..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <MaterialIcons name="clear" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E50914" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={films}
          keyExtractor={(item) => item.imdbID}
          renderItem={({ item }) => <FilmCard film={item} onPress={() => handleCardPress(item)} />}
          ListEmptyComponent={
            films.length === 0 && !loading ? (
              <Text style={styles.emptyText}>Commencez à taper un titre pour rechercher.</Text>
            ) : null
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  searchBar: {
    flex: 1,
    color: '#fff',
    padding: 15,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});
// screens/RechercheScreen.js
import React, { useState } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text } from 'react-native';
import FilmCard from '../components/FilmCard'; // Import de notre composant

// Données d'exemple (à remplacer par ton appel API)
const DONNEES_EXEMPLE = [
  { id: 77338, title: 'Intouchables', release_date: '2011-11-02', poster_path: '/23aRgI4yv2LK2T0SgA1e9IegRzh.jpg' },
  { id: 1375666, title: 'Inception', release_date: '2010-07-16', poster_path: '/tptayRbdA3aWRHhW3nEaO2bA8l.jpg' },
];

export default function RechercheScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [films, setFilms] = useState(DONNEES_EXEMPLE); // Pour l'instant on utilise les données d'exemple

  const handleSearch = () => {
    // ICI, tu lanceras ton appel API avec la variable "query"
    // Par exemple: const resultats = await searchMovies(query);
    // setFilms(resultats);
    console.log('Recherche de :', query);
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Entrez le nom d'un film..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch} // Lance la recherche quand on appuie sur "Entrée"
      />
      <FlatList
        data={films}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FilmCard
            film={item}
            // Au clic, on navigue vers la page de détail en passant les données du film
            onPress={() => navigation.navigate('Detail', { film: item })}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun film trouvé.</Text>}
      />
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
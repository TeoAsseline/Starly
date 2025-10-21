import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import FilmCard from '../components/FilmCard';

// SIMULATION DE DONNÉES VENANT DE LA BASE DE DONNÉES LOCALE
const FILMS_NOTES_EXEMPLE = [
  { id: 77338, title: 'Intouchables 2', release_date: '2011-11-02', poster_path: '/23aRgI4yv2LK2T0SgA1e9IegRzh.jpg', user_note: 4.5, user_comment: 'Excellent film, très touchant !' },
  { id: 496243, title: 'Parasite', release_date: '2019-06-05', poster_path: '/pci1TBN1gK5Q8oWIzE0LflJa2Qs.jpg', user_note: 5, user_comment: 'Une claque cinématographique.' },
];

export default function ProfileScreen({ navigation }) {
  const [ratedFilms, setRatedFilms] = useState([]);

  useEffect(() => {
    // ICI, tu feras ton appel à SQLite pour récupérer les films notés
    // const filmsFromDB = await getRatedMoviesFromDB();
    // setRatedFilms(filmsFromDB);
    setRatedFilms(FILMS_NOTES_EXEMPLE); // On utilise les données simulées
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une fois au montage

  return (
    <View style={styles.container}>
      {ratedFilms.length === 0 ? (
        <Text style={styles.emptyText}>Vous n'avez encore noté aucun film.</Text>
      ) : (
        <FlatList
          data={ratedFilms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FilmCard
              film={item}
              // On peut passer la note de l'utilisateur à la carte pour l'afficher
              userNote={item.user_note}
              onPress={() => navigation.navigate('Detail', { film: item })}
            />
          )}
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
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16
  }
});
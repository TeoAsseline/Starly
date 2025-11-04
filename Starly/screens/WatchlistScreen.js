import React, { useState, useCallback, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FilmCard from '../components/FilmCard';
import { getFilmsARegarderByUser } from '../database/db';
import { AuthContext } from '../App';

export default function WatchlistScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      const watchlistFilms = await getFilmsARegarderByUser(user.id);
      setFilms(watchlistFilms);
    } catch (error) {
      console.error('Erreur lors du chargement de la watchlist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadWatchlist();
    }, [loadWatchlist])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadWatchlist();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={films}
        keyExtractor={(item) => item.idFilm.toString()}
        renderItem={({ item }) => (
            <View style={styles.cardContainer}>
                <FilmCard
                    film={{
                    Poster: item.poster,
                    title: item.titre,
                    Year: item.annee,
                    }}
                    onPress={() =>
                    navigation.navigate('Detail', {
                        film: {
                        imdbID: item.imdbID,
                        Title: item.titre,
                        Year: item.annee,
                        Poster: item.poster,
                        },
                    })
                    }
                />
            </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Votre liste de films à regarder est vide.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        contentContainerStyle={{ paddingTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  cardContainer: {
      marginHorizontal: 10,
      marginBottom: 10,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
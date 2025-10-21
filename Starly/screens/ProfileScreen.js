import React, { useState, useEffect, useContext, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import FilmCard from '../components/FilmCard'; 
import { getFilmsByUser, deleteFilm, getStats } from '../database/db';
import { AuthContext } from '../App';
import { TouchableOpacity } from 'react-native'; 

// Composant pour afficher les statistiques
const StatsDashboard = ({ stats }) => (
  <View style={statsStyles.statsContainer}>
    <View style={statsStyles.statBox}>
      <Text style={statsStyles.statNumber}>{stats.totalFilms}</Text>
      <Text style={statsStyles.statLabel}>Films Vus</Text>
    </View>
    <View style={statsStyles.statBox}>
      <Text style={statsStyles.statNumber}>{stats.moyenneNotes}</Text>
      <Text style={statsStyles.statLabel}>Note Moyenne</Text>
    </View>
  </View>
);

const statsStyles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    color: '#FFD700', // Or Jaune pour les stats
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
  },
});

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [films, setFilms] = useState([]);
  const [stats, setStats] = useState({ totalFilms: 0, moyenneNotes: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFilmsAndStats = useCallback(async () => {
    if (!user) return;

    try {
      const [userFilms, userStats] = await Promise.all([
        getFilmsByUser(user.id),
        getStats(user.id)
      ]);
      setFilms(userFilms);
      setStats(userStats);
    } catch (error) {
      console.error("Erreur lors du chargement des films/stats:", error);
      Alert.alert("Erreur", "Impossible de charger vos films.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadFilmsAndStats();
    }, [loadFilmsAndStats])
  );

  const handleDelete = (idFilm) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette note ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              await deleteFilm(idFilm);
              loadFilmsAndStats(); 
            } catch (error) {
              console.error("Erreur de suppression:", error);
              Alert.alert("Erreur", "Impossible de supprimer la note.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogout = () => {
    setUser(null); 
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFilmsAndStats();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenue, {user?.nom} !</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <StatsDashboard stats={stats} />

      <FlatList
        data={films}
        keyExtractor={(item) => item.idFilm.toString()}
        renderItem={({ item }) => (
          <View style={styles.filmRow}>
            <FilmCard
              // On adapte les props pour FilmCard qui attend un objet film
              film={{ 
                // Permet à FilmCard de choisir la bonne source d'affiche
                Poster: item.poster, 
                title: item.titre, 
                Year: item.annee, 
              }}
              userNote={item.note}
              onPress={() => navigation.navigate('Detail', { 
                // On reconstitue un objet film pour DetailScreen
                film: {
                  imdbID: item.imdbID,
                  Title: item.titre,
                  Year: item.annee,
                  Poster: item.poster,
                  Plot: item.commentaire, 
                  user_note: item.note,
                  user_comment: item.commentaire,
                }
              })}
            />
            {/* Bouton de suppression à côté de la carte */}
            <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDelete(item.idFilm)}
            >
                <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Vous n'avez pas encore noté de films.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  deleteButton: {
    backgroundColor: '#E50914',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  }
});

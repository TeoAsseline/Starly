import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useCallback, useContext } from 'react';
import { showMessage } from 'react-native-flash-message';
import { useFocusEffect } from '@react-navigation/native';
import FilmCard from '../components/FilmCard';
import { getFilmsByUser, deleteFilm, getStats } from '../database/db';
import { AuthContext } from '../App';

// Composant pour afficher les statistiques
const StatsDashboard = ({ stats }) => (
  <View style={statsStyles.statsContainer}>
    <View style={statsStyles.statBox}>
      <Text style={statsStyles.statNumber}>{stats.totalFilms}</Text>
      <Text style={statsStyles.statLabel}>Films vus</Text>
    </View>
    <View style={statsStyles.statBox}>
      <Text style={statsStyles.statNumber}>{stats.moyenneNotes}</Text>
      <Text style={statsStyles.statLabel}>Note moyenne</Text>
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
    color: '#FFD700',
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
  const [searchText, setSearchText] = useState('');
  const [filterNote, setFilterNote] = useState(null);

  const loadFilmsAndStats = useCallback(async () => {
    if (!user) return;
    try {
      const [userFilms, userStats] = await Promise.all([
        getFilmsByUser(user.id),
        getStats(user.id),
      ]);
      setFilms(userFilms);
      setStats(userStats);
    } catch (error) {
      console.error('Erreur lors du chargement des films/stats:', error);
      showMessage({
        message: 'Erreur de chargement',
        description: 'Impossible de charger vos films et statistiques.',
        type: 'danger',
      });
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

  // Logique de filtrage
  const filteredFilms = films.filter((film) => {
    const matchesSearch =
      searchText === '' ||
      film.titre.toLowerCase().includes(searchText.toLowerCase()) ||
      (film.annee && film.annee.includes(searchText)) ||
      (film.commentaire &&
        film.commentaire.toLowerCase().includes(searchText.toLowerCase()));

    const matchesNote = filterNote === null || film.note === filterNote;

    return matchesSearch && matchesNote;
  });

  const performDelete = async (idFilm) => {
    try {
      await deleteFilm(idFilm);
      showMessage({
        message: 'Suppression réussie',
        description: 'La note a été retirée de votre liste.',
        type: 'success',
      });
      loadFilmsAndStats();
    } catch (error) {
      console.error('Erreur de suppression:', error);
      showMessage({
        message: 'Erreur de suppression',
        description: 'Impossible de supprimer la note.',
        type: 'danger',
      });
    }
  };

  const handleDelete = (idFilm) => {
    showMessage({
      message: 'Confirmation de suppression',
      description:
        'Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.',
      type: 'warning',
      icon: 'warning',
      autoHide: false,
      duration: 5000,
      renderFlashMessageIcon: () => (
        <TouchableOpacity
          style={styles.confirmDeleteButton}
          onPress={() => performDelete(idFilm)}
        >
          <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      ),
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFilmsAndStats();
  };

  const renderNoteFilters = () => {
    const notes = [null, 2, 4, 6, 8, 10];
    return (
      <View style={styles.noteFilterContainer}>
        {notes.map((note) => (
          <TouchableOpacity
            key={note === null ? 'all' : note.toString()}
            style={[
              styles.noteFilterButton,
              filterNote === note ? styles.activeNoteFilterButton : {},
            ]}
            onPress={() => setFilterNote(note)}
          >
            <Text
              style={[
                styles.noteFilterText,
                filterNote === note ? styles.activeNoteFilterText : {},
              ]}
            >
              {note === null ? 'Tout' : `${note / 2} ⭐`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
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
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher par titre, année ou commentaire..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={setSearchText}
      />
      {renderNoteFilters()}

      <FlatList
        data={filteredFilms}
        keyExtractor={(item) => item.idFilm.toString()}
        renderItem={({ item }) => (
          <View style={styles.filmCardWrapper}>
            {/* Bouton supprimer */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.idFilm)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>

            {/* Carte du film */}
            <FilmCard
              film={{
                Poster: item.poster,
                title: item.titre,
                Year: item.annee,
              }}
              userNote={item.note}
              onPress={() =>
                navigation.navigate('Detail', {
                  film: {
                    imdbID: item.imdbID,
                    Title: item.titre,
                    Year: item.annee,
                    Poster: item.poster,
                    user_note: item.note,
                    user_comment: item.commentaire,
                  },
                })
              }
            />

            {/* Commentaire */}
            {item.commentaire ? (
              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel}>Commentaire :</Text>
                <Text style={styles.commentText}>{item.commentaire}</Text>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {films.length === 0
              ? "Vous n'avez pas encore noté de films."
              : 'Aucun film ne correspond à votre recherche ou votre filtre.'}
          </Text>
        }
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
  searchInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  noteFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  noteFilterButton: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  activeNoteFilterButton: {
    backgroundColor: '#E50914',
  },
  noteFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filmCardWrapper: {
    position: 'relative',
    marginBottom: 15,
    marginHorizontal: 10,
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E50914',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 18,
  },
  commentContainer: {
    marginTop: 8,
    backgroundColor: '#222',
    borderRadius: 6,
    padding: 8,
  },
  commentLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: '#ddd',
    fontSize: 14,
  },
  confirmDeleteButton: {
    backgroundColor: '#990000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 15,
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState, useCallback, useContext } from 'react';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FilmCard from '../components/FilmCard';
import { getFilmsByUser, deleteFilm, getStats } from '../database/db';
import { AuthContext } from '../App';

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
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, backgroundColor: '#222', borderBottomWidth: 1, borderBottomColor: '#333' },
  statBox: { alignItems: 'center', paddingHorizontal: 20 },
  statNumber: { color: '#FFD700', fontSize: 32, fontWeight: 'bold' },
  statLabel: { color: '#ccc', fontSize: 14, marginTop: 5 },
});

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [films, setFilms] = useState([]);
  const [stats, setStats] = useState({ totalFilms: 0, moyenneNotes: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterNote, setFilterNote] = useState(null);
  const [sortBy, setSortBy] = useState('none');
  const [sortDirection, setSortDirection] = useState('desc');

  const loadFilmsAndStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [userFilms, userStats] = await Promise.all([
        getFilmsByUser(user.id),
        getStats(user.id),
      ]);
      setFilms(userFilms);
      setStats(userStats);
    } catch (error) {
      console.error('Erreur lors du chargement des films/stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadFilmsAndStats();
      return () => { hideMessage(); };
    }, [loadFilmsAndStats])
  );

  const processedFilms = films
    .filter((film) => {
      const matchesSearch =
        searchText === '' ||
        film.titre.toLowerCase().includes(searchText.toLowerCase()) ||
        (film.annee && film.annee.includes(searchText)) ||
        (film.commentaire && film.commentaire.toLowerCase().includes(searchText.toLowerCase()));
      const matchesNote = filterNote === null || film.note === filterNote;
      return matchesSearch && matchesNote;
    })
    .sort((a, b) => {
      if (sortBy === 'none') return 0;
      let valA, valB;
      if (sortBy === 'titre') {
        valA = a.titre.toLowerCase();
        valB = b.titre.toLowerCase();
      } else if (sortBy === 'annee') {
        valA = parseInt(a.annee, 10) || 0;
        valB = parseInt(b.annee, 10) || 0;
      } else if (sortBy === 'note') {
        valA = a.note || 0;
        valB = b.note || 0;
      }
      if (typeof valA === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const performDelete = async (idFilm) => {
    try {
      await deleteFilm(idFilm);
      showMessage({ message: 'Suppression réussie', type: 'success' });
      loadFilmsAndStats();
    } catch (error) {
      showMessage({ message: 'Erreur de suppression', type: 'danger' });
    }
  };

  const handleDelete = (idFilm) => {
    showMessage({
      message: 'Confirmation de suppression',
      description: 'Êtes-vous sûr de vouloir supprimer cette note ?',
      type: 'warning',
      duration: 5000,
      hideOnPress: false,
      renderFlashMessageIcon: () => (
        <View style={styles.popupButtonsContainer}>
          <TouchableOpacity style={[styles.popupButton, styles.cancelButton]} onPress={() => hideMessage()}>
            <Text style={styles.popupButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.popupButton, styles.confirmDeleteButton]} onPress={() => { hideMessage(); performDelete(idFilm); }}>
            <Text style={styles.popupButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const handleLogout = () => setUser(null);
  const onRefresh = () => { setRefreshing(true); loadFilmsAndStats(); };

  const renderNoteFilters = () => {
    const notes = [null, ...Array.from({ length: 21 }, (v, i) => i)];
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.noteFilterScrollView} contentContainerStyle={styles.noteFilterContainer}>
        {notes.map((note) => (
          <TouchableOpacity key={note === null ? 'all' : note.toString()} style={[styles.noteFilterButton, filterNote === note ? styles.activeNoteFilterButton : {}]} onPress={() => setFilterNote(note)}>
            <Text style={[styles.noteFilterText, filterNote === note ? styles.activeNoteFilterText : {}]}>
              {note === null ? 'Tout' : `${note / 2} ⭐`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const renderSortControls = () => {
    const sortOptions = [{ key: 'titre', label: 'Titre' }, { key: 'annee', label: 'Année' }, { key: 'note', label: 'Note' }];
    return (
      <View style={styles.sortControlsContainer}>
        <Text style={styles.sortLabel}>Trier par:</Text>
        {sortOptions.map((option) => (
          <TouchableOpacity key={option.key} style={[styles.sortButton, sortBy === option.key ? styles.activeSortButton : {}]} onPress={() => {
            if (sortBy === option.key) {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(option.key);
              setSortDirection(option.key === 'titre' ? 'asc' : 'desc');
            }
          }}>
            <Text style={[styles.sortButtonText, sortBy === option.key ? styles.activeSortButtonText : {}]}>{option.label}</Text>
            {sortBy === option.key && (<Ionicons name={sortDirection === 'asc' ? 'arrow-up-sharp' : 'arrow-down-sharp'} size={14} color={styles.activeSortButtonText.color} style={styles.sortIcon}/>)}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#E50914" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenue, {user?.nom} !</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Déconnexion</Text></TouchableOpacity>
      </View>
      <StatsDashboard stats={stats} />
      
      {/* BOUTON POUR NAVIGUER VERS LA WATCHLIST */}
      <TouchableOpacity style={styles.watchListNavButton} onPress={() => navigation.navigate('Watchlist')}>
        <Ionicons name="eye-outline" size={20} color="#fff" />
        <Text style={styles.watchListNavButtonText}>Voir les films à voir</Text>
      </TouchableOpacity>

      <TextInput style={styles.searchInput} placeholder="Rechercher par titre, année ou commentaire..." placeholderTextColor="#888" value={searchText} onChangeText={setSearchText}/>
      {renderNoteFilters()}
      {renderSortControls()}
      <FlatList
        data={processedFilms}
        keyExtractor={(item) => item.idFilm.toString()}
        renderItem={({ item }) => (
          <View style={styles.filmCardWrapper}>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.idFilm)}><Text style={styles.deleteButtonText}>×</Text></TouchableOpacity>
            <FilmCard film={{ Poster: item.poster, title: item.titre, Year: item.annee }} userNote={item.note} onPress={() => navigation.navigate('Detail', { film: { imdbID: item.imdbID, Title: item.titre, Year: item.annee, Poster: item.poster, user_note: item.note, user_comment: item.commentaire }})}/>
            {item.commentaire ? (<View style={styles.commentContainer}><Text style={styles.commentLabel}>Commentaire :</Text><Text style={styles.commentText}>{item.commentaire}</Text></View>) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>{films.length === 0 ? "Vous n'avez pas encore noté de films." : 'Aucun film ne correspond à votre recherche.'}</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  welcomeText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { padding: 8, borderRadius: 5 },
  logoutText: { color: '#E50914', fontSize: 16, fontWeight: 'bold' },
  watchListNavButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', paddingVertical: 12, marginHorizontal: 10, marginTop: 15, borderRadius: 8 },
  watchListNavButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  searchInput: { backgroundColor: '#333', color: '#fff', padding: 10, marginHorizontal: 10, marginTop: 10, borderRadius: 8, fontSize: 16 },
  sortControlsContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginTop: 10, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 8 },
  sortLabel: { color: '#ccc', fontSize: 14, marginRight: 10, fontWeight: 'bold' },
  sortButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15, backgroundColor: '#333', marginRight: 8 },
  activeSortButton: { backgroundColor: '#E50914' },
  sortButtonText: { color: '#fff', fontSize: 14 },
  activeSortButtonText: { color: '#fff', fontWeight: 'bold' },
  sortIcon: { marginLeft: 4 },
  noteFilterScrollView: { paddingVertical: 10, maxHeight: 60 },
  noteFilterContainer: { flexDirection: 'row', paddingHorizontal: 10, alignItems: 'center' },
  noteFilterButton: { backgroundColor: '#333', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginRight: 8 },
  activeNoteFilterButton: { backgroundColor: '#FFD700' },
  noteFilterText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  activeNoteFilterText: { color: '#141414', fontWeight: 'bold' },
  filmCardWrapper: { position: 'relative', marginBottom: 15, marginHorizontal: 10, backgroundColor: '#1c1c1c', borderRadius: 10, padding: 10 },
  deleteButton: { position: 'absolute', top: 10, right: 10, backgroundColor: '#E50914', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, lineHeight: 18 },
  commentContainer: { marginTop: 8, backgroundColor: '#222', borderRadius: 6, padding: 8 },
  commentLabel: { color: '#FFD700', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  commentText: { color: '#ddd', fontSize: 14 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 50 },
  popupButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingHorizontal: 10, width: '60%' },
  popupButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, marginHorizontal: 5 },
  confirmDeleteButton: { backgroundColor: '#990000' },
  cancelButton: { backgroundColor: '#555' },
  popupButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
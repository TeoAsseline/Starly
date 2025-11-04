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
  Modal 
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

const FilterModal = ({ isVisible, onClose, options, currentValue, setValue, title }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
  >
    <TouchableOpacity 
      style={styles.modalOverlay} 
      activeOpacity={1} 
      onPress={onClose} 
    >
      <View style={styles.modalContentWrapper}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.modalOptionsScrollView}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value === null ? 'null' : option.value.toString()}
                style={[
                  styles.modalOptionButton,
                  currentValue === option.value ? styles.activeSelectOptionButton : {},
                ]}
                onPress={() => {
                  setValue(option.value);
                  onClose(); 
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  currentValue === option.value ? styles.activeSelectOptionText : {},
                ]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
);

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);
  const [films, setFilms] = useState([]);
  const [stats, setStats] = useState({ totalFilms: 0, moyenneNotes: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [noteValueFilter, setNoteValueFilter] = useState(null); 
  const [noteOperator, setNoteOperator] = useState('>='); 
  
  const [sortBy, setSortBy] = useState('none'); 
  const [sortDirection, setSortDirection] = useState('desc'); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalOptions, setModalOptions] = useState([]);
  const [modalCurrentValue, setModalCurrentValue] = useState(null);
  const [modalSetValue, setModalSetValue] = useState(() => () => {}); // Fonction de mise à jour du state (note ou opérateur)
  const [modalTitle, setModalTitle] = useState('');

  const openModal = (options, currentValue, setValue, title) => {
    setModalOptions(options);
    setModalCurrentValue(currentValue);
    setModalSetValue(() => setValue); 
    setModalTitle(title);
    setIsModalVisible(true);
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
  };

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
        (film.commentaire &&
          film.commentaire.toLowerCase().includes(searchText.toLowerCase()));

      let matchesNote = true;
      if (noteValueFilter !== null) {
        const filmNote = Number(film.note); 
        const filterValue = Number(noteValueFilter);

        if (noteOperator === '===') {
          matchesNote = filmNote === filterValue;
        } else if (noteOperator === '>=') {
          matchesNote = filmNote >= filterValue;
        } else if (noteOperator === '<=') {
          matchesNote = filmNote <= filterValue;
        }
      }

      return matchesSearch && matchesNote;
    })
    .sort((a, b) => {
      if (sortBy === 'none') {
        return 0;
      }

      let valA, valB;
      if (sortBy === 'titre') {
        valA = a.titre.toLowerCase();
        valB = b.titre.toLowerCase();
      } else if (sortBy === 'annee') {
        valA = parseInt(a.annee, 10) || (sortDirection === 'asc' ? Infinity : -Infinity);
        valB = parseInt(b.annee, 10) || (sortDirection === 'asc' ? Infinity : -Infinity);
      } else if (sortBy === 'note') {
        valA = a.note || (sortDirection === 'asc' ? 11 : -1); 
        valB = b.note || (sortDirection === 'asc' ? 11 : -1);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? (valA - valB) : (valB - valA);
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
          <TouchableOpacity
            style={[styles.popupButton, styles.cancelButton]}
            onPress={() => hideMessage()} 
          >
            <Text style={styles.popupButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.popupButton, styles.confirmDeleteButton]}
            onPress={() => {
              hideMessage(); 
              performDelete(idFilm); 
            }}
          >
            <Text style={styles.popupButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const handleLogout = () => setUser(null);
  const onRefresh = () => { setRefreshing(true); loadFilmsAndStats(); };

  const renderNoteFilterControls = () => {
    
    const noteOptions = [
      { value: null, label: 'Tout' },
      ...Array.from({ length: 11 }, (v, i) => ({
        value: i,
        label: i === 0 ? '0' : `${i / 2} ★`, 
      })),
    ];

    const operatorOptions = [
      { value: '>=', label: '≥ (et plus)' },
      { value: '===', label: '= (exactement)' },
      { value: '<=', label: '≤ (et moins)' },
    ];
    
    const renderSelectButton = (options, currentValue, setValue, defaultLabel, title) => {
      const currentOption = options.find(opt => opt.value === currentValue);
      const displayLabel = currentOption ? currentOption.label : defaultLabel;

      return (
        <TouchableOpacity 
          style={styles.selectBox} 
          onPress={() => openModal(options, currentValue, setValue, title)}
        >
          <Text style={styles.selectBoxText}>
            {displayLabel}
          </Text>
          <Ionicons name="caret-down" size={16} color="#ccc" style={{marginLeft: 5}}/>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.noteFilterControlsContainer}>
        <Text style={styles.filterLabel}>Filtrer par note:</Text>
        
        <View style={styles.noteSelectorsWrapper}>
          {/* Sélecteur d'opérateur */}
          {renderSelectButton(operatorOptions, noteOperator, setNoteOperator, '≥ (et plus)', "Sélectionnez l'opérateur")}
        
          {/* Sélecteur de note */}
          {renderSelectButton(noteOptions, noteValueFilter, setNoteValueFilter, 'Tout', "Sélectionnez la note")}
        </View>
      </View>
    );
  };
  
  const renderSortControls = () => {
    const sortOptions = [{ key: 'titre', label: 'Titre' }, { key: 'annee', label: 'Année' }, { key: 'note', label: 'Note' }];
    return (
      <View style={styles.sortControlsContainer}>
        <Text style={styles.sortLabel}>Trier par:</Text>
        <View style={styles.sortButtonsWrapper}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortButton,
                sortBy === option.key ? styles.activeSortButton : {},
              ]}
              onPress={() => {
                if (sortBy === option.key) {
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(option.key);
                  setSortDirection(option.key === 'titre' ? 'asc' : 'desc'); 
                }
              }}
            >
              <Text style={[
                styles.sortButtonText,
                sortBy === option.key ? styles.activeSortButtonText : {},
              ]}>
                {option.label}
              </Text>
              {sortBy === option.key && (
                <Ionicons 
                  name={sortDirection === 'asc' ? 'arrow-up-sharp' : 'arrow-down-sharp'} 
                  size={14} 
                  color={styles.activeSortButtonText.color} 
                  style={styles.sortIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#E50914" /></View>;
  }

  return (
    <View style={styles.container}>
      <FilterModal
        isVisible={isModalVisible}
        onClose={closeModal}
        options={modalOptions}
        currentValue={modalCurrentValue}
        setValue={modalSetValue}
        title={modalTitle}
      />
      
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenue, {user?.nom} !</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Déconnexion</Text></TouchableOpacity>
      </View>
      <StatsDashboard stats={stats} />
      
      {renderNoteFilterControls()} 
      {renderSortControls()}
      <FlatList
        data={processedFilms} 
        keyExtractor={(item) => item.idFilm.toString()}
        renderItem={({ item }) => (
          <View style={styles.filmCardWrapper}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.idFilm)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>

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

            {item.commentaire ? (
              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel}>Commentaire :</Text>
                <Text style={styles.commentText}>{item.commentaire}</Text>
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>{films.length === 0 ? "Vous n'avez pas encore noté de films." : 'Aucun film ne correspond à votre recherche.'}</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
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
  
  noteFilterControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10, 
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  noteSelectorsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    flexShrink: 1, 
  },
  filterLabel: {
    color: '#ccc',
    fontSize: 14,
    marginRight: 10,
    fontWeight: 'bold',
    flexShrink: 0, 
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 80, 
    justifyContent: 'space-between',
  },
  selectBoxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContentWrapper: {
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  modalOptionsScrollView: {
    maxHeight: 250, 
  },
  modalOptionButton: {
    paddingVertical: 10, 
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 2,
    alignItems: 'center',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  activeSelectOptionButton: {
    backgroundColor: '#E50914', 
  },
  activeSelectOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  sortControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 5, 
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
    paddingTop: 8, 
  },
  sortButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  sortLabel: {
    color: '#ccc',
    fontSize: 14,
    marginRight: 10,
    fontWeight: 'bold',
    flexShrink: 0,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#333',
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: '#E50914',
  },
  sortButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  activeSortButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sortIcon: {
    marginLeft: 4,
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
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  popupButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteButton: {
    backgroundColor: '#990000',
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  popupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
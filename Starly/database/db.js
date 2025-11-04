import * as SQLite from 'expo-sqlite';

let db = null;

/**
 * Initialise la base SQLite et crée les tables User & Film
 */
export async function initDatabase() {
  if (db) return db; // Retourne l'instance existante si déjà ouverte

  try {
    // Ouvre ou crée la base
    db = await SQLite.openDatabaseAsync('films.db');

    // Crée la table User
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        login TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Crée la table Film
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Film (
        idFilm INTEGER PRIMARY KEY AUTOINCREMENT,
        idUser INTEGER NOT NULL,
        imdbID TEXT NOT NULL, 
        titre TEXT NOT NULL,
        note INTEGER,
        commentaire TEXT,
        dateVisionnage TEXT,
        poster TEXT,
        annee TEXT,
        FOREIGN KEY (idUser) REFERENCES User(id),
        -- AJOUT : Clé composite UNIQUE pour (idUser, imdbID)
        UNIQUE(idUser, imdbID) 
      );
    `);

    console.log('✅ Tables créées ou déjà existantes');
    return db;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error);
    throw error;
  }
}

// --- Fonctions Utilisateur (User) ---

/**
 * Enregistre un nouvel utilisateur.
 * @param {string} nom
 * @param {string} login
 * @param {string} password
 * @returns {Promise<number>} L'ID du nouvel utilisateur.
 */
export async function registerUser(nom, login, password) {
  await initDatabase();
  const result = await db.runAsync(
    'INSERT INTO User (nom, login, password) VALUES (?, ?, ?)',
    [nom, login, password]
  );
  return result.lastInsertRowId;
}

/**
 * Tente de connecter un utilisateur.
 * @param {string} login
 * @param {string} password
 * @returns {Promise<object|null>} L'objet utilisateur ou null si non trouvé.
 */
export async function loginUser(login, password) {
  await initDatabase();
  const user = await db.getFirstAsync(
    'SELECT * FROM User WHERE login = ? AND password = ?',
    [login, password]
  );
  return user;
}

// --- Fonctions Film (Film) ---

/**
 * Ajoute ou met à jour un film noté par l'utilisateur.
 * @param {number} idUser
 * @param {object} filmData - Contient imdbID, titre, note, commentaire, poster, annee.
 * @returns {Promise<void>}
 */
export async function saveFilm(idUser, filmData) {
  await initDatabase();
  
  // Vérifie si le film existe déjà pour cet utilisateur
  const existingFilm = await db.getFirstAsync(
    'SELECT idFilm FROM Film WHERE idUser = ? AND imdbID = ?',
    [idUser, filmData.imdbID]
  );

  if (existingFilm) {
    // Mise à jour
    await db.runAsync(
      `UPDATE Film 
       SET note = ?, commentaire = ?, dateVisionnage = ?, titre = ?, poster = ?, annee = ?
       WHERE idFilm = ?`,
      [
        filmData.note, 
        filmData.commentaire, 
        new Date().toISOString(), // Met à jour la date de visionnage
        filmData.titre,
        filmData.poster,
        filmData.annee,
        existingFilm.idFilm
      ]
    );
    console.log(`Film mis à jour: ${filmData.titre}`);
    return "UPDATE";
  } else {
    // Ajout
    await db.runAsync(
      `INSERT INTO Film (idUser, imdbID, titre, note, commentaire, dateVisionnage, poster, annee) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idUser, 
        filmData.imdbID, 
        filmData.titre, 
        filmData.note, 
        filmData.commentaire, 
        new Date().toISOString(), 
        filmData.poster,
        filmData.annee
      ]
    );
    console.log(`Nouveau film ajouté: ${filmData.titre}`);
    return "INSERT";
  }
}

/**
 * Récupère tous les films notés par un utilisateur.
 * @param {number} idUser
 * @returns {Promise<Array<object>>} Liste des films.
 */
export async function getFilmsByUser(idUser) {
  await initDatabase();
  const films = await db.getAllAsync(
    'SELECT * FROM Film WHERE idUser = ? ORDER BY dateVisionnage DESC',
    [idUser]
  );
  return films;
}

/**
 * Supprime un film noté.
 * @param {number} idFilm
 * @returns {Promise<void>}
 */
export async function deleteFilm(idFilm) {
  await initDatabase();
  await db.runAsync('DELETE FROM Film WHERE idFilm = ?', [idFilm]);
  console.log(`Film avec id ${idFilm} supprimé.`);
}

/**
 * Récupère les statistiques de l'utilisateur.
 * @param {number} idUser
 * @returns {Promise<object>} Statistiques (totalFilms, moyenneNotes).
 */
export async function getStats(idUser) {
  await initDatabase();
  const stats = await db.getFirstAsync(
    `SELECT COUNT(idFilm) as totalFilms, AVG(note) as moyenneNotes 
     FROM Film 
     WHERE idUser = ?`,
    [idUser]
  );
  
  return {
    totalFilms: stats.totalFilms || 0,
    moyenneNotes: stats.moyenneNotes ? parseFloat(stats.moyenneNotes).toFixed(2) : 0,
  };
}

/**
 * Récupère la note et le commentaire d'un film spécifique pour un utilisateur.
 * @param {number} idUser
 * @param {string} imdbID
 * @returns {Promise<object|null>} Le film noté ou null.
 */
export async function getFilmNote(idUser, imdbID) {
    await initDatabase();
    const film = await db.getFirstAsync(
        'SELECT note, commentaire, idFilm FROM Film WHERE idUser = ? AND imdbID = ?',
        [idUser, imdbID]
    );
    return film;
}

import * as SQLite from 'expo-sqlite';

let db = null;

export async function initDatabase() {
  if (db) return db;

  try {
    db = await SQLite.openDatabaseAsync('films.db');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        login TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

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
        a_regarder INTEGER DEFAULT 0,
        FOREIGN KEY (idUser) REFERENCES User(id),
        UNIQUE(idUser, imdbID) 
      );
    `);

    const columns = await db.getAllAsync(`PRAGMA table_info(Film)`);
    if (!columns.some(col => col.name === 'a_regarder')) {
      console.log('Mise à jour du schéma: Ajout de la colonne "a_regarder"');
      await db.execAsync('ALTER TABLE Film ADD COLUMN a_regarder INTEGER DEFAULT 0');
    }

    console.log('✅ Tables créées ou déjà existantes');
    return db;
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error);
    throw error;
  }
}

// --- Fonctions Utilisateur (User) ---

export async function registerUser(nom, login, password) {
  await initDatabase();
  const result = await db.runAsync(
    'INSERT INTO User (nom, login, password) VALUES (?, ?, ?)',
    [nom, login, password]
  );
  return result.lastInsertRowId;
}

export async function loginUser(login, password) {
  await initDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM User WHERE login = ? AND password = ?',
    [login, password]
  );
}

// --- Fonctions Film (Film) ---

export async function saveFilm(idUser, filmData) {
  await initDatabase();

  const existingFilm = await db.getFirstAsync(
    'SELECT idFilm FROM Film WHERE idUser = ? AND imdbID = ?',
    [idUser, filmData.imdbID]
  );

  // Si le film est marqué "à voir", on remet à zéro les champs
  const isARegarder = !!filmData.a_regarder;
  const noteToSave = isARegarder ? null : filmData.note ?? null;
  const commentaireToSave = isARegarder ? '' : filmData.commentaire ?? '';
  const dateVisionnageToSave = isARegarder ? null : new Date().toISOString();

  console.log('💾 [DEBUG] Sauvegarde film:', {
    idUser,
    titre: filmData.titre,
    imdbID: filmData.imdbID,
    isARegarder,
    noteToSave,
    commentaireToSave,
    dateVisionnageToSave,
  });

  if (existingFilm) {
    await db.runAsync(
      `UPDATE Film 
       SET 
         note = ?, 
         commentaire = ?, 
         dateVisionnage = ?, 
         titre = ?, 
         poster = ?, 
         annee = ?, 
         a_regarder = ?
       WHERE idFilm = ?`,
      [
        noteToSave,
        commentaireToSave,
        dateVisionnageToSave,
        filmData.titre,
        filmData.poster,
        filmData.annee,
        isARegarder ? 1 : 0,
        existingFilm.idFilm,
      ]
    );
    console.log('✅ [DEBUG] Film mis à jour avec succès');
    return "UPDATE";
  } else {
    await db.runAsync(
      `INSERT INTO Film 
        (idUser, imdbID, titre, note, commentaire, dateVisionnage, poster, annee, a_regarder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idUser,
        filmData.imdbID,
        filmData.titre,
        noteToSave,
        commentaireToSave,
        dateVisionnageToSave,
        filmData.poster,
        filmData.annee,
        isARegarder ? 1 : 0,
      ]
    );
    console.log('✅ [DEBUG] Nouveau film inséré');
    return "INSERT";
  }
}


// Ne retourne que les films VUS et notés
export async function getFilmsByUser(idUser) {
  await initDatabase();
  return await db.getAllAsync(
    'SELECT * FROM Film WHERE idUser = ? AND (a_regarder = 0 OR a_regarder IS NULL) ORDER BY dateVisionnage DESC',
    [idUser]
  );
}

// NOUVEAU : Retourne uniquement les films "À Regarder"
export async function getFilmsARegarderByUser(idUser) {
    await initDatabase();
    return await db.getAllAsync(
      'SELECT * FROM Film WHERE idUser = ? AND a_regarder = 1 ORDER BY dateVisionnage DESC',
      [idUser]
    );
}

export async function deleteFilm(idFilm) {
  await initDatabase();
  await db.runAsync('DELETE FROM Film WHERE idFilm = ?', [idFilm]);
}

// Corrigé pour ne calculer les stats que sur les films vus
export async function getStats(idUser) {
  await initDatabase();
  const stats = await db.getFirstAsync(
    `SELECT COUNT(idFilm) as totalFilms, AVG(note) as moyenneNotes 
     FROM Film 
     WHERE idUser = ? AND (a_regarder = 0 OR a_regarder IS NULL) AND note IS NOT NULL`,
    [idUser]
  );
  
  return {
    totalFilms: stats.totalFilms || 0,
    // La moyenne est calculée sur 10, le toFixed(2) la formate
    moyenneNotes: stats.moyenneNotes ? parseFloat(stats.moyenneNotes).toFixed(2) : 0,
  };
}

export async function getFilmNote(idUser, imdbID) {
    await initDatabase();
    return await db.getFirstAsync(
        'SELECT note, commentaire, idFilm, a_regarder FROM Film WHERE idUser = ? AND imdbID = ?',
        [idUser, imdbID]
    );
}
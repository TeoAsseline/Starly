import * as SQLite from 'expo-sqlite';

/**
 * Initialise la base SQLite et crée les tables User & Film
 */
export async function initDatabase() {
  // ouvre ou crée la base
  const db = await SQLite.openDatabaseAsync('films.db');

  // crée la table User
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  // crée la table Film
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Film (
      idFilm INTEGER PRIMARY KEY AUTOINCREMENT,
      idUser INTEGER NOT NULL,
      titre TEXT NOT NULL,
      note INTEGER,
      commentaire TEXT,
      datePublication TEXT,
      genre TEXT,
      poster TEXT,
      realisateur TEXT,
      FOREIGN KEY (idUser) REFERENCES User(id)
    );
  `);

  console.log('✅ Tables créées ou déjà existantes');
  return db;
}

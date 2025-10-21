import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { initDatabase, addFilm, getFilms } from './database/db';

export default function App() {
  useEffect(() => {
    (async () => {
      const db = await initDatabase();
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>SQLite initialisé !</Text>
    </View>
  );
}

// components/FilmCard.js
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

// Ce composant reçoit les données d'un film et une fonction onPress
export default function FilmCard({ film, onPress }) {
  // Variable pour l'URL de l'affiche (avec une image par défaut si non disponible)
  const posterUrl = film.poster_path 
    ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
    : 'https://via.placeholder.com/150/141414/FFFFFF/?text=Pas+d\'affiche';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: posterUrl }} style={styles.poster} />
      <View style={styles.info}>
        <Text style={styles.title}>{film.title}</Text>
        <Text style={styles.year}>{new Date(film.release_date).getFullYear()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    overflow: 'hidden', // Pour que l'image respecte les coins arrondis
  },
  poster: {
    width: 100,
    height: 150,
  },
  info: {
    padding: 15,
    flex: 1, // Permet au texte de prendre l'espace restant
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  year: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
});
// components/FilmCard.js
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ce composant reçoit les données d'un film et une fonction onPress
export default function FilmCard({ film, onPress, userNote }) {
  const posterUrl = film.poster_path 
    ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
    : 'https://via.placeholder.com/150/141414/FFFFFF/?text=Pas+d\'affiche';

return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: posterUrl }} style={styles.poster} />
      <View style={styles.info}>
        <Text style={styles.title}>{film.title}</Text>
        <Text style={styles.year}>{new Date(film.release_date).getFullYear()}</Text>
        {/* On affiche la note si elle est fournie */}
        {userNote && (
          <View style={styles.noteContainer}>
            <Ionicons name="star" color="#FFD700" size={16} />
            <Text style={styles.noteText}>{userNote} / 5</Text>
          </View>
        )}
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
   noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  noteText: {
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: 'bold',
  }
});
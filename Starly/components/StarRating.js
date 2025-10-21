import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StarRating({ rating, onRatingChange }) {
  
  // Gère le clic sur une étoile. Si on clique sur la même étoile, on alterne entre demi et pleine.
  const handlePress = (starIndex) => {
    const newRating = rating === starIndex ? starIndex - 0.5 : starIndex;
    onRatingChange(newRating);
  };

  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        let iconName = 'star-outline';
        // Si la note est supérieure ou égale à l'index de l'étoile (ex: note 3.5, étoile 3), elle est pleine
        if (rating >= starIndex) {
          iconName = 'star';
        // Sinon, si la note est à une demi-valeur (ex: note 3.5, étoile 4), elle est à moitié pleine
        } else if (rating >= starIndex - 0.5) {
          iconName = 'star-half-sharp';
        }

        return (
          <TouchableOpacity key={starIndex} onPress={() => handlePress(starIndex)}>
            <Ionicons name={iconName} size={40} color="#FFD700" />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
  },
});
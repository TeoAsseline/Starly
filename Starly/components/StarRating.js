import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Composant de sélection de note (1 à 5 étoiles entières).
 * @param {number} rating - La note actuelle (1-5).
 * @param {function} onRatingChange - Fonction appelée lorsque la note change.
 */
export default function StarRating({ rating, onRatingChange }) {
  const maxRating = 5;
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => onRatingChange(i)}
        style={styles.starButton}
      >
        <Ionicons 
          name={i <= rating ? 'star' : 'star-outline'} 
          size={32} 
          color="#FFD700" 
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.starContainer}>
      {stars}
    </View>
  );
}

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    paddingHorizontal: 5,
  }
});

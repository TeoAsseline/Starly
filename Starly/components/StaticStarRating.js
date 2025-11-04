import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Composant d'affichage de note avec demi-étoiles (lecture seule).
 * @param {number} rating - La note actuelle (valeur de 0 à 10).
 * @param {number} size - La taille des icônes (optionnel, par défaut à 16).
 */
export default function StaticStarRating({ rating, size = 16 }) {
  const maxRating = 5;
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    // Conversion de la note sur 10 en note sur 5 pour l'affichage
    const displayRating = rating / 2; 
    let iconName = 'star-outline';

    if (displayRating >= i) {
      iconName = 'star'; // Étoile pleine
    } else if (displayRating >= i - 0.5) {
      iconName = 'star-half'; // Demi-étoile
    }

    stars.push(
      <Ionicons 
        key={i}
        name={iconName} 
        size={size} 
        color="#FFD700" 
        style={styles.starIcon}
      />
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
  },
  starIcon: {
    marginRight: 2, // Petit espacement entre les étoiles
  }
});
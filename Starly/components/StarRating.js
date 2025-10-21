import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Composant de sélection de note avec demi-étoiles.
 * La note est gérée sur une échelle de 0 à 10.
 * @param {number} rating - La note actuelle (valeur de 0 à 10).
 * @param {function} onRatingChange - Fonction appelée lorsque la note change (renvoie une valeur de 0 à 10).
 */
export default function StarRating({ rating, onRatingChange }) {
  const maxRating = 5;
  const stars = [];

  // La fonction qui sera appelée lors du clic sur une étoile
  const handlePress = (starIndex) => {
    // La valeur "pleine" de l'étoile cliquée, sur une échelle de 10.
    // Ex: cliquer sur la 3ème étoile correspond à une note de 6.
    const fullStarValue = starIndex * 2; 

    // Si l'utilisateur clique sur l'étoile qui est déjà sélectionnée en entier,
    // on passe à la demi-étoile inférieure. Sinon, on sélectionne l'étoile en entier.
    if (rating === fullStarValue) {
      onRatingChange(fullStarValue - 1); // Ex: passe de 6/10 à 5/10 (2.5 étoiles)
    } else {
      onRatingChange(fullStarValue); // Ex: sélectionne 6/10 (3 étoiles)
    }
  };

  for (let i = 1; i <= maxRating; i++) {
    // On convertit la note sur 10 en note sur 5 pour l'affichage
    const displayRating = rating / 2; 
    let iconName = 'star-outline';

    if (displayRating >= i) {
      // Si la note est supérieure ou égale à l'index de l'étoile, c'est une étoile pleine.
      // Ex: pour une note de 3.5 (7/10), les étoiles 1, 2 et 3 seront pleines.
      iconName = 'star';
    } else if (displayRating >= i - 0.5) {
      // Sinon, si la note est supérieure ou égale à l'index - 0.5, c'est une demi-étoile.
      // Ex: pour une note de 3.5, l'étoile 4 (index 4) sera une demi-étoile.
      iconName = 'star-half';
    }
    // Sinon, l'icône reste 'star-outline' (étoile vide).

    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => handlePress(i)}
        style={styles.starButton}
      >
        <Ionicons 
          name={iconName} 
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
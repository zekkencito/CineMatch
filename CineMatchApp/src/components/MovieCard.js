import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

const MovieCard = ({ movie, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(movie)}>
      <Image 
        source={{ uri: movie.poster_url || 'https://via.placeholder.com/200x300' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
        <Text style={styles.year}>{movie.release_year}</Text>
        {movie.genres && (
          <View style={styles.genresContainer}>
            {movie.genres.slice(0, 2).map((genre, index) => (
              <Text key={index} style={styles.genre}>
                {genre.name}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 14,
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: colors.border,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 5,
    lineHeight: 18,
  },
  year: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  genre: {
    fontSize: 10,
    color: colors.primary,
    backgroundColor: 'rgba(255,215,0,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '600',
    borderWidth: 0.5,
    borderColor: 'rgba(255,215,0,0.2)',
  },
});

export default MovieCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import colors from '../constants/colors';

const GenreSelector = ({ genres, selectedGenres, onToggle, title = 'Seleccionar Géneros' }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genresContainer}
      >
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);
          return (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.genreChip,
                isSelected && styles.genreChipSelected,
              ]}
              onPress={() => onToggle(genre.id)}
            >
              <Text
                style={[
                  styles.genreText,
                  isSelected && styles.genreTextSelected,
                ]}
              >
                {genre.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  genresContainer: {
    flexDirection: 'row',
    gap: 11,
    paddingRight: 22,
  },
  genreChip: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  genreChipSelected: {
    backgroundColor: 'rgba(255,215,0,0.25)',
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  genreTextSelected: {
    color: colors.text,
    fontWeight: '800',
  },
});

export default GenreSelector;

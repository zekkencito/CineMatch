import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const MovieCard = ({ movie, onPressInfo }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ 
          uri: movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Image' 
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.year}>{movie.release_year}</Text>
        </View>
        
        {movie.genres && movie.genres.length > 0 && (
          <View style={styles.genresContainer}>
            {movie.genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        )}

        {movie.directors && movie.directors.length > 0 && (
          <View style={styles.directorsContainer}>
            <Icon name="person-outline" size={16} color="#fff" />
            <Text style={styles.directorsText}>
              {movie.directors.map(d => d.name).join(', ')}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.infoButton}
          onPress={onPressInfo}
        >
          <Icon name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: height * 0.7,
    width: width * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  year: {
    fontSize: 18,
    color: '#ddd',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  genreTag: {
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  genreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  directorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  directorsText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  infoButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export default MovieCard;

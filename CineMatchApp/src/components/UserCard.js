import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const UserCard = ({ user }) => {
  const compatibilityScore = user.compatibility_score || 0;

  return (
    <View style={styles.card}>
      <Image
        source={{ 
          uri: user.profile_photo_url || 'https://via.placeholder.com/300?text=User' 
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{user.name}</Text>
              <View style={styles.compatibilityContainer}>
                <Icon name="heart" size={16} color="#E50914" />
                <Text style={styles.compatibility}>
                  {compatibilityScore}%CompatibilidadText>
                </View>
            </View>
          </View>

          <ScrollView style={styles.scrollContent}>
            {user.favorite_genres && user.favorite_genres.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Géneros Favoritos</Text>
                <View style={styles.tagsContainer}>
                  {user.favorite_genres.map((genre, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{genre.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {user.favorite_directors && user.favorite_directors.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Directores Favoritos</Text>
                <View style={styles.tagsContainer}>
                  {user.favorite_directors.map((director, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{director.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {user.favorite_movies && user.favorite_movies.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Películas Favoritas</Text>
                {user.favorite_movies.slice(0, 5).map((movie, index) => (
                  <Text key={index} style={styles.movieItem}>
                    • {movie.title} ({movie.release_year})
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  compatibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibility: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  scrollContent: {
    maxHeight: height * 0.35,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(229, 9, 20, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  movieItem: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
});

export default UserCard;

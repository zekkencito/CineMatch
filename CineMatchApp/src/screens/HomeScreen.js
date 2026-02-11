import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import Icon from 'react-native-vector-icons/Ionicons';
import MovieCard from '../components/MovieCard';
import UserCard from '../components/UserCard';
import { movieService } from '../services/movieService';
import { matchService } from '../services/matchService';

const HomeScreen = ({ navigation }) => {
  const [mode, setMode] = useState('movies'); // 'movies' o 'users'
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    loadCards();
  }, [mode]);

  const loadCards = async () => {
    setLoading(true);
    try {
      let data;
      if (mode === 'movies') {
        data = await movieService.getRecommendedMovies();
      } else {
        data = await matchService.getPotentialMatches();
      }
      setCards(data);
      setCardIndex(0);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las recomendaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = async (index) => {
    try {
      const card = cards[index];
      if (mode === 'movies') {
        await movieService.rateMovie(card.id, 5); // Rating alto = like
      } else {
        const result = await matchService.likeUser(card.id);
        if (result.matched) {
          Alert.alert(
            '¡Match! 🎬',
            `¡Tienes un nuevo match con ${card.name}!`,
            [{ text: 'Genial!', onPress: () => {} }]
          );
        }
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleSwipeLeft = async (index) => {
    try {
      const card = cards[index];
      if (mode === 'movies') {
        await movieService.rateMovie(card.id, 1); // Rating bajo = dislike
      } else {
        await matchService.passUser(card.id);
      }
    } catch (error) {
      console.error('Error al dar pass:', error);
    }
  };

  const handleSwipeAll = () => {
    Alert.alert(
      'Sin más recomendaciones',
      '¿Quieres recargar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Recargar', onPress: loadCards },
      ]
    );
  };

  const renderCard = (card) => {
    if (!card) return null;
    
    if (mode === 'movies') {
      return (
        <MovieCard 
          movie={card}
          onPressInfo={() => {
            // Navegar a detalles de la película
          }}
        />
      );
    } else {
      return <UserCard user={card} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>CineMatch</Text>
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'movies' && styles.modeButtonActive]}
            onPress={() => setMode('movies')}
          >
            <Icon name="film" size={20} color={mode === 'movies' ? '#fff' : '#666'} />
            <Text style={[styles.modeText, mode === 'movies' && styles.modeTextActive]}>
              Películas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'users' && styles.modeButtonActive]}
            onPress={() => setMode('users')}
          >
            <Icon name="people" size={20} color={mode === 'users' ? '#fff' : '#666'} />
            <Text style={[styles.modeText, mode === 'users' && styles.modeTextActive]}>
              Personas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Swiper */}
      <View style={styles.swiperContainer}>
        {cards.length > 0 ? (
          <Swiper
            ref={swiperRef}
            cards={cards}
            renderCard={renderCard}
            onSwipedRight={handleSwipeRight}
            onSwipedLeft={handleSwipeLeft}
            onSwipedAll={handleSwipeAll}
            cardIndex={cardIndex}
            backgroundColor="transparent"
            stackSize={3}
            stackSeparation={15}
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: {
                    backgroundColor: '#000',
                    borderColor: '#E50914',
                    color: '#E50914',
                    borderWidth: 3,
                    fontSize: 24,
                    fontWeight: 'bold',
                    padding: 10,
                    borderRadius: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: {
                    backgroundColor: '#000',
                    borderColor: '#4DED30',
                    color: '#4DED30',
                    borderWidth: 3,
                    fontSize: 24,
                    fontWeight: 'bold',
                    padding: 10,
                    borderRadius: 10,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
            }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            swipeBackCard
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="film-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No hay más recomendaciones</Text>
            <TouchableOpacity style={styles.reloadButton} onPress={loadCards}>
              <Text style={styles.reloadButtonText}>Recargar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Icon name="close" size={30} color="#E50914" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={() => {
            // Mostrar info detallada
          }}
        >
          <Icon name="information-circle" size={25} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Icon name="heart" size={30} color="#4DED30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 15,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  modeButtonActive: {
    backgroundColor: '#E50914',
  },
  modeText: {
    color: '#666',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#fff',
  },
  swiperContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E50914',
  },
  infoButton: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4DED30',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
  },
  reloadButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

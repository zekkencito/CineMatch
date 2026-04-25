import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Animated,
  TextInput,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faFilter, 
  faTimes, 
  faStar, 
  faCalendarAlt, 
  faTheaterMasks,
  faSearch,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const MovieSearchFilters = ({ 
  filters, 
  onFiltersChange, 
  genres = [],
  onSearch,
  searchQuery,
  onSearchQueryChange 
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    genre: false,
    rating: false,
    year: false,
    sortBy: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleGenreToggle = (genreId) => {
    console.log('Genre toggle:', genreId);
    const newGenres = filters.genres?.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...(filters.genres || []), genreId];
    
    console.log('New genres:', newGenres);
    onFiltersChange({ ...filters, genres: newGenres });
  };

  const handleRatingChange = (minRating) => {
    console.log('🌟 handleRatingChange called with:', minRating);
    console.log('🌟 Current filters.ratings:', filters.ratings);
    
    // Cambiar a un array de ratings en lugar de un solo minRating
    const currentRatings = filters.ratings || [];
    const ratingIndex = currentRatings.indexOf(minRating);
    
    let newRatings;
    if (ratingIndex > -1) {
      // Eliminar el rating si ya existe
      newRatings = currentRatings.filter(r => r !== minRating);
      console.log('🌟 Removing rating:', minRating);
    } else {
      // Agregar el rating si no existe
      newRatings = [...currentRatings, minRating].sort((a, b) => b - a); // Ordenar de mayor a menor
      console.log('🌟 Adding rating:', minRating);
    }
    
    console.log('🌟 New ratings will be:', newRatings);
    console.log('🌟 Calling onFiltersChange with:', { ...filters, ratings: newRatings });
    onFiltersChange({ 
      ...filters, 
      ratings: newRatings,
      minRating: undefined // Limpiar el antiguo minRating
    });
  };

  const handleYearChange = (year) => {
    console.log('📅 handleYearChange called with:', year);
    console.log('📅 Current filters.years:', filters.years);
    
    const currentYears = filters.years || [];
    const yearIndex = currentYears.indexOf(year);
    
    let newYears;
    if (yearIndex > -1) {
      newYears = currentYears.filter(y => y !== year);
      console.log('📅 Removing year:', year);
    } else {
      newYears = [...currentYears, year].sort((a, b) => b - a);
      console.log('📅 Adding year:', year);
    }
    
    console.log('📅 New years will be:', newYears);
    onFiltersChange({ 
      ...filters, 
      years: newYears,
      year: undefined // Limpiar el antiguo year
    });
  };

  const handleSortChange = (sortBy) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const clearFilters = () => {
    console.log('clearFilters called - clearing all filters');
    onFiltersChange({});
    onSearchQueryChange('');
    setShowFilters(false);
    console.log('clearFilters completed');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.genres?.length) count++;
    if (filters.ratings?.length) count++;
    if (filters.years?.length) count++;
    if (filters.sortBy && filters.sortBy !== 'popularity.desc') count++;
    return count;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1); // 1 to 10
  const sortOptions = [
    { value: 'popularity.desc', label: 'Más populares' },
    { value: 'vote_average.desc', label: 'Mejor calificadas' },
    { value: 'release_date.desc', label: 'Más recientes' },
    { value: 'release_date.asc', label: 'Más antiguas' },
    { value: 'title.asc', label: 'Alfabético (A-Z)' },
    { value: 'title.desc', label: 'Alfabético (Z-A)' },
  ];

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <FontAwesomeIcon icon={faSearch} size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar películas..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity 
          style={[styles.filterButton, getActiveFiltersCount() > 0 && styles.filterButtonActive]}
          onPress={() => {
            console.log('Filter button pressed');
            setShowFilters(true);
          }}
        >
          <FontAwesomeIcon icon={faFilter} size={14} color={getActiveFiltersCount() > 0 ? '#0a0a0a' : '#999'} />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active filters summary */}
      {getActiveFiltersCount() > 0 && (
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.activeFiltersScroll}
          >
            {filters.genres?.map(genreId => {
              const genre = genres.find(g => g.id === genreId);
              return genre ? (
                <TouchableOpacity
                  key={genreId}
                  style={styles.activeFilterChip}
                  onPress={() => handleGenreToggle(genreId)}
                >
                  <Text style={styles.activeFilterText}>{genre.name}</Text>
                  <FontAwesomeIcon icon={faTimes} size={14} color="#0a0a0a" />
                </TouchableOpacity>
              ) : null;
            })}
            {filters.ratings?.map(rating => (
              <TouchableOpacity
                key={rating}
                style={styles.activeFilterChip}
                onPress={() => {
                  console.log('🗑️ Rating filter X button pressed, current rating:', rating);
                  handleRatingChange(rating);
                }}
              >
                <Text style={styles.activeFilterText}>{rating} estrellas</Text>
                <FontAwesomeIcon icon={faTimes} size={14} color="#0a0a0a" />
              </TouchableOpacity>
            ))}
            {filters.years?.map(year => (
              <TouchableOpacity
                key={year}
                style={styles.activeFilterChip}
                onPress={() => {
                  console.log('🗑️ Year filter X button pressed, current year:', year);
                  handleYearChange(year);
                }}
              >
                <Text style={styles.activeFilterText}>{year}</Text>
                <FontAwesomeIcon icon={faTimes} size={14} color="#0a0a0a" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.clearAllButton} 
            onPress={() => {
              console.log('🗑️ CLEAR ALL FILTERS PRESSED');
              console.log('Before clear - filters:', JSON.stringify(filters));
              // Clear everything
              onFiltersChange({});
              onSearchQueryChange('');
              setShowFilters(false);
              console.log('🗑️ Clear complete');
            }}
            activeOpacity={0.6}
          >
            <Text style={styles.clearAllText}>Limpiar todo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros de búsqueda</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <FontAwesomeIcon icon={faTimes} size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Genre Filter */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('genre')}
              >
                <View style={styles.sectionTitleContainer}>
                  <FontAwesomeIcon icon={faTheaterMasks} size={16} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Géneros</Text>
                </View>
                <FontAwesomeIcon 
                  icon={expandedSections.genre ? faChevronUp : faChevronDown} 
                  size={12} 
                  color="#999" 
                />
              </TouchableOpacity>
              
              {expandedSections.genre && (
                <View style={styles.sectionContent}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.genreList}>
                      {genres.map(genre => (
                        <TouchableOpacity
                          key={genre.id}
                          style={[
                            styles.genreChip,
                            filters.genres?.includes(genre.id) && styles.genreChipActive
                          ]}
                          onPress={() => handleGenreToggle(genre.id)}
                        >
                          <Text style={[
                            styles.genreText,
                            filters.genres?.includes(genre.id) && styles.genreTextActive
                          ]}>
                            {genre.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('rating')}
              >
                <View style={styles.sectionTitleContainer}>
                  <FontAwesomeIcon icon={faStar} size={16} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Calificación mínima</Text>
                </View>
                <FontAwesomeIcon 
                  icon={expandedSections.rating ? faChevronUp : faChevronDown} 
                  size={12} 
                  color="#999" 
                />
              </TouchableOpacity>
              
              {expandedSections.rating && (
                <View style={styles.sectionContent}>
                  <View style={styles.ratingList}>
                    {ratingOptions.map(rating => (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingChip,
                          filters.ratings?.includes(rating) && styles.ratingChipActive
                        ]}
                        onPress={() => handleRatingChange(rating)}
                      >
                        <FontAwesomeIcon icon={faStar} size={12} color="#FFD700" />
                        <Text style={[
                          styles.ratingText,
                          filters.ratings?.includes(rating) && styles.ratingTextActive
                        ]}>
                          {rating}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Year Filter */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('year')}
              >
                <View style={styles.sectionTitleContainer}>
                  <FontAwesomeIcon icon={faCalendarAlt} size={16} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Año de lanzamiento</Text>
                </View>
                <FontAwesomeIcon 
                  icon={expandedSections.year ? faChevronUp : faChevronDown} 
                  size={12} 
                  color="#999" 
                />
              </TouchableOpacity>
              
              {expandedSections.year && (
                <View style={styles.sectionContent}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.yearList}>
                      {years.map(year => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.yearChip,
                            filters.years?.includes(year) && styles.yearChipActive
                          ]}
                          onPress={() => handleYearChange(year)}
                        >
                          <Text style={[
                            styles.yearText,
                            filters.years?.includes(year) && styles.yearTextActive
                          ]}>
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Sort Filter */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('sortBy')}
              >
                <View style={styles.sectionTitleContainer}>
                  <FontAwesomeIcon icon={faFilter} size={16} color="#FFD700" />
                  <Text style={styles.sectionTitle}>Ordenar por</Text>
                </View>
                <FontAwesomeIcon 
                  icon={expandedSections.sortBy ? faChevronUp : faChevronDown} 
                  size={12} 
                  color="#999" 
                />
              </TouchableOpacity>
              
              {expandedSections.sortBy && (
                <View style={styles.sectionContent}>
                  {sortOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.sortOption,
                        filters.sortBy === option.value && styles.sortOptionActive
                      ]}
                      onPress={() => handleSortChange(option.value)}
                    >
                      <Text style={[
                        styles.sortOptionText,
                        filters.sortBy === option.value && styles.sortOptionTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => {
                setShowFilters(false);
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    pointerEvents: 'auto',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    zIndex: 1,
    pointerEvents: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIcon: {
    color: '#999',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    placeholderTextColor: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'relative',
    zIndex: 2,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeFiltersContainer: {
    marginTop: 8,
    gap: 8,
  },
  activeFiltersScroll: {
    marginVertical: 6,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginRight: 6,
    marginVertical: 2,
  },
  activeFilterText: {
    fontSize: 13,
    color: '#0a0a0a',
    fontWeight: '700',
  },
  clearAllButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginHorizontal: 0,
  },
  clearAllText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionContent: {
    paddingTop: 8,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  genreChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  genreText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  genreTextActive: {
    color: '#0a0a0a',
  },
  ratingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 4,
  },
  ratingChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  ratingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ratingTextActive: {
    color: '#0a0a0a',
  },
  yearList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  yearChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  yearText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  yearTextActive: {
    color: '#0a0a0a',
  },
  sortOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortOptionActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#FFD700',
    fontWeight: '700',
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
  },

  });

export default MovieSearchFilters;

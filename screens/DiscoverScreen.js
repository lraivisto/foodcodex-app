import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { searchMealsByName, getRandomMeal, filterByCategory, filterByArea } from '../utils/api';
import db from '../utils/db';
import { auth } from '../firebase';

const CATEGORIES = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian', 'Vegan', 'Breakfast', 'Starter', 'Side'
];

const AREAS = [
  'American', 'British', 'Canadian', 'Chinese', 'French', 'Greek', 'Indian', 'Italian', 'Japanese', 'Mexican', 'Spanish', 'Thai'
];

const DiscoverScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [filterMode, setFilterMode] = useState('category'); // 'category' or 'area'

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // clear filters when searching
    setSelectedCategory(null);
    setSelectedArea(null);

    setLoading(true);
    const results = await searchMealsByName(searchQuery);
    setMeals(results);
    setLoading(false);
  };

  const handleRandomMeal = async () => {
    // clear filters when getting random
    setSelectedCategory(null);
    setSelectedArea(null);
    setSearchQuery('');

    setLoading(true);
    const randomMeal = await getRandomMeal();
    if (randomMeal) {
      setMeals([randomMeal]);

      // Increment random meals stat
      const user = auth.currentUser;
      if (user) {
        await db.incrementStat(user.uid, 'random_meals_searched');
      }
    }
    setLoading(false);
  };

  const handleCategoryFilter = async (category) => {
    // clear search and area filter
    setSearchQuery('');
    setSelectedArea(null);

    if (selectedCategory === category) {
      // deselect if clicking the same category
      setSelectedCategory(null);
      setMeals([]);
      return;
    }

    setSelectedCategory(category);
    setLoading(true);
    const results = await filterByCategory(category);
    setMeals(results);
    setLoading(false);
  };

  const handleAreaFilter = async (area) => {
    // clear search and category filter
    setSearchQuery('');
    setSelectedCategory(null);

    if (selectedArea === area) {
      // deselect if clicking the same area
      setSelectedArea(null);
      setMeals([]);
      return;
    }

    setSelectedArea(area);
    setLoading(true);
    const results = await filterByArea(area);
    setMeals(results);
    setLoading(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedArea(null);
    setSearchQuery('');
    setMeals([]);
  };

  const renderMealCard = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('RecipeDetail', { mealId: item.idMeal })}
    >
      <Image
        source={{ uri: item.strMealThumb }}
        style={styles.mealImage}
        resizeMode="cover"
      />
      <View style={styles.mealInfo}>
        <Text style={styles.mealName} numberOfLines={1}>{item.strMeal}</Text>
        <Text style={styles.mealCategory}>{item.strCategory}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Recipes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Mode Toggle */}
      <View style={styles.filterModeContainer}>
        <TouchableOpacity
          style={[styles.filterModeButton, filterMode === 'category' && styles.filterModeButtonActive]}
          onPress={() => setFilterMode('category')}
        >
          <Ionicons
            name="restaurant"
            size={18}
            color={filterMode === 'category' ? '#fff' : '#0782F9'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.filterModeText, filterMode === 'category' && styles.filterModeTextActive]}>
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterModeButton, filterMode === 'area' && styles.filterModeButtonActive]}
          onPress={() => setFilterMode('area')}
        >
          <Ionicons
            name="globe"
            size={18}
            color={filterMode === 'area' ? '#fff' : '#0782F9'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.filterModeText, filterMode === 'area' && styles.filterModeTextActive]}>
            Cuisines
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
        >
          {filterMode === 'category' ? (
            CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.filterChip,
                  selectedArea === area && styles.filterChipActive
                ]}
                onPress={() => handleAreaFilter(area)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedArea === area && styles.filterChipTextActive
                ]}>
                  {area}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Active Filter & Clear Button */}
      {(selectedCategory || selectedArea) && (
        <View style={styles.activeFilterContainer}>
          <View style={styles.activeFilterBadge}>
            <Ionicons name="funnel" size={14} color="#0782F9" style={{ marginRight: 4 }} />
            <Text style={styles.activeFilterText}>
              {selectedCategory || selectedArea}
            </Text>
          </View>
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Random Recipe Button */}
      <TouchableOpacity
        style={[
          styles.randomButton,
          !(selectedCategory || selectedArea) && styles.randomButtonNoFilter
        ]}
        onPress={handleRandomMeal}
        disabled={loading}
      >
        <Ionicons name="shuffle" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.randomButtonText}>Surprise Me!</Text>
      </TouchableOpacity>

      {/* Results Count */}
      {meals.length > 0 && !loading && (
        <Text style={styles.resultsCount}>{meals.length} recipe{meals.length > 1 ? 's' : ''} found</Text>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0782F9" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      )}

      {/* Recipe List */}
      {!loading && (
        <FlatList
          data={meals}
          renderItem={renderMealCard}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={styles.mealList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {selectedCategory || selectedArea
                  ? 'No recipes found for this filter'
                  : 'Search, filter, or try a random recipe!'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filterModeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
  },
  filterModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  filterModeButtonActive: {
    backgroundColor: '#0782F9',
  },
  filterModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0782F9',
  },
  filterModeTextActive: {
    color: '#fff',
  },
  filterChipsWrapper: {
    height: 58,
    marginBottom: 0,
  },
  filterChipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0782F9',
    borderColor: '#0782F9',
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0782F9',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0782F9',
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  randomButtonNoFilter: {
    marginTop: 24,
  },
  randomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsCount: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  mealList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
  },
  mealInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  mealCategory: {
    fontSize: 14,
    color: '#666',
  },
});

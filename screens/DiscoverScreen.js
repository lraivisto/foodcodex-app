import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// placeholder data. will be replaced with real api data later
const PLACEHOLDER_MEALS = [
  {
    idMeal: '1',
    strMeal: 'Spaghetti Carbonara',
    strMealThumb: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
    strCategory: 'Pasta',
  },
  {
    idMeal: '2',
    strMeal: 'Chicken Teriyaki',
    strMealThumb: 'https://www.themealdb.com/images/media/meals/1550441882.jpg',
    strCategory: 'Chicken',
  },
  {
    idMeal: '3',
    strMeal: 'Beef Wellington',
    strMealThumb: 'https://www.themealdb.com/images/media/meals/vwuprt1511813703.jpg',
    strCategory: 'Beef',
  },
];

const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [meals, setMeals] = useState(PLACEHOLDER_MEALS);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // todo: API integration = search by name
  };

  const handleRandomMeal = () => {
    console.log('Getting random meal...');
    // todo: API integration = fetch random meal
  };

  const handleCategoryFilter = () => {
    console.log('Filter by category:', selectedCategory);
    // todo: API integration = filter by category
  };

  const handleAreaFilter = () => {
    console.log('Filter by area:', selectedArea);
    // todo: API integration = filter by area
  };

  const renderMealCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.mealCard}
      onPress={() => console.log('Tapped meal:', item.strMeal)}
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

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.randomButton}
          onPress={handleRandomMeal}
        >
          <Ionicons name="shuffle" size={20} color="#fff" />
          <Text style={styles.randomButtonText}>Random Recipe</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => console.log('Open filters')}
        >
          <Ionicons name="filter" size={20} color="#0782F9" />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Pills (Placeholder) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterPills}
        contentContainerStyle={styles.filterPillsContent}
      >
        <TouchableOpacity style={styles.activePill}>
          <Text style={styles.activePillText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>Pasta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>Chicken</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>Seafood</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>Vegetarian</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>Dessert</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results Count */}
      <Text style={styles.resultsCount}>{meals.length} recipes found</Text>

      {/* Recipe List */}
      <FlatList
        data={meals}
        renderItem={renderMealCard}
        keyExtractor={(item) => item.idMeal}
        contentContainerStyle={styles.mealList}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  randomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0782F9',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  randomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0782F9',
    gap: 8,
  },
  filterButtonText: {
    color: '#0782F9',
    fontSize: 16,
    fontWeight: '600',
  },
  filterPills: {
    marginBottom: 12,
  },
  filterPillsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
  },
  pillText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0782F9',
    borderRadius: 20,
    marginRight: 8,
  },
  activePillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCount: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    color: '#666',
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

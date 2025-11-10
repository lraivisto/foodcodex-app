import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { searchMealsByName, getRandomMeal } from '../utils/api';

const DiscoverScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    const results = await searchMealsByName(searchQuery);
    setMeals(results);
    setLoading(false);
  };

  const handleRandomMeal = async () => {
    setLoading(true);
    const randomMeal = await getRandomMeal();
    if (randomMeal) {
      setMeals([randomMeal]);
    }
    setLoading(false);
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

      {/* Random Recipe Button */}
      <TouchableOpacity
        style={styles.randomButton}
        onPress={handleRandomMeal}
        disabled={loading}
      >
        <Ionicons name="shuffle" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.randomButtonText}>Random Recipe</Text>
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
              <Text style={styles.emptyText}>Search for recipes or try a random one!</Text>
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
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0782F9',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 10,
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

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import db from '../utils/db';
import { auth } from '../firebase';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);

  const load = async () => {
    try {
      await db.initDB();
      const user = auth.currentUser;
      if (!user) { setFavorites([]); return; }
      const rows = await db.getFavorites(user.uid);
      setFavorites(rows);
    } catch (e) {
      console.error(e);
    }
  };

  // Refresh favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const handleRemoveFavorite = async (mealId, mealName) => {
    const user = auth.currentUser;
    if (!user) return;
    
    // Show confirmation dialog
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${mealName}" from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await db.removeFavorite(user.uid, mealId);
              if (success) {
                // Reload favorites after removing
                load();
              } else {
                Alert.alert('Error', 'Failed to remove from favorites');
              }
            } catch (e) {
              console.error('Error removing favorite:', e);
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    // Check if this is a user recipe (prefixed with "user_")
    const isUserRecipe = item.meal_id?.startsWith('user_');
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          if (isUserRecipe) {
            // Pass the full recipe data for user recipes
            navigation.navigate('RecipeDetail', { 
              mealId: item.meal_id,
              userRecipeData: item
            });
          } else {
            // For API meals, just pass the ID
            navigation.navigate('RecipeDetail', { mealId: item.meal_id });
          }
        }}
      >
        {item.meal_thumbnail ? (
          <Image source={{ uri: item.meal_thumbnail }} style={styles.thumb} />
        ) : (
          <View style={styles.thumbPlaceholder}><Text style={{ color: '#666' }}>No Img</Text></View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.title}>{item.meal_name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFavorite(item.meal_id, item.meal_name);
          }}
        >
          <Ionicons name="heart" size={24} color="#FF0000" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Favorites</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No favorites yet.</Text>
          <Text style={styles.emptySubText}>Add recipes from the Discover tab!</Text>
        </View>
      ) : (
        <FlatList 
          data={favorites} 
          keyExtractor={f => String(f.id)} 
          renderItem={renderItem} 
          contentContainerStyle={{ padding: 12 }} 
        />
      )}
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  header: { fontSize: 28, fontWeight: '700' },
  empty: { 
    flex: 1,
    padding: 16, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff',
    marginBottom: 12, 
    borderRadius: 12, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumb: { width: 100, height: 100 },
  thumbPlaceholder: { 
    width: 100, 
    height: 100, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#f5f5f5' 
  },
  cardBody: { 
    flex: 1, 
    padding: 12,
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '600' },
  removeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

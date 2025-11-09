import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import db from '../utils/db';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const MyRecipeScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const navigation = useNavigation();

  const load = async () => {
    try {
      await db.initDB();
      const user = auth.currentUser;
      if (!user) {
        setRecipes([]);
        return;
      }
      const rows = await db.getUserRecipes(user.uid);
      setRecipes(rows);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not load recipes');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    // initial load
    load();
    return unsubscribe;
  }, []);

  const handleDelete = async (id) => {
    // Add confirmation dialog
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const recipeToDelete = recipes.find(r => r.id === id);
              await db.deleteUserRecipe(id);
              console.log(`[RECIPE] Recipe deleted successfully: ${recipeToDelete?.name || 'Unknown'} (ID: ${id})`);
              load(); // reload the list after delete
            } catch (e) {
              console.error('[RECIPE] Delete failed:', e);
              Alert.alert('Error', 'Could not delete recipe');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (id) => {
    console.log('Edit pressed for recipe:', id);
    try {
      navigation.navigate('AddRecipe', { editId: id });
    } catch (e) {
      console.error('Navigation failed:', e);
      Alert.alert('Error', 'Could not open edit screen');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image_uri ? (
        <Image source={{ uri: item.image_uri }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder}><Ionicons name="book" size={28} color="#666" /></View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.meta}>{item.category} • {item.area}</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.smallButton, { backgroundColor: '#ff5c5c' }]}>
            <Text style={styles.smallButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Recipes</Text>
      {recipes.length === 0 ? (
        <View style={styles.empty}><Text style={{ color: '#666' }}>You have no saved recipes yet. Tap + to add one.</Text></View>
      ) : (
        <FlatList data={recipes} keyExtractor={r => String(r.id)} renderItem={renderItem} contentContainerStyle={{ padding: 12 }} />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddRecipe')}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default MyRecipeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: '700', padding: 16 },
  empty: { padding: 16, alignItems: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#fafafa', marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
  thumb: { width: 96, height: 96 },
  thumbPlaceholder: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' },
  cardBody: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#666', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 8 },
  smallButton: { backgroundColor: '#0782F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginRight: 8 },
  smallButtonText: { color: '#fff', fontWeight: '600' },
  fab: { position: 'absolute', right: 18, bottom: 24, backgroundColor: '#0782F9', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }
});

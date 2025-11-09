import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import db from '../utils/db';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const AddRecipeScreen = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructions, setInstructions] = useState('');
  const navigation = useNavigation();

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to save recipes.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Validation', 'Please provide a recipe name.');
      return;
    }

    const ingredients = ingredientsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      await db.initDB();
      await db.addUserRecipe(user.uid, {
        name,
        category,
        area,
        ingredients,
        instructions,
        image_uri: null,
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save recipe.');
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Recipe name" />

      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category (e.g. Pasta)" />

      <Text style={styles.label}>Area</Text>
      <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="Area (e.g. Italian)" />

      <Text style={styles.label}>Ingredients (one per line)</Text>
      <TextInput
        style={[styles.input, { minHeight: 100 }]
        }
        value={ingredientsText}
        onChangeText={setIngredientsText}
        placeholder={'1 cup flour\n2 eggs\n...'}
        multiline
      />

      <Text style={styles.label}>Instructions</Text>
      <TextInput
        style={[styles.input, { minHeight: 140 }]
        }
        value={instructions}
        onChangeText={setInstructions}
        placeholder={'Cooking instructions...'}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddRecipeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#0782F9',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});

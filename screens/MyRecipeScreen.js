import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

const MyRecipeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Recipes</Text>
      <TextInput
        style={styles.placeholderBox}
        placeholder="Placeholder: List of own recipes will go here"
        editable={false}
        multiline
      />
    </View>
  );
};

export default MyRecipeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  placeholderBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    color: '#666'
  }
});

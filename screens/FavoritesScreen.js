import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

const FavoritesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <TextInput
        style={styles.placeholderBox}
        placeholder="Placeholder: List of saved favorites will appear here"
        editable={false}
        multiline
      />
    </View>
  );
};

export default FavoritesScreen;

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

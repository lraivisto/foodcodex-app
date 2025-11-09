import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import db from '../utils/db';
import { auth } from '../firebase';

const FavoritesScreen = () => {
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

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.meal_thumbnail ? (
        <Image source={{ uri: item.meal_thumbnail }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder}><Text style={{color:'#666'}}>No Img</Text></View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.title}>{item.meal_name}</Text>
        <Text style={styles.meta}>ID: {item.meal_id}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorites</Text>
      {favorites.length === 0 ? (
        <View style={styles.empty}><Text style={{ color: '#666' }}>No favorites yet.</Text></View>
      ) : (
        <FlatList data={favorites} keyExtractor={f => String(f.id)} renderItem={renderItem} contentContainerStyle={{ padding: 12 }} />
      )}
    </View>
  );
};

export default FavoritesScreen;

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
});

// utils/db.web.js
// Web fallback – uses localStorage or AsyncStorage-like logic

import AsyncStorage from '@react-native-async-storage/async-storage';

console.warn('Web build: using AsyncStorage fallback instead of SQLite.');

const AS_KEYS = {
  USER_RECIPES: (userId) => `fc_user_recipes:${userId}`,
  FAVORITES: (userId) => `fc_favorites:${userId}`,
};

// No DB initialization needed on web
async function initDB() {
  return;
}

// ---- User Recipes ----
async function getUserRecipes(userId) {
  if (!userId) return [];
  const key = AS_KEYS.USER_RECIPES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => b.id - a.id);
}

async function addUserRecipe(userId, recipe) {
  const key = AS_KEYS.USER_RECIPES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  const id = Date.now();
  const item = { id, user_id: userId, ...recipe };
  arr.push(item);
  await AsyncStorage.setItem(key, JSON.stringify(arr));
  return id;
}

async function updateUserRecipe(id, recipe) {
  const userId = recipe.user_id;
  if (!userId) return;
  const key = AS_KEYS.USER_RECIPES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  const idx = arr.findIndex(x => x.id === id);
  if (idx !== -1) {
    arr[idx] = { ...arr[idx], ...recipe };
    await AsyncStorage.setItem(key, JSON.stringify(arr));
  }
}

async function deleteUserRecipe(id) {
  const allKeys = await AsyncStorage.getAllKeys();
  const recipeKeys = allKeys.filter(k => k.startsWith('fc_user_recipes:'));
  for (const key of recipeKeys) {
    const raw = await AsyncStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const newArr = arr.filter(x => x.id !== id);
    if (newArr.length !== arr.length) {
      await AsyncStorage.setItem(key, JSON.stringify(newArr));
      return;
    }
  }
}

// ---- Favorites ----
async function getFavorites(userId) {
  const key = AS_KEYS.FAVORITES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  return arr.sort((a, b) => b.id - a.id);
}

async function addFavorite(userId, meal) {
  const key = AS_KEYS.FAVORITES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  if (!arr.some(f => f.meal_id === meal.meal_id)) {
    const id = Date.now();
    arr.push({ id, user_id: userId, ...meal });
    await AsyncStorage.setItem(key, JSON.stringify(arr));
  }
}

async function removeFavorite(userId, mealId) {
  const key = AS_KEYS.FAVORITES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  const newArr = arr.filter(f => f.meal_id !== mealId);
  await AsyncStorage.setItem(key, JSON.stringify(newArr));
}

async function deleteAllUserData(userId) {
  if (!userId) return;
  await AsyncStorage.removeItem(AS_KEYS.USER_RECIPES(userId));
  await AsyncStorage.removeItem(AS_KEYS.FAVORITES(userId));
}

export default {
  initDB,
  getUserRecipes,
  addUserRecipe,
  updateUserRecipe,
  deleteUserRecipe,
  getFavorites,
  addFavorite,
  removeFavorite,
  deleteAllUserData,
};

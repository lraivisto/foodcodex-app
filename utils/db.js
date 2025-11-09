import AsyncStorage from '@react-native-async-storage/async-storage';
let sqliteAvailable = false;
let SQLite;
try {
  // dynamic require to avoid bundling issues on web
  SQLite = require('expo-sqlite');
  if (SQLite && typeof SQLite.openDatabase === 'function') sqliteAvailable = true;
} catch (e) {
  sqliteAvailable = false;
}

let db;
if (sqliteAvailable) db = SQLite.openDatabase('foodcodex.db');

function executeSqlAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!sqliteAvailable) return reject(new Error('SQLite not available'));
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    }, err => reject(err));
  });
}

// When SQLite is unavailable (for example on web), fall back to AsyncStorage-backed simple store.
const AS_KEYS = {
  USER_RECIPES: (userId) => `fc_user_recipes:${userId}`,
  FAVORITES: (userId) => `fc_favorites:${userId}`,
};

async function initDB() {
  if (sqliteAvailable) {
    // Create tables if they don't exist
    await executeSqlAsync(
      `CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY NOT NULL,
        user_id TEXT,
        meal_id TEXT,
        meal_name TEXT,
        meal_thumbnail TEXT,
        UNIQUE(user_id, meal_id)
      );`
    );

    await executeSqlAsync(
      `CREATE TABLE IF NOT EXISTS user_recipes (
        id INTEGER PRIMARY KEY NOT NULL,
        user_id TEXT,
        name TEXT,
        category TEXT,
        area TEXT,
        instructions TEXT,
        image_uri TEXT,
        ingredients TEXT
      );`
    );
  } else {
    // AsyncStorage fallback requires no initialization
    return;
  }
}

// User recipes CRUD
async function getUserRecipes(userId) {
  if (!userId) return [];
  if (sqliteAvailable) {
    const res = await executeSqlAsync('SELECT * FROM user_recipes WHERE user_id = ? ORDER BY id DESC;', [userId]);
    const rows = res.rows._array || [];
    // parse ingredients JSON
    return rows.map(r => ({ ...r, ingredients: r.ingredients ? JSON.parse(r.ingredients) : [] }));
  }
  // AsyncStorage fallback
  const key = AS_KEYS.USER_RECIPES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  // ensure ingredients is array
  return arr.sort((a,b) => b.id - a.id).map(r => ({ ...r, ingredients: r.ingredients || [] }));
}

async function addUserRecipe(userId, recipe) {
  const { name, category, area, instructions, image_uri = null, ingredients = [] } = recipe;
  if (sqliteAvailable) {
    const ingredientsText = JSON.stringify(ingredients);
    const res = await executeSqlAsync(
      `INSERT INTO user_recipes (user_id, name, category, area, instructions, image_uri, ingredients) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [userId, name, category, area, instructions, image_uri, ingredientsText]
    );
    return res.insertId;
  }
  // AsyncStorage fallback
  const key = AS_KEYS.USER_RECIPES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  const id = Date.now();
  const item = { id, user_id: userId, name, category, area, instructions, image_uri, ingredients };
  arr.push(item);
  await AsyncStorage.setItem(key, JSON.stringify(arr));
  return id;
}

async function updateUserRecipe(id, recipe) {
  const { name, category, area, instructions, image_uri = null, ingredients = [] } = recipe;
  if (sqliteAvailable) {
    const ingredientsText = JSON.stringify(ingredients);
    await executeSqlAsync(
      `UPDATE user_recipes SET name = ?, category = ?, area = ?, instructions = ?, image_uri = ?, ingredients = ? WHERE id = ?;`,
      [name, category, area, instructions, image_uri, ingredientsText, id]
    );
    return;
  }
  // AsyncStorage fallback: find by id across all users (not ideal, but called with user's id context normally)
  // We'll try to update by scanning all keys; simpler approach: require caller to pass userId in recipe if needed.
  const userId = recipe.user_id;
  if (!userId) return;
  const key = AS_KEYS.USER_RECIPES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  const idx = arr.findIndex(x => x.id === id);
  if (idx !== -1) {
    arr[idx] = { ...arr[idx], name, category, area, instructions, image_uri, ingredients };
    await AsyncStorage.setItem(key, JSON.stringify(arr));
  }
}

async function deleteUserRecipe(id) {
  if (sqliteAvailable) {
    await executeSqlAsync('DELETE FROM user_recipes WHERE id = ?;', [id]);
    return;
  }
  // AsyncStorage: need to find the user's key. We'll scan keys for fc_user_recipes:* and remove matching id.
  try {
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
  } catch (e) {
    console.error('deleteUserRecipe fallback error', e);
  }
}

// Favorites
async function getFavorites(userId) {
  if (!userId) return [];
  if (sqliteAvailable) {
    const res = await executeSqlAsync('SELECT * FROM favorites WHERE user_id = ? ORDER BY id DESC;', [userId]);
    return res.rows._array || [];
  }
  const key = AS_KEYS.FAVORITES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  return arr.sort((a,b)=>b.id - a.id);
}

async function addFavorite(userId, meal) {
  // meal: { meal_id, meal_name, meal_thumbnail }
  try {
    if (sqliteAvailable) {
      await executeSqlAsync(
        `INSERT OR IGNORE INTO favorites (user_id, meal_id, meal_name, meal_thumbnail) VALUES (?, ?, ?, ?);`,
        [userId, meal.meal_id, meal.meal_name, meal.meal_thumbnail]
      );
      return true;
    }
    const key = AS_KEYS.FAVORITES(userId);
    const raw = await AsyncStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    // prevent duplicate by meal_id
    if (!arr.some(f => f.meal_id === meal.meal_id)) {
      const id = Date.now();
      arr.push({ id, user_id: userId, meal_id: meal.meal_id, meal_name: meal.meal_name, meal_thumbnail: meal.meal_thumbnail });
      await AsyncStorage.setItem(key, JSON.stringify(arr));
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function removeFavorite(userId, mealId) {
  if (sqliteAvailable) {
    await executeSqlAsync('DELETE FROM favorites WHERE user_id = ? AND meal_id = ?;', [userId, mealId]);
    return;
  }
  const key = AS_KEYS.FAVORITES(userId);
  const raw = await AsyncStorage.getItem(key);
  const arr = raw ? JSON.parse(raw) : [];
  const newArr = arr.filter(f => f.meal_id !== mealId);
  await AsyncStorage.setItem(key, JSON.stringify(newArr));
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
};

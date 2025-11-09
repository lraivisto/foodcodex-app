import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DiscoverScreen from './DiscoverScreen';
import FavoritesScreen from './FavoritesScreen';
import MyRecipeScreen from './MyRecipeScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse';
          if (route.name === 'Discover') iconName = 'search';
          else if (route.name === 'Favorites') iconName = 'heart';
          else if (route.name === 'MyRecipes') iconName = 'book';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="MyRecipes" component={MyRecipeScreen} options={{ title: 'My Recipes' }} />
    </Tab.Navigator>
  );
}

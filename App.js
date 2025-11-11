import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import MainTabs from './screens/MainTabs';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './screens/SplashScreen';
import AddRecipeScreen from './screens/AddRecipeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen'
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'

const Stack = createNativeStackNavigator();

export default function App() {
  const [splashSeen, setSplashSeen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const seen = await AsyncStorage.getItem('splashSeen');
      if (seen) setSplashSeen(true);

      // wait for firebase to tell us if there is a user
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false); // <-- only stop loading after we know the user
      });

      return () => unsubscribe();
    };

    init();
  }, []);


  if(loading){
    return(
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={40} color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={splashSeen ? (user ? 'Home' : 'Login') : 'Splash'}>
        <Stack.Screen
          name="Splash"
          options={{ headerShown: false }}
          component={SplashScreen}
        />
        <Stack.Screen
          name="Login"
          options={{ headerShown: false }}
          component={LoginScreen}
        />

        <Stack.Screen 
          name="Register" 
          options={{headerShown: false}} 
          component={RegisterScreen}
        />
        <Stack.Screen name="Home"
          component={MainTabs}
          options={{ headerBackVisible: false }}
        />
        <Stack.Screen name="AddRecipe" options={{ title: 'Add / Edit Recipe' }} component={AddRecipeScreen} />
        <Stack.Screen
          name="RecipeDetail"
          options={{ title: 'Recipe Details' }} // ✅ add this
          component={RecipeDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

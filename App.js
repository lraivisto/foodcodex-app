import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
<<<<<<< HEAD

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
=======
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './screens/SplashScreen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const[splashSeen, setSplashSeen] = useState(false);
  const [loading, setLoading] = useState(true); 
  useEffect(() =>{
    const checkSplash = async() =>{ 
    if(await AsyncStorage.getItem('splashSeen')!==null) setSplashSeen(true);
    setLoading(false);
    }
    checkSplash();
  }, [])

  if(loading){
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={splashSeen ? 'Login' : 'Splash'}>
        <Stack.Screen 
          name="Splash" 
          options={{headerShown: false}}
          component={SplashScreen} 
        />
        <Stack.Screen 
          name="Login" 
          options={{headerShown: false}} 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Register" 
          options={{title: '', headerBackTitleVisible: false}} 
          component={RegisterScreen}
        />
        <Stack.Screen name="Home" 
          component={HomeScreen} 
          options={{headerBackVisible: false}} 
        />
      </Stack.Navigator>
    </NavigationContainer>
>>>>>>> local
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

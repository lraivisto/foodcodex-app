import { StyleSheet, Text, View, KeyboardAvoidingView, TouchableOpacity } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigator = useNavigation();
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>Welcome to FoodCodex</Text>
        <Text style={{ fontSize: 16 }}>Your personal food companion</Text>
      </View>

      <View style={styles.welcomeBox}>
        <Text style={{ color: 'grey' }}>(kuva tai ikoni tähän)...</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            navigator.navigate('Login'),
            AsyncStorage.setItem('splashSeen', 'true');
          }}
          style={styles.button}
        >
          <View>
            <Text style={styles.buttonText}>
              Continue
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  welcomeBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 200
  },

  welcomeText: {
    fontWeight: 'bold',
    fontSize: 25
  },

  button: {
    backgroundColor: '#0782F9',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  }

})
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigator = useNavigation();


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("All fields must be filled!");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("[AUTH] User logged in successfully:", user.email);

      navigator.replace('Home'); // 👈 go to Home after successful login
    } catch (e) {
      alert(e.message)
    } finally {
      setEmail("");
      setPassword("");
    }
  }



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <View style={styles.welcomeStyle}>
        <Text style={styles.welcomeText}>Hello,</Text>
        <Text>Log in or Sign up to save your favorites recipes</Text>
      </View>

      <View style={styles.inputContainer}>

        <TextInput
          placeholder='Email'
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />

        <TextInput
          placeholder='Password'
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />

      </View>

      <View style={styles.buttonContainer}>

        <TouchableOpacity
          onPress={handleLogin}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>
              Sign in {' '}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="black" style={styles.icon} />
          </View>
        </TouchableOpacity>

        <Text onPress={() =>
          navigator.navigate('Register')
        }>
          Don't have an account? Create
        </Text>

      </View>

    </KeyboardAvoidingView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  inputContainer: {
    width: '80%'
  },

  welcomeStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50
  },

  welcomeText: {
    fontWeight: 'bold',
    fontSize: 25
  },

  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 10,
  },

  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },

  icon: {
    color: 'white',
    marginTop: 3,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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


})
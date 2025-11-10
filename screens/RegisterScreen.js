import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const navigator = useNavigation();

  const handleSignUp = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !mobile.trim()) {
      alert("All fields must be filled!");
      return;
    }

    // Email validation (simple but effective)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!/[0-9]/.test(password)) {
      alert("Password must contain at least one number");
      return;
    }


    // Mobile number validation
    const mobileRegex = /^(?:\+|00)?[0-9]{7,15}$/;
    // allows + or 00 prefix, followed by 7–15 digits
    if (!mobileRegex.test(mobile)) {
      alert("Please enter a valid phone number (use + or 00 prefix, 7–15 digits total)");
      return;
    }
    setLoading(true);
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        mobile: mobile,
        createdAt: new Date()
      })
      setIsRegistrationSuccess(true)
      console.log("User registered:", user.email);
    } catch (e) {
      alert(e.message);
    } finally {
      setUsername("");
      setEmail("");
      setPassword("");
      setMobile("");
      setLoading(false)
    }
  }

  if (isRegistrationSuccess) {
    return (
      <View style={styles.imageContainer}>
        <View style={styles.succMessage}>
          <Image
            style={styles.succImage}
            source={require("../assets/vecteezy_green-check-mark-illustration-ai-generative_33126407.png")}
          />
          <Text style={styles.succMessageText}>
            Registration Successful
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigator.navigate("Login")}
            style={styles.button}
          >
            <View styles={styles.buttonContent}>
              <Text style={styles.buttonText}>
                Login Now
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      {loading &&
        <View style={styles.loaderContainer}>
          <Text style={styles.loaderText}>Registering</Text>
          <ActivityIndicator size={40} color="#007AFF" />
        </View>
      }

      <View style={styles.welcomeStyle}>
        <Text style={styles.welcomeText}>Create Account</Text>
        <Image style={styles.titleImage} source={require("../assets/ChatGPT Image Nov 9, 2025, 06_35_57 PM.png")} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder='Username'
          value={username}
          onChangeText={text => setUsername(text)}
          style={styles.input}
        />
        <TextInput
          placeholder='Password'
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          placeholder='Email'
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder='Mobile'
          value={mobile}
          onChangeText={text => setMobile(text)}
          style={styles.input}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.buttonContainer}>

        <TouchableOpacity
          onPress={handleSignUp}
          style={styles.button}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>
              Create {' '}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="black" style={styles.icon} />
          </View>
        </TouchableOpacity>

        <Text onPress={() =>
          navigator.navigate('Login')
        }>
          Already have an account? Log in
        </Text>

      </View>
    </KeyboardAvoidingView>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    width: '80%',
  },

  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  succImage: {
    width: 300,
    height: 300
  },

  titleImage: {
    marginTop: 10,
    width: 100,
    height: 100
  },

  welcomeStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50
  },

  succMessage: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },

  succMessageText: {
    color: '#1E7D3E', // rich green tone
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold', // or use default font if not installed
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: 20,
    margin: 20
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

  button: {
    backgroundColor: '#0782F9',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  },

  loaderContainer: {
    position: 'absolute',     // makes it overlay everything
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // optional translucent backdrop
    zIndex: 10,               // ensures it appears on top
  },

  loaderText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#007AFF',
    marginRight: 12, // space between text and spinner
  },
})
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase'

const RegisterScreen = () => {
  const[username, setUsername] = useState('');
  const[email, setEmail] = useState('');
  const[password, setPassword] = useState('');
  const[mobile, setMobile] = useState('');
  const navigator = useNavigation();

  const handleSignUp = async() => {
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

      try{
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredentials.user;

        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            mobile: mobile,
            createdAt: new Date()
        })

        console.log("User registered:", user.email);
      }catch(e){
        alert(e.message);
      }finally{
        setUsername("");
        setEmail("");
        setPassword("");
        setMobile("");
       }
    }


  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior="padding"
    >
        <View style={styles.welcomeStyle}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={{color:'grey'}}>(kuva tai ikoni tähän)...</Text>
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
    container:{
        flex: 1,
        justifyContent:'center',
        alignItems: 'center'
    },
    inputContainer:{
      width: '80%',
    },

    welcomeStyle:{
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 50
    },

    welcomeText:{
      fontWeight: 'bold',
      fontSize: 25
    },

    input:{
      backgroundColor:'white',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 24,
      marginTop: 10,
    },
    buttonContainer:{
      width: '60%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40
    },

    icon: {
        color: 'white',
        marginTop: 3,
    },

    button:{
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

    buttonText:{
      color: 'white',
      fontWeight: '700',
      fontSize: 16
    },
})
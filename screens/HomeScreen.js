import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigation } from '@react-navigation/native'

const HomeScreen = () => {
  const navigator = useNavigation();
  const handleLogOut = async() =>{
    try {
    await signOut(auth);
    console.log("User logged out");
    navigator.replace('Login');
  } catch (e) {
    alert(e.message);
  }
  }

  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior="padding"
    >
      <View style={styles.buttonContainer}>

        <TouchableOpacity
        onPress={handleLogOut}
        style={styles.button}
        >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>
                  Log out
              </Text>
            </View>
        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container:{
        flex: 1,
        justifyContent:'center',
        alignItems: 'center'
    },

  buttonContainer:{
      width: '60%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40
    },

    button:{
      backgroundColor: '#E53935',
      width: '100%',
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10
    },

    buttonText:{
      color: 'black',
      fontWeight: '700',
      fontSize: 16
    },

})
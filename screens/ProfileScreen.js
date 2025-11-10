import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { auth, db } from '../firebase';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import dbLocal from '../utils/db'

export default function ProfileScreen() {
    const navigation = useNavigation();
    const userEmail = auth.currentUser?.email;
    const [deleting, setDeleting] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');

    const handleLogout = async () => {
        try {
            const userEmail = auth.currentUser?.email;
            await signOut(auth);
            console.log(`[AUTH] User logged out successfully: ${userEmail}`);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('[AUTH] Error logging out:', error);
        }
    };
 

    const handleDeleteAccount = async (password) => {
    const user = auth.currentUser;

    // basic checks first
    if (!user) {
        Alert.alert('Error', 'No user is signed in');
        return;
    }
    if (!password) {
        Alert.alert('Error', 'Enter your current password.');
        return;
    }
    if (!user.email) {
        Alert.alert('Error', 'This account is not email/password.');
        return;
    }

    try {
        // re-authenticate first
        const cred = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, cred);

        // now ask the user if they REALLY want to delete
        Alert.alert(
        'Are you sure?',
        'This action cannot be undone. Do you really want to delete your account?',
        [
            {
            text: 'Cancel',
            style: 'cancel',
            },
            {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
                try {
                // 1. delete firestore doc
                await deleteDoc(doc(db, 'users', user.uid));
                // 2. delete local/sqlite/asyncstorage stuff
                await dbLocal.deleteAllUserData(user.uid);
                // 3. delete auth user
                await deleteUser(user);
                // 4. confirmation alert
                Alert.alert('Done', 'Your account and user\'s data have been deleted.', [
                    {
                    text: 'OK',
                    onPress: () => {
                        navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                        });
                    },
                    },
                ]);
                } catch (err) {
                Alert.alert('Error', err?.message ?? String(err));
                } finally {
                setCurrentPassword('');
                setDeleting(false);
                }
            },
            },
        ]
        );
    } catch (e) {
        Alert.alert('Error', e?.message ?? String(e));
    }
};



    return (
        <View style={styles.container}>
            {deleting && (
                <View style={styles.deleteAccountScreen}>
                    <View style={styles.deleteBox}>
                    <Text style={styles.deleteTitle}>Delete Account</Text>
                    <Text style={styles.deleteMessage}>
                        Enter your password to confirm account deletion.
                    </Text>

                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter password"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />

                    <TouchableOpacity
                        onPress={() => handleDeleteAccount(currentPassword)}
                        style={styles.confirmButton}
                    >
                        <Text style={styles.confirmButtonText}>Delete</Text>
                    </TouchableOpacity>
                    <Text onPress={() => setDeleting(false)}>Cancel</Text>
                    </View>
                </View>
            )}
            <View style={styles.profileInfo}>
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.email}>{userEmail}</Text>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.deleteAccountButton}>
                <Text 
                    style={styles.deleteAccountButtonText}
                    onPress={() => setDeleting(true)}
                    >    
                        Delete Account
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    deleteAccountScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        },


   deleteBox: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
        },

    deleteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        },

    deleteMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        },

    cancelButton: {
        backgroundColor: '#ff4444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        },

    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        },
    passwordInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 15,
        fontSize: 16,
        },

    confirmButton: {
        backgroundColor: '#ff4444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
        },

    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        },

    profileInfo: {
        marginTop: 40,
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 350
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteAccountButton:{
        justifyContent: 'center',
        alignItems:'center',
    },

    deleteAccountButtonText:{
        fontSize: 16,
        color: '#ff4444'
    }
});
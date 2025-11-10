import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import db from '../utils/db';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const userEmail = auth.currentUser?.email;
    const [stats, setStats] = useState({
        random_meals_searched: 0,
        recipes_created: 0,
        favorites_added: 0
    });
    const [totalRecipes, setTotalRecipes] = useState(0);
    const [totalFavorites, setTotalFavorites] = useState(0);

    const loadStats = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            await db.initDB();

            // Get user stats
            const userStats = await db.getUserStats(user.uid);
            setStats(userStats);

            // Get actual counts
            const recipes = await db.getUserRecipes(user.uid);
            const favorites = await db.getFavorites(user.uid);
            setTotalRecipes(recipes.length);
            setTotalFavorites(favorites.length);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadStats();
        }, [])
    );

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

    const handleEmailPress = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Ionicons name="person-circle" size={80} color="#0782F9" />
                <Text style={styles.email}>{userEmail}</Text>
            </View>

            {/* Statistics Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Statistics</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Ionicons name="shuffle" size={32} color="#FF6B6B" />
                        <Text style={styles.statNumber}>{stats.random_meals_searched}</Text>
                        <Text style={styles.statLabel}>Random Meals</Text>
                        <Text style={styles.statSubLabel}>Discovered</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="restaurant" size={32} color="#0782F9" />
                        <Text style={styles.statNumber}>{totalRecipes}</Text>
                        <Text style={styles.statLabel}>My Recipes</Text>
                        <Text style={styles.statSubLabel}>Created</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons name="heart" size={32} color="#FF0000" />
                        <Text style={styles.statNumber}>{totalFavorites}</Text>
                        <Text style={styles.statLabel}>Favorites</Text>
                        <Text style={styles.statSubLabel}>Saved</Text>
                    </View>
                </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About FoodCodex</Text>
                <View style={styles.aboutCard}>
                    <Text style={styles.aboutText}>
                        FoodCodex is your all-in-one recipe companion, combining recipe discovery with personal cookbook management.
                    </Text>
                    <View style={styles.apiCredit}>
                        <Ionicons name="globe-outline" size={20} color="#0782F9" />
                        <Text style={styles.apiText}>Powered by TheMealDB API</Text>
                    </View>
                </View>
            </View>

            {/* Team Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Created by Team 3</Text>
                <View style={styles.teamCard}>
                    <Text style={styles.teamIntro}>Laurea University of Applied Sciences</Text>
                    <Text style={styles.teamSubtitle}>Building and Deploying Cross Platform Mobile Apps</Text>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.teamMember}
                        onPress={() => handleEmailPress('luka.raivisto@student.laurea.fi')}
                    >
                        <Ionicons name="person" size={20} color="#0782F9" />
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>Luka Raivisto</Text>
                            <Text style={styles.memberEmail}>luka.raivisto@student.laurea.fi</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.teamMember}
                        onPress={() => handleEmailPress('daniel.pozzoli@student.laurea.fi')}
                    >
                        <Ionicons name="person" size={20} color="#0782F9" />
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>Daniel Pozzoli</Text>
                            <Text style={styles.memberEmail}>daniel.pozzoli@student.laurea.fi</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.teamMember}
                        onPress={() => handleEmailPress('mika.venalainen@student.laurea.fi')}
                    >
                        <Ionicons name="person" size={20} color="#0782F9" />
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>Mika Venäläinen</Text>
                            <Text style={styles.memberEmail}>mika.venalainen@student.laurea.fi</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 4,
        textAlign: 'center',
    },
    statSubLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    aboutCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    aboutText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
        marginBottom: 16,
    },
    apiCredit: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    apiText: {
        fontSize: 14,
        color: '#0782F9',
        fontWeight: '600',
        marginLeft: 8,
    },
    teamCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    teamIntro: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    teamSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 16,
    },
    teamMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
    },
    memberInfo: {
        marginLeft: 12,
        flex: 1,
    },
    memberName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    memberEmail: {
        fontSize: 13,
        color: '#0782F9',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF6B6B',
        marginHorizontal: 16,
        marginTop: 30,
        paddingVertical: 14,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
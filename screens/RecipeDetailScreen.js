import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMealById, parseIngredients } from '../utils/api';
import { auth } from '../firebase';
import { addFavorite } from '../utils/db';

const RecipeDetailScreen = ({ route, navigation }) => {
    const { mealId } = route.params;
    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        loadMealDetails();
    }, [mealId]);

    const loadMealDetails = async () => {
        setLoading(true);
        const mealData = await getMealById(mealId);
        setMeal(mealData);
        setLoading(false);
    };

    const handleAddToFavorites = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert('Please sign in to add favorites');
            return;
        }

        if (!meal) return;

        const success = await addFavorite(user.uid, {
            meal_id: meal.idMeal,
            meal_name: meal.strMeal,
            meal_thumbnail: meal.strMealThumb,
        });

        if (success) {
            setIsFavorite(true);
            alert('Added to favorites!');
        }
    };

    const handleOpenYouTube = async () => {
        if (!meal?.strYoutube) return;

        try {
            const canOpen = await Linking.canOpenURL(meal.strYoutube);
            if (canOpen) {
                await Linking.openURL(meal.strYoutube);
            } else {
                alert('Unable to open YouTube link');
            }
        } catch (error) {
            console.error('Error opening YouTube link:', error);
            alert('Unable to open YouTube link');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0782F9" />
                <Text style={styles.loadingText}>Loading recipe...</Text>
            </View>
        );
    }

    if (!meal) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
                <Text style={styles.errorText}>Recipe not found</Text>
            </View>
        );
    }

    const ingredients = parseIngredients(meal);

    return (
        <ScrollView style={styles.container}>
            {/* Header Image */}
            <Image source={{ uri: meal.strMealThumb }} style={styles.headerImage} />

            {/* Title and Category */}
            <View style={styles.content}>
                <Text style={styles.title}>{meal.strMeal}</Text>

                <View style={styles.tags}>
                    {meal.strCategory && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{meal.strCategory}</Text>
                        </View>
                    )}
                    {meal.strArea && (
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{meal.strArea}</Text>
                        </View>
                    )}
                </View>

                {/* Add to Favorites Button */}
                <TouchableOpacity
                    style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                    onPress={handleAddToFavorites}
                    disabled={isFavorite}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite ? "#fff" : "#0782F9"}
                    />
                    <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
                        {isFavorite ? 'Added to Favorites' : 'Add to Favorites'}
                    </Text>
                </TouchableOpacity>

                {/* Ingredients */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {ingredients.map((item, index) => (
                        <View key={index} style={styles.ingredientRow}>
                            <Ionicons name="ellipse" size={8} color="#0782F9" style={styles.bullet} />
                            <Text style={styles.ingredientText}>
                                {item.measure} {item.name}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    <Text style={styles.instructionsText}>{meal.strInstructions}</Text>
                </View>

                {/* YouTube Link (if available) */}
                {meal.strYoutube && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Video Tutorial</Text>
                        <TouchableOpacity style={styles.youtubeButton} onPress={handleOpenYouTube}>
                            <Ionicons name="logo-youtube" size={24} color="#fff" />
                            <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default RecipeDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    headerImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    tags: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tag: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    tagText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    favoriteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#0782F9',
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 24,
    },
    favoriteButtonActive: {
        backgroundColor: '#0782F9',
        borderColor: '#0782F9',
    },
    favoriteButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#0782F9',
    },
    favoriteButtonTextActive: {
        color: '#fff',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    bullet: {
        marginRight: 8,
    },
    ingredientText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    instructionsText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
    },
    youtubeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF0000',
        paddingVertical: 12,
        borderRadius: 10,
    },
    youtubeButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMealById, parseIngredients } from '../utils/api';
import { auth } from '../firebase';
import db from '../utils/db';

const RecipeDetailScreen = ({ route, navigation }) => {
    const { mealId, userRecipeData } = route.params;
    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isUserRecipe, setIsUserRecipe] = useState(false);

    useEffect(() => {
        loadMealDetails();
        checkIfFavorite();
    }, [mealId]);

    const checkIfFavorite = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            await db.initDB();
            const favorites = await db.getFavorites(user.uid);
            const isFav = favorites.some(fav => fav.meal_id === mealId);
            setIsFavorite(isFav);
        } catch (error) {
            console.error('Error checking favorites:', error);
        }
    };

    const loadMealDetails = async () => {
        setLoading(true);

        // Check if this is a user recipe
        if (mealId?.startsWith('user_') && userRecipeData) {
            // Use the passed user recipe data directly
            setIsUserRecipe(true);
            setMeal({
                idMeal: userRecipeData.meal_id,
                strMeal: userRecipeData.meal_name,
                strMealThumb: userRecipeData.meal_thumbnail,
                strCategory: userRecipeData.category,
                strArea: userRecipeData.area,
                strInstructions: userRecipeData.instructions,
                // Convert ingredients back to meal format if needed
                ...(userRecipeData.ingredients ? { parsedIngredients: userRecipeData.ingredients } : {})
            });
            setLoading(false);
        } else {
            // Fetch from API for regular meals
            const mealData = await getMealById(mealId);
            setMeal(mealData);
            setIsUserRecipe(false);
            setLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to manage favorites');
            return;
        }

        if (!meal) return;

        if (isFavorite) {
            // Show confirmation dialog before removing
            Alert.alert(
                'Remove from Favorites',
                `Are you sure you want to remove "${meal.strMeal}" from your favorites?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                const success = await db.removeFavorite(user.uid, meal.idMeal);

                                if (success) {
                                    setIsFavorite(false);
                                    Alert.alert('Success', 'Removed from favorites!');
                                } else {
                                    Alert.alert('Error', 'Failed to remove from favorites');
                                }
                            } catch (error) {
                                console.error('Error removing favorite:', error);
                                Alert.alert('Error', 'Failed to remove from favorites');
                            }
                        }
                    }
                ]
            );
        } else {
            // Add to favorites (no confirmation needed)
            try {
                console.log('Adding to favorites:', meal.idMeal);
                const success = await db.addFavorite(user.uid, {
                    meal_id: meal.idMeal,
                    meal_name: meal.strMeal,
                    meal_thumbnail: meal.strMealThumb,
                    category: meal.strCategory,
                    area: meal.strArea,
                    instructions: meal.strInstructions,
                    ingredients: meal.parsedIngredients || parseIngredients(meal),
                });
                console.log('Add result:', success);

                if (success) {
                    setIsFavorite(true);
                    Alert.alert('Success', 'Added to favorites!');
                } else {
                    Alert.alert('Error', 'Failed to add to favorites');
                }
            } catch (error) {
                console.error('Error adding favorite:', error);
                Alert.alert('Error', 'Failed to add to favorites');
            }
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

    // Handle ingredients for both API meals and user recipes
    const ingredients = meal.parsedIngredients || parseIngredients(meal);

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

                {/* Add/Remove Favorites Button */}
                <TouchableOpacity
                    style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                    onPress={handleToggleFavorite}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite ? "#fff" : "#0782F9"}
                    />
                    <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
                        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Text>
                </TouchableOpacity>

                {/* Ingredients */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {ingredients && ingredients.length > 0 ? (
                        ingredients.map((item, index) => (
                            <View key={index} style={styles.ingredientRow}>
                                <Ionicons name="ellipse" size={8} color="#0782F9" style={styles.bullet} />
                                <Text style={styles.ingredientText}>
                                    {typeof item === 'string' ? item : `${item.measure || ''} ${item.name || ''}`}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.ingredientText}>No ingredients listed</Text>
                    )}
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
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
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

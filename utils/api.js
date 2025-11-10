import axios from 'axios';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// TheMealDB API Handler - All API calls for recipe data

// Search meal by name
export const searchMealsByName = async (query) => {
    try {
        const response = await axios.get(`${BASE_URL}/search.php?s=${query}`);
        return response.data.meals || [];
    } catch (error) {
        console.error('Error searching meals:', error);
        return [];
    }
};

// Get random meal
export const getRandomMeal = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/random.php`);
        return response.data.meals ? response.data.meals[0] : null;
    } catch (error) {
        console.error('Error fetching random meal:', error);
        return null;
    }
};

// Get meal by ID
export const getMealById = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/lookup.php?i=${id}`);
        return response.data.meals ? response.data.meals[0] : null;
    } catch (error) {
        console.error('Error fetching meal by ID:', error);
        return null;
    }
};

// Filter by category
export const filterByCategory = async (category) => {
    try {
        const response = await axios.get(`${BASE_URL}/filter.php?c=${category}`);
        return response.data.meals || [];
    } catch (error) {
        console.error('Error filtering by category:', error);
        return [];
    }
};

// Filter by area
export const filterByArea = async (area) => {
    try {
        const response = await axios.get(`${BASE_URL}/filter.php?a=${area}`);
        return response.data.meals || [];
    } catch (error) {
        console.error('Error filtering by area:', error);
        return [];
    }
};

// Get all categories
export const getAllCategories = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/categories.php`);
        return response.data.categories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// Get all areas
export const getAllAreas = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/list.php?a=list`);
        return response.data.meals || [];
    } catch (error) {
        console.error('Error fetching areas:', error);
        return [];
    }
};

// Helper function to parse ingredients from meal object-  TheMealDB returns ingredients as strIngredient1, strIngredient2, etc
export const parseIngredients = (meal) => {
    if (!meal) return [];

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== '') {
            ingredients.push({
                name: ingredient,
                measure: measure || '',
            });
        }
    }
    return ingredients;
};

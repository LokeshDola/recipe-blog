import React from 'react';
import { Link } from 'react-router-dom';

function RecipeCard({ recipe }) {
    // UPDATED for deployment
    const API_URL = process.env.REACT_APP_API_URL;

    // This logic handles both local images (from uploads) and internet URLs
    const imageUrl = recipe.image.startsWith('/uploads')
        ? `${API_URL}${recipe.image}`
        : recipe.image;

    const getIngredientText = (count) => {
        if (!count) return '';
        if (count === 1) return '1 ingredient';
        return `${count} ingredients`;
    };

    return (
        <Link to={`/recipe/${recipe.id}`} className="recipe-card">
            <img src={imageUrl} alt={recipe.title} />
            <div className="recipe-card-content">
                <h3>{recipe.title}</h3>
                <div className="recipe-card-meta">
                    <span>🕒 {recipe.cookTime} min</span>
                    {recipe.ingredients && <span>{getIngredientText(recipe.ingredients.length)}</span>}
                </div>
            </div>
        </Link>
    );
}

export default RecipeCard;
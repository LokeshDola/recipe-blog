import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function RecipeDetailPage() {
    const [recipe, setRecipe] = useState(null);
    const { id } = useParams();
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    const API_URL = "http://127.0.0.1:5000";

    useEffect(() => {
        axios.get(`${API_URL}/api/recipes/${id}`)
            .then(response => { setRecipe(response.data); })
            .catch(error => { console.error("Error fetching recipe!", error); });
    }, [id]);

    if (!recipe) return <div>Loading...</div>;

    const isOwner = loggedInUser && loggedInUser.id === recipe.userId;

    return (
        <div className="container">
            <article className="recipe-detail">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{recipe.title}</h1>
                    {isOwner && (
                        <Link to={`/recipe/edit/${recipe.id}`} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                            Edit Recipe
                        </Link>
                    )}
                </div>
                 {/* Simplified logic: Always use the full URL */}
                <img src={`${API_URL}${recipe.image}`} alt={recipe.title} />
                <div className="recipe-detail-section">
                    <h2>Ingredients</h2>
                    <ul>
                        {recipe.ingredients?.map((ingredient, index) => <li key={index}>{ingredient}</li>)}
                    </ul>
                </div>
                <div className="recipe-detail-section">
                    <h2>Instructions</h2>
                    <ol>
                        {recipe.instructions?.map((step, index) => <li key={index}>{step}</li>)}
                    </ol>
                </div>
            </article>
        </div>
    );
}
export default RecipeDetailPage;
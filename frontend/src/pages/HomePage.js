import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';

const API_URL = "http://127.0.0.1:5000";

function HomePage() {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        axios.get(`${API_URL}/api/recipes`)
            .then(response => { setRecipes(response.data); })
            .catch(error => { console.error("Error fetching recipes!", error); });
    }, []);

    const filteredRecipes = recipes.filter(recipe => {
        const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', 'Indian', 'Italian', 'Chinese', 'Dessert'];

    return (
        <div className="container">
            <header className="hero">
                {user && <h2 style={{ fontWeight: 'normal' }}>Welcome to Recipe Blog, {user.username}</h2>}
                <h1>Enjoy Every Meal</h1>
                <p>Food Junction: Explore Any Variety Of Food</p>
                <div className="category-filters">
                    {categories.map(category => (
                        <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => setSelectedCategory(category)}>
                            {category}
                        </button>
                    ))}
                </div>
                <div style={{ margin: '2rem 0', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                    <input type="text" placeholder="Search for recipes by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px' }}/>
                </div>
            </header>
            <main className="recipe-grid">
                {filteredRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </main>
        </div>
    );
}
export default HomePage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = "http://127.0.0.1:5000";

function EditRecipePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [category, setCategory] = useState('Indian');
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/recipes/${id}`);
                const recipe = response.data;
                setTitle(recipe.title); setCookTime(recipe.cookTime); setCategory(recipe.category);
                setIngredients(recipe.ingredients.join('\n')); setInstructions(recipe.instructions.join('\n'));
                setCurrentImageUrl(API_URL + recipe.image);
            } catch (error) { console.error("Failed to fetch recipe", error); }
        };
        fetchRecipe();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { alert('You must be logged in.'); return; }
        const formData = new FormData();
        formData.append('title', title); formData.append('cookTime', cookTime); formData.append('category', category);
        formData.append('ingredients', ingredients); formData.append('instructions', instructions); formData.append('userId', user.id);
        if (imageFile) { formData.append('image', imageFile); }
        try {
            await axios.put(`${API_URL}/api/recipes/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate(`/recipe/${id}`);
        } catch (error) { console.error('Failed to update recipe', error); }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1>Edit Recipe</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px' }}/></div>
                <div style={{ marginBottom: '1rem' }}><label>Ingredients</label><textarea value={ingredients} onChange={e => setIngredients(e.target.value)} required style={{ width: '100%', padding: '8px', minHeight: '120px' }}></textarea></div>
                <div style={{ marginBottom: '1rem' }}><label>Instructions</label><textarea value={instructions} onChange={e => setInstructions(e.target.value)} required style={{ width: '100%', padding: '8px', minHeight: '150px' }}></textarea></div>
                <div style={{ marginBottom: '1rem' }}><label>Cook Time (minutes)</label><input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} required style={{ width: '100%', padding: '8px' }}/></div>
                <div style={{ marginBottom: '1rem' }}><label>Category</label><select value={category} onChange={e => setCategory(e.target.value)} required style={{ width: '100%', padding: '8px' }}><option value="Indian">Indian</option><option value="Italian">Italian</option><option value="Chinese">Chinese</option><option value="Dessert">Dessert</option></select></div>
                <div style={{ marginBottom: '1rem' }}><label>Change Image (Optional)</label>{currentImageUrl && <img src={currentImageUrl} alt="Current recipe" style={{ width: '100%', borderRadius: '8px', margin: '10px 0' }} />}<input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" style={{ width: '100%', padding: '8px' }}/></div>
                <button type="submit" style={{ padding: '10px 20px' }}>Update Recipe</button>
            </form>
        </div>
    );
}
export default EditRecipePage;
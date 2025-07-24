import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // UPDATED FOR DEPLOYMENT

function AddRecipePage() {
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [cookTime, setCookTime] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [category, setCategory] = useState('Indian');
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !imageFile) { alert('Please fill all fields and select an image.'); return; }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('ingredients', ingredients);
        formData.append('instructions', instructions);
        formData.append('cookTime', cookTime);
        formData.append('userId', user.id);
        formData.append('image', imageFile);
        formData.append('category', category);
        try {
            await axios.post(`${API_URL}/api/recipes`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/');
        } catch (error) { console.error('Failed to add recipe', error); }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1>Add a New Recipe</h1>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}><label>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px' }}/></div>
                <div style={{ marginBottom: '1rem' }}><label>Ingredients</label><textarea value={ingredients} onChange={e => setIngredients(e.target.value)} required placeholder="Enter each ingredient on a new line" style={{ width: '100%', padding: '8px', minHeight: '120px' }}></textarea></div>
                <div style={{ marginBottom: '1rem' }}><label>Instructions</label><textarea value={instructions} onChange={e => setInstructions(e.target.value)} required placeholder="Enter each step on a new line" style={{ width: '100%', padding: '8px', minHeight: '150px' }}></textarea></div>
                <div style={{ marginBottom: '1rem' }}><label>Cook Time (minutes)</label><input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} required style={{ width: '100%', padding: '8px' }}/></div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
                        <option value="Indian">Indian</option>
                        <option value="Italian">Italian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Dessert">Dessert</option>
                    </select>
                </div>
                <div style={{ marginBottom: '1rem' }}><label>Image</label><input type="file" onChange={e => setImageFile(e.target.files[0])} accept="image/*" required style={{ width: '100%', padding: '8px' }}/></div>
                <button type="submit" style={{ padding: '10px 20px' }}>Add Recipe</button>
            </form>
        </div>
    );
}
export default AddRecipePage;
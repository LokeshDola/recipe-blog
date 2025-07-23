import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = "http://127.0.0.1:5000";

// Star Rating Component
const StarRating = ({ rating }) => {
    return (
        <div>
            {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return ( <span key={index} style={{ color: ratingValue <= rating ? '#ffc107' : '#e4e5e9' }}>&#9733;</span> );
            })}
        </div>
    );
};

function RecipeDetailPage() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/recipes/${id}/reviews`);
            setReviews(response.data);
        } catch (error) { console.error("Error fetching reviews!", error); }
    };

    useEffect(() => {
        const fetchRecipeDetails = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/recipes/${id}`);
                setRecipe(response.data);
            } catch (error) { console.error("Error fetching recipe details!", error); }
        };
        fetchRecipeDetails();
        fetchReviews();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!loggedInUser) { alert('You must be logged in to post a review.'); return; }
        try {
            await axios.post(`${API_URL}/api/recipes/${id}/reviews`, {
                rating: newRating,
                comment: newComment,
                userId: loggedInUser.id
            });
            setNewRating(5);
            setNewComment('');
            fetchReviews();
        } catch (error) { alert(error.response?.data?.error || 'Failed to post review.'); }
    };

    if (!recipe) return <div>Loading...</div>;

    const isOwner = loggedInUser && loggedInUser.id === recipe.userId;
    const imageUrl = recipe.image.startsWith('/uploads') ? `${API_URL}${recipe.image}` : recipe.image;

    return (
        <div className="container">
            <article className="recipe-detail">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{recipe.title}</h1>
                    {isOwner && <Link to={`/recipe/edit/${recipe.id}`} style={{ padding: '8px 16px' }}>Edit Recipe</Link>}
                </div>
                <img src={imageUrl} alt={recipe.title} />
                <div className="recipe-detail-section"><h2>Ingredients</h2><ul>{recipe.ingredients?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div className="recipe-detail-section"><h2>Instructions</h2><ol>{recipe.instructions?.map((step, i) => <li key={i}>{step}</li>)}</ol></div>
            </article>
            <div className="reviews-section">
                <h2>Reviews</h2>
                <form onSubmit={handleReviewSubmit} className="review-form">
                    <h3>Leave a Review</h3>
                    <div>
                        <label>Rating</label>
                        <select value={newRating} onChange={(e) => setNewRating(parseInt(e.target.value))} style={{ padding: '8px', marginLeft: '10px' }}>
                            <option value={5}>5 Stars</option> <option value={4}>4 Stars</option> <option value={3}>3 Stars</option> <option value={2}>2 Stars</option> <option value={1}>1 Star</option>
                        </select>
                    </div>
                    <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment..." required />
                    <button type="submit">Submit Review</button>
                </form>
                <div className="reviews-list">
                    {reviews.length > 0 ? ( reviews.map(review => ( <div key={review.id} className="review-card"> <strong>{review.user}</strong> <StarRating rating={review.rating} /> <p>{review.comment}</p> <small>{review.timestamp}</small> </div> ))) : ( <p>No reviews yet. Be the first to leave one!</p> )}
                </div>
            </div>
        </div>
    );
}
export default RecipeDetailPage;    
import os, random, re
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

app = Flask(__name__)
CORS(app)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    reviews = db.relationship('Review', backref='user', lazy=True)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    cook_time = db.Column(db.Integer, nullable=False)
    image = db.Column(db.String(120), nullable=False)
    ingredients = db.Column(db.Text, nullable=False)
    instructions = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    reviews = db.relationship('Review', backref='recipe', lazy=True, cascade="all, delete-orphan")
    def to_dict(self):
        return { "id": self.id, "userId": self.user_id, "title": self.title, "cookTime": self.cook_time, "image": self.image, "ingredients": self.ingredients.split('\n'), "instructions": self.instructions.split('\n'), "category": self.category }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    def to_dict(self):
        return { "id": self.id, "rating": self.rating, "comment": self.comment, "timestamp": self.timestamp.strftime('%Y-%m-%d %H:%M:%S'), "user": self.user.username }

def validate_password(password):
    if len(password) < 8 or not re.search("[a-z]", password) or not re.search("[A-Z]", password) or not re.search("[0-9]", password) or not re.search("[!@#$%^&*()]", password):
        return False
    return True

@app.route('/uploads/<filename>')
def uploaded_file(filename): return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    if not all([username, password]): return jsonify({"error": "Username and password are required"}), 400
    if User.query.filter_by(username=username).first(): return jsonify({"error": "Username is already taken"}), 409
    if not validate_password(password): return jsonify({"error": "Password does not meet complexity requirements"}), 400
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user); db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Login successful", "user": {"id": user.id, "username": user.username}}), 200
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/recipes', methods=['GET'])
def get_all_recipes(): return jsonify([recipe.to_dict() for recipe in Recipe.query.all()])

# THIS IS THE MISSING FUNCTION
@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if recipe: return jsonify(recipe.to_dict())
    return jsonify({"error": "Recipe not found"}), 404

@app.route('/api/recipes', methods=['POST'])
def add_recipe():
    if 'image' not in request.files: return jsonify({"error": "No image file provided"}), 400
    file = request.files['image']; filename = file.filename
    if filename == '': return jsonify({"error": "No selected file"}), 400
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    data = request.form
    new_recipe = Recipe(title=data['title'], cook_time=int(data['cookTime']), image=f"/uploads/{filename}", ingredients=data['ingredients'], instructions=data['instructions'], user_id=int(data['userId']), category=data['category'])
    db.session.add(new_recipe); db.session.commit(); return jsonify(new_recipe.to_dict()), 201

@app.route('/api/recipes/<int:recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if not recipe: return jsonify({"error": "Recipe not found"}), 404
    data = request.form; user_id = int(data.get('userId'))
    if recipe.user_id != user_id: return jsonify({"error": "Forbidden"}), 403
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            filename = file.filename; file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename)); recipe.image = f"/uploads/{filename}"
    recipe.title = data.get('title', recipe.title); recipe.cook_time = int(data.get('cookTime', recipe.cook_time)); recipe.ingredients = data.get('ingredients', recipe.ingredients); recipe.instructions = data.get('instructions', recipe.instructions); recipe.category = data.get('category', recipe.category)
    db.session.commit(); return jsonify(recipe.to_dict()), 200

@app.route('/api/recipes/<int:recipe_id>/reviews', methods=['GET'])
def get_reviews(recipe_id):
    reviews = Review.query.filter_by(recipe_id=recipe_id).order_by(Review.timestamp.desc()).all()
    return jsonify([review.to_dict() for review in reviews])

@app.route('/api/recipes/<int:recipe_id>/reviews', methods=['POST'])
def post_review(recipe_id):
    data = request.get_json(); user_id = data.get('userId'); rating = data.get('rating'); comment = data.get('comment')
    if not all([user_id, rating]): return jsonify({"error": "User ID and rating are required"}), 400
    if Review.query.filter_by(user_id=user_id, recipe_id=recipe_id).first(): return jsonify({"error": "You have already reviewed this recipe"}), 409
    new_review = Review(rating=rating, comment=comment, user_id=user_id, recipe_id=recipe_id); db.session.add(new_review); db.session.commit()
    return jsonify(new_review.to_dict()), 201

def seed_database():
    if User.query.count() == 0:
        hashed_password = bcrypt.generate_password_hash('Password123!').decode('utf-8')
        default_user = User(username="admin", password=hashed_password)
        db.session.add(default_user); db.session.commit()
    if Recipe.query.count() == 0:
        print("Seeding database with recipes...")
        user1 = User.query.filter_by(username="admin").first()
        recipes_to_add = [
            Recipe(title="Spaghetti Carbonara", cook_time=25, image="/uploads/spaghetti.jpg", ingredients="Spaghetti\nEggs\nPecorino Cheese\nGuanciale\nBlack Pepper", instructions="Boil spaghetti.\nFry guanciale.\nCombine.", user_id=user1.id, category="Italian"),
            Recipe(title="Margherita Pizza", cook_time=20, image="/uploads/pizza.jpg", ingredients="Pizza Dough\nTomato Sauce\nMozzarella\nBasil", instructions="Top dough with ingredients.\nBake until golden.", user_id=user1.id, category="Italian"),
            Recipe(title="Chicken Curry", cook_time=45, image="/uploads/chicken.jpg", ingredients="Chicken\nOnion\nGarlic\nGinger\nSpices", instructions="Sauté aromatics.\nAdd chicken and spices.\nSimmer.", user_id=user1.id, category="Indian"),
            Recipe(title="Palak Paneer", cook_time=30, image="/uploads/paneer.jpg", ingredients="Spinach\nPaneer\nOnion\nTomatoes\nCream", instructions="Blanch spinach.\nMake gravy.\nAdd paneer.", user_id=user1.id, category="Indian"),
            Recipe(title="Kung Pao Chicken", cook_time=30, image="/uploads/kungpao.jpg", ingredients="Chicken\nPeanuts\nBell Peppers\nSoy Sauce\nVinegar", instructions="Marinate chicken.\nStir-fry ingredients.\nAdd sauce.", user_id=user1.id, category="Chinese"),
            Recipe(title="Spring Rolls", cook_time=25, image="/uploads/springrolls.jpg", ingredients="Wrappers\nCabbage\nCarrots\nBean Sprouts", instructions="Prepare filling.\nWrap and fry until golden.", user_id=user1.id, category="Chinese"),
            Recipe(title="Chocolate Lava Cake", cook_time=22, image="/uploads/chocolava.jpg", ingredients="Dark Chocolate\nButter\nEggs\nSugar\nFlour", instructions="Melt chocolate and butter.\nWhisk eggs and sugar.\nCombine and bake.", user_id=user1.id, category="Dessert"),
            Recipe(title="Classic Cheesecake", cook_time=90, image="/uploads/chesecake.jpg", ingredients="Cream Cheese\nSugar\nEggs\nGraham Cracker Crust\nVanilla", instructions="Make crust.\nMix filling.\nBake and chill.", user_id=user1.id, category="Dessert"),
            Recipe(title="Fudgy Brownies", cook_time=40, image="/uploads/brownies.jpg", ingredients="Flour\nCocoa Powder\nSugar\nButter\nEggs", instructions="Melt butter and chocolate.\nMix in other ingredients.\nBake until set.", user_id=user1.id, category="Dessert"),
            Recipe(title="Classic Tiramisu", cook_time=30, image="/uploads/classictiramisu.jpg", ingredients="Ladyfingers\nEspresso\nMascarpone\nEggs\nCocoa Powder", instructions="Dip ladyfingers in coffee.\nLayer with mascarpone cream.\nChill and dust with cocoa.", user_id=user1.id, category="Dessert")
        ]
        db.session.add_all(recipes_to_add); db.session.commit()

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER): os.makedirs(UPLOAD_FOLDER)
    with app.app_context():
        db.create_all()
        seed_database()
    app.run(debug=True, port=5000)
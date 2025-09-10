from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class SuccessStory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(50), nullable=True) # Optional field
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

from flask import Flask, request, jsonify
from flask_cors import CORS

# ... (import and model definition from above) ...

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///stories.db'
CORS(app)
db.init_app(app)

@app.route('/stories', methods=['GET'])
def get_stories():
    stories = SuccessStory.query.order_by(SuccessStory.timestamp.desc()).all()
    return jsonify([{
        'id': story.id,
        'title': story.title,
        'content': story.content,
        'author': story.author,
        'location': story.location,
        'timestamp': story.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for story in stories])

@app.route('/stories', methods=['POST'])
def post_story():
    data = request.json
    new_story = SuccessStory(
        title=data['title'],
        content=data['content'],
        author=data['author'],
        location=data.get('location', '') # Use .get for optional fields
    )
    db.session.add(new_story)
    db.session.commit()
    return jsonify({'message': 'Story submitted successfully!'}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # This creates the tables based on your models
    app.run(debug=True)

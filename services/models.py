# from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt
# from datetime import datetime

# db = SQLAlchemy()
# bcrypt = Bcrypt()

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     password_hash = db.Column(db.String(128), nullable=False)
#     role = db.Column(db.String(20), nullable=False, default='buyer')

#     def set_password(self, password):
#         self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

#     def check_password(self, password):
#         return bcrypt.check_password_hash(self.password_hash, password)

# class Story(db.Model):
#     id = db.Column(db.String(36), primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     title = db.Column(db.String(200), nullable=False)
#     summary = db.Column(db.Text)
#     full_story = db.Column(db.Text)
#     craft_type = db.Column(db.String(100))
#     artisan_name = db.Column(db.String(100))
#     workshop_location = db.Column(db.String(200))
#     materials_used = db.Column(db.Text)
#     creation_process = db.Column(db.Text)
#     cultural_significance = db.Column(db.Text)
#     heritage_category = db.Column(db.String(50))
#     heritage_score = db.Column(db.Integer, default=0)
#     rarity_score = db.Column(db.Integer, default=0)
#     image_url = db.Column(db.String(500))
#     ar_model_url = db.Column(db.String(500))
#     tags = db.Column(db.Text)
#     visual_description = db.Column(db.Text)
#     likes_count = db.Column(db.Integer, default=0)
#     comments_count = db.Column(db.Integer, default=0)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# class Like(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     story_id = db.Column(db.String(36), db.ForeignKey('story.id'), nullable=False)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

# class Comment(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     story_id = db.Column(db.String(36), db.ForeignKey('story.id'), nullable=False)
#     content = db.Column(db.Text, nullable=False)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)




from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='buyer')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class Story(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    summary = db.Column(db.Text)
    full_story = db.Column(db.Text)
    craft_type = db.Column(db.String(100))
    artisan_name = db.Column(db.String(100))
    workshop_location = db.Column(db.String(200))
    materials_used = db.Column(db.Text)
    creation_process = db.Column(db.Text)
    cultural_significance = db.Column(db.Text)
    heritage_category = db.Column(db.String(50))
    heritage_score = db.Column(db.Integer, default=0)
    rarity_score = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(500))
    ar_model_url = db.Column(db.String(500))
    tags = db.Column(db.Text)  # JSON string
    visual_description = db.Column(db.Text)
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    
    # Blockchain fields
    blockchain_tx_hash = db.Column(db.String(66))  # Ethereum tx hash
    blockchain_block_number = db.Column(db.Integer)
    blockchain_story_hash = db.Column(db.String(64))  # SHA256 hash
    blockchain_network = db.Column(db.String(50))
    blockchain_explorer_url = db.Column(db.String(500))
    nft_token_id = db.Column(db.Integer)
    nft_contract_address = db.Column(db.String(42))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    story_id = db.Column(db.String(36), db.ForeignKey('story.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    story_id = db.Column(db.String(36), db.ForeignKey('story.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
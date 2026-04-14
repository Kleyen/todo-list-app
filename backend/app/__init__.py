import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()

def create_app():
    frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    app = Flask(__name__, static_folder=frontend_path, static_url_path='')
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    from .routes import tasks_bp
    app.register_blueprint(tasks_bp)

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    with app.app_context():
        db.create_all()

    return app
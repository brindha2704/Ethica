import sys
import os

# Define the backend directory
backend_dir = os.path.join(os.path.dirname(__file__), "..", "ethica-backend")
sys.path.append(backend_dir)

# Import the app from main.py in ethica-backend
from main import app

# Initialize the database within the application context
from database.schema import init_db
with app.app_context():
    init_db()

# Vercel looks for 'app' in api/index.py
app = app

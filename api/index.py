import sys
import os

# Define the backend directory
backend_dir = os.path.join(os.path.dirname(__file__), "..", "ethica-backend")
sys.path.append(backend_dir)

# Import the app from main.py in ethica-backend
from main import app
from database.schema import init_db

# Initialize database only if DATABASE_URL is present, and skip if it already exists or if on Vercel
# (init_db is idempotent but let's be careful in serverless env)
with app.app_context():
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization skip/fail: {e}")

# Vercel looks for 'app' in api/index.py
app = app

import sys
import os

# Define the backend directory
backend_dir = os.path.join(os.path.dirname(__file__), "..", "ethica-backend")
sys.path.append(backend_dir)

# Import the app from main.py in ethica-backend
from main import app
import subprocess

# Log installed packages for debugging
try:
    pkgs = subprocess.check_output([sys.executable, "-m", "pip", "freeze"]).decode()
    print("INSTALLED PACKAGES:\n", pkgs)
except:
    print("Could not list packages")

# Vercel looks for 'app' in api/index.py
with app.app_context():
    try:
        from database.schema import init_db
        init_db()
    except Exception as e:
        print(f"Startup DB Error: {e}")

app = app

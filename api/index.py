import sys
import os

# Add ethica-backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "ethica-backend"))

from main import app

# Vercel needs 'app' to be exposed
# We also need to ensure the DB is initialized if it's the first run
from database.schema import init_db
with app.app_context():
    init_db()

# Export for Vercel
app = app

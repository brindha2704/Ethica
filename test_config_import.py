import sys
import os
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'ethica-backend'))
sys.path.append(backend_dir)
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, '.env'))
from core.config import DATABASE_URL
print(f"DATABASE_URL: {DATABASE_URL}")

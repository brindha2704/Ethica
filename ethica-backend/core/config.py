import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_NAME = os.path.join(BASE_DIR, "ethica.db")
TOKENS_DB_NAME = os.path.join(BASE_DIR, "tokens.db")

SECRET_KEY = os.getenv("SECRET_KEY", "ethica_default_fallback_key")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

VALID_ROLES = {"admin", "hr", "manager", "employee"}

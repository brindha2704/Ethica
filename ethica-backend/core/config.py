import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
DB_NAME = os.path.join(BASE_DIR, "ethica.db")
TOKENS_DB_NAME = os.path.join(BASE_DIR, "tokens.db")

SECRET_KEY = os.getenv("SECRET_KEY", "ethica_default_fallback_key")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://ethica-two.vercel.app,https://ethica-ljlnnv6pg-brindha2704s-projects.vercel.app").split(",")

VALID_ROLES = {"admin", "hr", "manager", "employee"}

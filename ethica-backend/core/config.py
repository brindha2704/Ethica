import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "ethica_default_fallback_key")

if os.getenv("VERCEL"):
    if not DATABASE_URL:
        # We will handle the missing URL error in db_manager for better error reporting
        pass
    if SECRET_KEY == "ethica_default_fallback_key":
        # Warning/Fallback for build step if needed
        pass

DB_NAME = os.path.join(BASE_DIR, "ethica.db")
TOKENS_DB_NAME = os.path.join(BASE_DIR, "tokens.db")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*,https://ethica-git-main-brindha2704s-projects.vercel.app").split(",")

VALID_ROLES = {"admin", "hr", "manager", "employee"}

import psycopg2
import os
from dotenv import load_dotenv

# Path to the .env file in ethica-backend
dotenv_path = os.path.join(os.getcwd(), "ethica-backend", ".env")
load_dotenv(dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Testing connection to: {DATABASE_URL[:20]}...")

try:
    conn = psycopg2.connect(DATABASE_URL)
    print("Connection successful!")
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = cur.fetchall()
    print(f"Tables found: {[t[0] for t in tables]}")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")

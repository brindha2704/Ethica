import sys
import os

# Add the backend directory to the path so we can import our modules
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'ethica-backend'))
sys.path.append(backend_dir)

# Load env before importing our config
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, '.env'))

from database.schema import init_db
from database.db_manager import get_db, get_db_cursor, get_placeholder
from werkzeug.security import generate_password_hash
from datetime import datetime

def migrate():
    print("Starting migration to Supabase...")
    
    # Initialize schema
    init_db()
    
    # Check if admin already exists
    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    
    db.execute(f"SELECT * FROM users WHERE email = {p}", ("admin@ethica.com",))
    if not db.fetchone():
        print("Seeding initial admin user...")
        db.execute(f"""
            INSERT INTO users (firstName, lastName, email, password, role)
            VALUES ({p}, {p}, {p}, {p}, {p})
        """, ("Admin", "System", "admin@ethica.com", generate_password_hash("admin123"), "admin"))
        conn.commit()
        print("Admin user created.")
    else:
        print("Admin user already exists.")
    
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()

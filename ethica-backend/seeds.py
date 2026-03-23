
import sqlite3
from werkzeug.security import generate_password_hash
import random
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_NAME = "ethica.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# 1 Manager
# 3 HRs (Technical, Designing, Sales)
# ~30 Employees distributed

users_config = [
    # Admin
    ("John", "Smith", "admin@ethica.com", "SuperAdmin@2024", "admin", "Management"),

    # Manager
    ("David", "Jones", "david.j@ethica.com", "Mgr_Lead$99", "manager", "Management"),

    # HR Team
    ("Sarah", "Williams", "sarah.w@ethica.com", "HR_Exact#2024", "hr", "Technical"),
    ("Michael", "Brown", "michael.b@ethica.com", "HR_Exact#2024", "hr", "Designing"),
    ("Emily", "Davis", "emily.d@ethica.com", "HR_Exact#2024", "hr", "Sales"),
]

# Employee Pool
# Explicitly define employees per department to ensure 4 per HR
# Explicitly define employees with full credentials (email, password, etc.)
employees = [
    # Technical Team
    ("Mary", "Miller", "mary.m@ethica.com", "Work@Force_01", "employee", "Technical"),
    ("Richard", "Thomas", "richard.t@ethica.com", "Work@Force_01", "employee", "Technical"),
    ("Susan", "Harris", "susan.h@ethica.com", "Work@Force_01", "employee", "Technical"),
    ("Thomas", "Garcia", "thomas.g@ethica.com", "Work@Force_01", "employee", "Technical"),
    ("James", "Rodriguez", "james.r@ethica.com", "Work@Force_01", "employee", "Technical"),

    # Designing Team
    ("William", "Taylor", "william.t@ethica.com", "Work@Force_01", "employee", "Designing"),
    ("Barbara", "Jackson", "barbara.j@ethica.com", "Work@Force_01", "employee", "Designing"),
    ("Charles", "Martin", "charles.m@ethica.com", "Work@Force_01", "employee", "Designing"),
    ("Lisa", "Martinez", "lisa.m@ethica.com", "Work@Force_01", "employee", "Designing"),

    # Sales Team
    ("Linda", "Anderson", "linda.a@ethica.com", "Work@Force_01", "employee", "Sales"),
    ("Joseph", "White", "joseph.w@ethica.com", "Work@Force_01", "employee", "Sales"),
    ("Jessica", "Thompson", "jessica.t@ethica.com", "Work@Force_01", "employee", "Sales"),
    ("Christopher", "Robinson", "christopher.r@ethica.com", "Work@Force_01", "employee", "Sales"),
]

# Combine all users
all_users = users_config + employees

def seed():
    conn = get_db()
    db = conn.cursor()

    print("Cleaning old data...")
    db.execute("DELETE FROM tokens")
    db.execute("DELETE FROM sqlite_sequence WHERE name='tokens'")
    db.execute("DELETE FROM users")
    db.execute("DELETE FROM sqlite_sequence WHERE name='users'")
    db.execute("DELETE FROM tasks")
    db.execute("DELETE FROM sqlite_sequence WHERE name='tasks'")
    db.execute("DELETE FROM notifications")
    db.execute("DELETE FROM escalation_logs")

    print(f"Seeding {len(all_users)} users...")
    
    # Track HR IDs for later assignment reference if needed
    hr_ids = {} 
    
    for user in all_users:
        first, last, email, pwd, role, dept = user
        hashed_pw = generate_password_hash(pwd)
        
        try:
            # Insert User
            cursor = db.execute(
                "INSERT INTO users (firstName, lastName, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)",
                (first, last, email, hashed_pw, role, dept)
            )
            user_id = cursor.lastrowid
            
            if role == 'hr':
                hr_ids[dept] = user_id

            # Generate Token
            payload = {
                "id": user_id,
                "exp": datetime.utcnow() + timedelta(days=1) # 24 hour token
            }
            token = jwt.encode(payload, os.getenv("SECRET_KEY", "ethica_default_fallback_key"), algorithm="HS256")
            
            # Insert Token
            db.execute(
                "INSERT INTO tokens (user_id, token, created_at) VALUES (?, ?, ?)",
                (user_id, token, datetime.utcnow().isoformat())
            )

        except sqlite3.IntegrityError:
            print(f"Skipping {email}, already exists.")

    print("Users and Tokens seeded successfully!")
    # Generate Tasks for Employees
    print("Generating tasks...")
    
    # Re-fetch users to get their IDs
    db.execute("SELECT id, firstName, lastName, role, department FROM users WHERE role='employee'")
    employee_rows = db.fetchall()

    tasks_data = []
    
    task_templates = {
        "Technical": ["API Integration", "Database Optimization", "Bug Fix #102", "Unit Testing", "Security Audit", "Frontend Refactor"],
        "Designing": ["UI Mockup", "Logo Redesign", "User Research", "Wireframing", "Asset Creation", "Style Guide Update"],
        "Sales": ["Client Call", "Market Analysis", "Lead Generation", "Proposal Writing", "Contract Review", "Quarterly Plan"]
    }

    statuses = ["pending", "in_progress", "completed", "overdue"]
    
    for emp in employee_rows:
        # Assign 2-3 tasks per employee
        num_tasks = random.randint(2, 3)
        dept = emp["department"]
        
        for _ in range(num_tasks):
            title = random.choice(task_templates.get(dept, ["General Task"]))
            status = random.choice(statuses)
            
            # Due Date Logic
            if status == "overdue":
                days_ago = random.randint(1, 10)
                due_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
                escalation = "Warning" if days_ago == 1 else "HR Notified" if days_ago == 2 else "Critical"
            elif status == "completed":
                 due_date = (datetime.now() - timedelta(days=random.randint(1, 5))).strftime("%Y-%m-%d")
                 escalation = "Normal"
            else:
                due_date = (datetime.now() + timedelta(days=random.randint(2, 14))).strftime("%Y-%m-%d")
                escalation = "Normal"

            tasks_data.append((
                title, 
                f"{emp['firstName']} {emp['lastName']}", 
                "employee", 
                status, 
                due_date, 
                "manager", # Created by Role
                emp["id"], 
                f"{dept} Project A", 
                "Acme Corp" if random.choice([True, False]) else "Global Ind",
                None, # Employee Report
                datetime.utcnow().isoformat(),
                escalation
            ))

    db.executemany("""
        INSERT INTO tasks (
            title, assignee_name, assignee_role, status, due_date, created_by_role,
            assignee_user_id, project_name, client_name, employee_report, updated_at, escalation_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, tasks_data)

    print(f"Seeded {len(tasks_data)} tasks.")
    conn.commit()
    conn.close()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed()

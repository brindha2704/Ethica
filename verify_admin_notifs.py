import sqlite3
import os
from datetime import datetime, timedelta

def verify_admin_notifications():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "ethica-backend", "ethica.db")
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    db = conn.cursor()
    
    # 1. Clear existing notifications for a clean test
    # db.execute("DELETE FROM notifications")
    
    # 2. Find an admin user
    db.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    admin = db.fetchone()
    if not admin:
        print("No admin user found!")
        return
    admin_id = admin["id"]
    
    # 3. Create a task that is overdue
    # Find an employee
    db.execute("SELECT id, department, firstName, lastName FROM users WHERE role = 'employee' LIMIT 1")
    emp = db.fetchone()
    if not emp:
        print("No employee found!")
        return
    
    past_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
    db.execute("""
        INSERT INTO tasks (title, due_date, status, escalation_level, assignee_user_id, assignee_name, updated_at, assignee_role, created_by_role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, ("Test Overdue Task", past_date, "pending", "Normal", emp["id"], f"{emp['firstName']} {emp['lastName']}", datetime.utcnow().isoformat(), "employee", "admin"))
    task_id = db.lastrowid
    conn.commit()
    print(f"Created overdue task {task_id}")
    
    # 4. The deadline service runs in a thread in the main app. 
    # Since we are running a separate script, we can either wait or manually trigger the logic.
    # For verification of the CODE CHANGE, we can just run the logic from deadline_service manually here or wait for the background service (if it's running).
    # Since I'm in a script, I'll just wait a bit and check if notifications appear (assuming the backend is running).
    
    import time
    print("Waiting 10 seconds for deadline service to pick up the task...")
    time.sleep(10)
    
    db.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 5", (admin_id,))
    notifs = db.fetchall()
    
    if any("Test Overdue Task" in n["message"] for n in notifs):
        print("SUCCESS: Admin received the overdue task notification!")
    else:
        print("FAILURE: Admin did not receive the notification yet.")
        print("Current admin notifications:")
        for n in notifs:
            print(f"- {n['message']}")
            
    conn.close()

if __name__ == "__main__":
    verify_admin_notifications()

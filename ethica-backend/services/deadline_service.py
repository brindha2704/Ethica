import threading
import time
from datetime import datetime, date
import sqlite3
import os
from database.db_manager import get_db

def _check_and_notify_deadlines(app_context=None):
    # Depending on how the db is accessed, we establish a new local connection since sqlite connections
    # cannot be shared across threads easily in this default configuration.
    
    # We resolve the db path from the environment or default
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "ethica.db")
    
    while True:
        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            db = conn.cursor()
            
            # Find tasks that are actively overdue but still marked as Normal escalation
            # t.status != 'completed' AND t.status != 'overdue' AND t.due_date < date('now')
            db.execute("""
                SELECT t.id, t.title, t.due_date, u.department, u.firstName, u.lastName
                FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE t.status != 'completed' 
                  AND t.status != 'overdue'
                  AND t.due_date < date('now', 'localtime')
            """)
            overdue_tasks = db.fetchall()
            
            for task in overdue_tasks:
                task_id = task["id"]
                title = task["title"]
                dept = task["department"]
                emp_name = f"{task['firstName']} {task['lastName']}"
                
                # 1. Update task properly to overdue
                db.execute("""
                    UPDATE tasks 
                    SET status = 'overdue', escalation_level = 'Escalated', updated_at = ? 
                    WHERE id = ?
                """, (datetime.utcnow().isoformat(), task_id))
                
                # 2. Get HR for this department
                db.execute("SELECT id FROM users WHERE role = 'hr' AND department = ?", (dept,))
                hr_users = db.fetchall()
                
                # 3. Get Manager and Admin
                db.execute("SELECT id FROM users WHERE role = 'manager' OR role = 'admin'")
                notif_recipients = db.fetchall()
                
                message = f"Deadline Missed: Task '{title}' by {emp_name} ({dept}) is overdue."
                
                # Insert notifications
                for hr in hr_users:
                    db.execute("""
                        INSERT INTO notifications (user_id, message, type, created_at)
                        VALUES (?, ?, 'escalation', ?)
                    """, (hr["id"], message, datetime.utcnow().isoformat()))
                    
                for rec in notif_recipients:
                    db.execute("""
                        INSERT INTO notifications (user_id, message, type, created_at)
                        VALUES (?, ?, 'escalation', ?)
                    """, (rec["id"], message, datetime.utcnow().isoformat()))
                    
            conn.commit()
            conn.close()
        except Exception as e:
            print("[Deadline Service Error]:", str(e))
            
        # Wait 60 seconds before checking again (for demonstration/production scaling this could be hourly)
        time.sleep(60)

def start_deadline_checker():
    """
    Spawns a background daemon thread that periodically checks for overdue tasks.
    """
    thread = threading.Thread(target=_check_and_notify_deadlines, daemon=True)
    thread.start()
    print("Background deadline checker service started.")

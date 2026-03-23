import threading
import time
from database.db_manager import get_db, get_db_cursor, get_placeholder
from core.config import DATABASE_URL

def _check_and_notify_deadlines(app_context=None):
    # This service is usually disabled on Vercel, but we update it for local/Supabase consistency.
    
    while True:
        try:
            conn = get_db()
            db = get_db_cursor(conn)
            p = get_placeholder()
            
            # Find tasks that are actively overdue 
            # SQLite: date('now'), Postgres: CURRENT_DATE
            now_sql = "CURRENT_DATE" if DATABASE_URL else "date('now')"
            
            db.execute(f"""
                SELECT t.id, t.title, t.due_date, u.department, u.firstName, u.lastName
                FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE t.status != 'completed' 
                  AND t.status != 'overdue'
                  AND t.due_date < {now_sql}
            """)
            overdue_tasks = db.fetchall()
            
            for task in overdue_tasks:
                task_id = task["id"]
                title = task["title"]
                dept = task["department"]
                emp_name = f"{task['firstName']} {task['lastName']}"
                
                # 1. Update task properly to overdue
                db.execute(f"""
                    UPDATE tasks 
                    SET status = 'overdue', escalation_level = 'Escalated', updated_at = {p} 
                    WHERE id = {p}
                """, (datetime.utcnow().isoformat(), task_id))
                
                # 2. Get HR for this department
                db.execute(f"SELECT id FROM users WHERE role = 'hr' AND department = {p}", (dept,))
                hr_users = db.fetchall()
                
                # 3. Get Manager and Admin
                db.execute("SELECT id FROM users WHERE role = 'manager' OR role = 'admin'")
                notif_recipients = db.fetchall()
                
                message = f"Deadline Missed: Task '{title}' by {emp_name} ({dept}) is overdue."
                
                for hr in hr_users:
                    db.execute(f"""
                        INSERT INTO notifications (user_id, message, type, created_at)
                        VALUES ({p}, {p}, 'escalation', {p})
                    """, (hr["id"], message, datetime.utcnow().isoformat()))
                    
                for rec in notif_recipients:
                    db.execute(f"""
                        INSERT INTO notifications (user_id, message, type, created_at)
                        VALUES ({p}, {p}, 'escalation', {p})
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

import sqlite3
import os
from datetime import date

DB_PATH = r"c:\Users\brind\OneDrive\Desktop\Ethica\ethica-backend\ethica.db"

def verify():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    db = conn.cursor()

    try:
        # 1. Ensure an employee exists
        db.execute("SELECT id, department FROM users WHERE role = 'employee' LIMIT 1")
        employee = db.fetchone()
        if not employee:
            print("Error: No employee found in database.")
            return
        
        emp_id = employee["id"]
        dept = employee["department"]
        today = date.today().isoformat()

        print(f"Testing with Employee ID: {emp_id}, Dept: {dept}, Today: {today}")

        # 2. Create a task due TODAY
        db.execute("""
            INSERT INTO tasks (title, assignee_name, assignee_role, status, due_date, 
                              created_by_role, assignee_user_id, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("Test Task Due Today", "Test Employee", "employee", "pending", today, 
              "admin", emp_id, today))
        task_id = db.lastrowid
        print(f"Created task {task_id} due today.")

        # 3. Simulate employee reporting a problem
        report_text = "[Technical Problem] Verification testing: Report should show in HR dashboard."
        db.execute("UPDATE tasks SET employee_report = ? WHERE id = ?", (report_text, task_id))
        print("Updated task with employee report.")

        # 4. Verify HR Overview (simulating Backend logic)
        db.execute("""
            SELECT t.* FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
            WHERE u.department = ? AND (t.status = 'overdue' OR (t.status != 'completed' AND t.due_date <= date('now')))
            AND t.id = ?
        """, (dept, task_id))
        hr_row = db.fetchone()
        
        if hr_row:
            print("SUCCESS: Task found in HR overdue summary query.")
            if hr_row["employee_report"] == report_text:
                print("SUCCESS: Employee report content verified in HR query.")
            else:
                print(f"FAILURE: Report content mismatch. Found: {hr_row['employee_report']}")
        else:
            print("FAILURE: Task NOT found in HR overdue summary query (logic fix failed or date mismatch).")

        # 5. Verify Manager Tasks (simulating Backend logic)
        db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        mgr_row = dict(db.fetchone())
        if "employee_report" in mgr_row or "employeeReport" in mgr_row:
            print("SUCCESS: employee_report column exists in tasks table.")
        else:
            print("FAILURE: employee_report column missing in tasks table.")

        conn.rollback() # Don't actually keep the test data
        print("Verification finished (rolled back changes).")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify()

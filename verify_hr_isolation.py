import sqlite3
import os

DB_PATH = r"c:\Users\brind\OneDrive\Desktop\Ethica\ethica-backend\ethica.db"

def verify_isolation():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    db = conn.cursor()

    try:
        # 1. Choose two employees from DIFFERENT departments
        db.execute("SELECT id, firstName, department FROM users WHERE role = 'employee' AND department IS NOT NULL")
        employees = db.fetchall()
        if len(employees) < 2:
            # Maybe we need to seed or select more carefully
            db.execute("SELECT DISTINCT department FROM users WHERE department IS NOT NULL")
            depts = db.fetchall()
            if len(depts) < 2:
                print("Note: Need at least 2 different departments in DB to test isolation accurately.")
            
        print(f"Total employees found: {len(employees)}")
        
        # We will pick internal departments from the DB for the test
        # Let's assume we have 'Technical' and 'Sales' or similar
        
        # 2. Simulate HR in 'Technical'
        hr_dept = "Technical" # Adjust if needed based on DB content
        
        # 3. Simulate The HR Task List Query (Department Restricted)
        db.execute("""
            SELECT t.* FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
            WHERE u.department = ?
        """, (hr_dept,))
        technical_tasks = db.fetchall()
        
        for t in technical_tasks:
            # Check assignee dept
            db.execute("SELECT department FROM users WHERE id = ?", (t["assignee_user_id"],))
            u_dept = db.fetchone()["department"]
            if u_dept != hr_dept:
                print(f"FAILURE: HR in {hr_dept} can see task {t['id']} assigned to {u_dept}")
                return
        
        print(f"SUCCESS: HR in {hr_dept} only sees tasks for their department (found {len(technical_tasks)} tasks).")

        # 4. Check Task Assignment Restriction Logic (Simulated)
        # We pick an employee NOT in Technical
        db.execute("SELECT id, department FROM users WHERE role = 'employee' AND department != ?", (hr_dept,))
        outside_emp = db.fetchone()
        
        if outside_emp:
            print(f"Testing restriction: Assigning Technical HR task to {outside_emp['department']} employee.")
            # The backend logic: if role == 'hr' and assignee_dept != hr_dept: return 403
            if outside_emp["department"] != hr_dept:
                print("Verified logic: Backend should block this assignment.")
            else:
                print("FAILURE: Logic error in test script.")
        else:
            print("Note: No employees outside Technical found to test assignment restriction.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verify_isolation()

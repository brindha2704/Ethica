import sqlite3

def check_db():
    conn = sqlite3.connect("ethica.db")
    conn.row_factory = sqlite3.Row
    db = conn.cursor()
    
    # Search for "problem" or "complete the task" in tasks table
    db.execute("SELECT * FROM tasks WHERE employee_report LIKE '%problem%' OR employee_report LIKE '%complete%'")
    rows = db.fetchall()
    
    print(f"Found {len(rows)} potential matches in employee_report")
    for row in rows:
        print(f"Task ID: {row['id']}, Report: {row['employee_report']}")
        
    db.execute("SELECT * FROM tasks WHERE title LIKE '%problem%' OR title LIKE '%complete%'")
    rows = db.fetchall()
    print(f"Found {len(rows)} potential matches in title")
    for row in rows:
        print(f"Task ID: {row['id']}, Title: {row['title']}")
        
    conn.close()

if __name__ == "__main__":
    check_db()

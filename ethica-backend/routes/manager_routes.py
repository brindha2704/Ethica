from flask import Blueprint, request, jsonify, g
from database.db_manager import get_db, get_db_cursor, get_placeholder
from core.auth_middleware import token_required, role_required
from datetime import datetime, date

manager_bp = Blueprint("manager", __name__)

@manager_bp.route("/overview", methods=["GET"])
@token_required
@role_required("manager")
def get_manager_overview():
    try:
        conn = get_db()
        db = get_db_cursor(conn)
        p = get_placeholder()
        dept = g.current_user["department"]
        user_id = g.current_user["id"]
        
        is_general = dept in ["Management", "General"]
        
        # 1. Metrics
        if is_general:
            db.execute(f"SELECT COUNT(*) as total FROM users WHERE role = {p}", ("employee",))
        else:
            db.execute(f"SELECT COUNT(*) as total FROM users WHERE department = {p} AND role = {p}", (dept, "employee"))
        total_employees = db.fetchone()["total"]
        
        if is_general:
            db.execute("""
                SELECT COUNT(*) as total FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE t.status = 'completed'
            """)
        else:
            db.execute(f"""
                SELECT COUNT(*) as total FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE u.department = {p} AND t.status = 'completed'
            """, (dept,))
        completed_tasks = db.fetchone()["total"]
        
        # SQLite: date('now'), Postgres: CURRENT_DATE
        now_sql = "CURRENT_DATE" if DATABASE_URL else "date('now')"
        
        if is_general:
            db.execute(f"""
                SELECT COUNT(*) as total FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE t.status = 'overdue' OR (t.status != 'completed' AND t.due_date <= {now_sql})
            """)
        else:
            db.execute(f"""
                SELECT COUNT(*) as total FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE u.department = {p} AND (t.status = 'overdue' OR (t.status != 'completed' AND t.due_date <= {now_sql}))
            """, (dept,))
        overdue_tasks = db.fetchone()["total"]
        
        if is_general:
            db.execute(f"""
                SELECT COUNT(*) as total FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE t.status = {p}
            """, ("in_progress",))
        else:
            db.execute(f"""
                SELECT COUNT(*) as total FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE u.department = {p} AND t.status = {p}
            """, (dept, "in_progress"))
        in_progress_tasks = db.fetchone()["total"]

        total_tasks = completed_tasks + overdue_tasks + in_progress_tasks
        completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

        metrics = {
            "employees": total_employees,
            "completed": completed_tasks,
            "overdue": overdue_tasks,
            "inProgress": in_progress_tasks,
            "completionRate": completion_rate
        }

        # 2. Overdue Summary
        if is_general:
            db.execute(f"""
                SELECT t.*, u.firstName, u.lastName 
                FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE (t.status = 'overdue' OR (t.status != 'completed' AND t.due_date <= {now_sql}))
                ORDER BY t.due_date ASC LIMIT 5
            """)
        else:
            db.execute(f"""
                SELECT t.*, u.firstName, u.lastName 
                FROM tasks t
                JOIN users u ON t.assignee_user_id = u.id
                WHERE u.department = {p} AND (t.status = 'overdue' OR (t.status != 'completed' AND t.due_date <= {now_sql}))
                ORDER BY t.due_date ASC LIMIT 5
            """, (dept,))
        rows = db.fetchall()
        
        overdue_summary = []
        for row in rows:
            try:
                due_val = row["due_date"]
                if isinstance(due_val, str):
                    due = datetime.strptime(due_val, "%Y-%m-%d").date()
                else:
                    due = due_val # Already date/datetime from Postgres
                delay = (date.today() - due).days
            except:
                delay = 0
            
            overdue_summary.append({
                "owner": f"{row['firstName']} {row['lastName']}",
                "task": row["title"],
                "delay": delay,
                "level": row["escalation_level"] if "escalation_level" in row else "Normal",
                "problem": row["employee_report"] or ""
            })

        # 3. Chart Data (Placeholder for now, could be calculated from history)
        chart_data = {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "data": [completed_tasks // 2, completed_tasks, completed_tasks + 1, overdue_tasks, in_progress_tasks, 0, 2]
        }

        # 4. Notifications
        db.execute(f"""
            SELECT id, message, type, created_at 
            FROM notifications 
            WHERE user_id = {p} 
            ORDER BY created_at DESC LIMIT 10
        """, (user_id,))
        notifications = [dict(row) for row in db.fetchall()]

        conn.close()
        return jsonify({
            "metrics": metrics,
            "overdueSummary": overdue_summary,
            "chartData": chart_data,
            "notifications": notifications
        })
    except Exception as e:
        print("MANAGER OVERVIEW ERROR:", str(e))
        return jsonify({"message": "Server error"}), 500

@manager_bp.route("/employees", methods=["GET"])
@token_required
@role_required("manager")
def get_manager_employees():
    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    dept = g.current_user["department"]
    is_general = dept in ["Management", "General"]
    
    if is_general:
        db.execute(f"SELECT * FROM users WHERE role = {p}", ("employee",))
    else:
        db.execute(f"SELECT * FROM users WHERE department = {p} AND role = {p}", (dept, "employee"))
    users = db.fetchall()
    
    # SQLite: date('now'), Postgres: CURRENT_DATE
    now_sql = "CURRENT_DATE" if DATABASE_URL else "date('now')"
    
    employees = []
    for u in users:
        # Check if they have overdue tasks
        db.execute(f"""
            SELECT COUNT(*) as total FROM tasks 
            WHERE assignee_user_id = {p} AND (status = 'overdue' OR (status != 'completed' AND due_date <= {now_sql}))
        """, (u["id"],))
        has_delays = db.fetchone()["total"] > 0
        
        employees.append({
            "name": f"{u['firstName']} {u['lastName']}",
            "email": u["email"],
            "role": u["role"],
            "department": u["department"],
            "status": "Has Delays" if has_delays else "Active"
        })
    
    conn.close()
    return jsonify(employees)

@manager_bp.route("/tasks", methods=["GET"])
@token_required
@role_required("manager")
def get_manager_tasks():
    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    dept = g.current_user["department"]
    is_general = dept in ["Management", "General"]
    
    if is_general:
        db.execute("""
            SELECT t.*, u.firstName, u.lastName 
            FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
        """)
    else:
        db.execute(f"""
            SELECT t.*, u.firstName, u.lastName 
            FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
            WHERE u.department = {p}
        """, (dept,))
    rows = db.fetchall()
    
    tasks = []
    for row in rows:
        tasks.append({
            "id": row["id"],
            "title": row["title"],
            "assignee": f"{row['firstName']} {row['lastName']}",
            "status": row["status"],
            "dueDate": row["due_date"],
            "level": row["escalation_level"] if "escalation_level" in row else "Normal",
            "employeeReport": row["employee_report"] or row.get("problem") or ""
        })
    
    conn.close()
    return jsonify(tasks)

@manager_bp.route("/reports", methods=["GET"])
@token_required
@role_required("manager")
def get_manager_reports():
    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    dept = g.current_user["department"]
    is_general = dept in ["Management", "General"]
    
    if is_general:
        db.execute(f"""
            SELECT t.*, u.firstName, u.lastName 
            FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
            WHERE t.status = {p}
            ORDER BY t.updated_at DESC LIMIT 20
        """, ("completed",))
    else:
        db.execute(f"""
            SELECT t.*, u.firstName, u.lastName 
            FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
            WHERE u.department = {p} AND t.status = {p}
            ORDER BY t.updated_at DESC LIMIT 20
        """, (dept, "completed"))
    rows = db.fetchall()
    
    completed = []
    for row in rows:
        completed_date = row["completed_at"] if "completed_at" in row and row["completed_at"] else row["updated_at"]
        if not completed_date:
            completed_date = row["due_date"]
            
        if completed_date and isinstance(completed_date, str) and "T" in completed_date:
            completed_date = completed_date.split("T")[0]
        elif completed_date and not isinstance(completed_date, str):
            completed_date = completed_date.strftime("%Y-%m-%d")
            
        completed.append({
            "assignee": f"{row['firstName']} {row['lastName']}",
            "task": row["title"],
            "completedDate": completed_date,
            "status": row["status"]
        })
        
    conn.close()
    return jsonify({"completed": completed})

from flask import Blueprint, request, jsonify, g
from database.db_manager import get_db, get_db_cursor, get_placeholder
from core.auth_middleware import token_required, role_required
from datetime import datetime, date

hr_bp = Blueprint("hr", __name__)

@hr_bp.route("/overview", methods=["GET"])
@token_required
@role_required("hr")
def get_hr_overview():
    try:
        conn = get_db()
        db = get_db_cursor(conn)
        p = get_placeholder()
        dept = g.current_user["department"]
        user_id = g.current_user["id"]

        # 1. Employees in department
        db.execute(f"SELECT * FROM users WHERE department = {p} AND role = 'employee'", (dept,))
        employees = [dict(row) for row in db.fetchall()]

        # 2. Overdue Summary (tasks for employees in this dept)
        # SQLite: date('now'), Postgres: CURRENT_DATE
        now_sql = "CURRENT_DATE" if DATABASE_URL else "date('now')"
        db.execute(f"""
            SELECT t.*, u.firstName, u.lastName 
            FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
            WHERE u.department = {p} AND (t.status = 'overdue' OR (t.status != 'completed' AND t.due_date <= {now_sql}))
        """, (dept,))
        rows = db.fetchall()
        
        overdue_summary = []
        for row in rows:
            try:
                # Handle both string and date types if necessary, but string is safer for our app
                due_val = row["due_date"]
                if isinstance(due_val, str):
                    due = datetime.strptime(due_val, "%Y-%m-%d").date()
                else:
                    due = due_val # Already a date/datetime object from Postgres
                delay = (date.today() - due).days
            except Exception as e:
                print("DELAY CALC ERROR:", str(e))
                delay = 0
            
            overdue_summary.append({
                "owner": f"{row['firstName']} {row['lastName']}",
                "task": row["title"],
                "delay": delay,
                "status": row["status"],
                "level": row["escalation_level"] if "escalation_level" in row else "Normal",
                "problem": row["employee_report"] or ""
            })

        # 3. Notifications
        db.execute(f"""
            SELECT id, message, type, created_at 
            FROM notifications 
            WHERE user_id = {p} 
            ORDER BY created_at DESC LIMIT 10
        """, (user_id,))
        notifications = [dict(row) for row in db.fetchall()]

        conn.close()
        return jsonify({
            "employees": employees,
            "overdueSummary": overdue_summary,
            "notifications": notifications
        })
    except Exception as e:
        print("HR OVERVIEW ERROR:", str(e))
        return jsonify({"message": "Server error"}), 500

@hr_bp.route("/employees", methods=["GET"])
@token_required
@role_required("hr")
def get_hr_employees():
    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    db.execute(f"SELECT * FROM users WHERE department = {p} AND role = 'employee'", (g.current_user["department"],))
    employees = [dict(row) for row in db.fetchall()]
    conn.close()
    return jsonify({"employees": employees})

@hr_bp.route("/tasks", methods=["POST"])
@token_required
@role_required("hr")
def create_hr_task():
    data = request.get_json() or {}
    title = data.get("title")
    assignee_user_id = data.get("assigneeUserId")
    due_date = data.get("dueDate")
    project_name = data.get("projectName")

    if not all([title, assignee_user_id, due_date]):
        return jsonify({"message": "Missing required fields"}), 400

    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    
    # Get assignee details
    db.execute(f"SELECT firstName, lastName, role, department FROM users WHERE id = {p}", (assignee_user_id,))
    user = db.fetchone()
    if not user:
        conn.close()
        return jsonify({"message": "Assignee not found"}), 404

    assignee_name = f"{user['firstName']} {user['lastName']}"
    assignee_role = user["role"]
    assignee_dept = user.get("department")

    if assignee_dept != g.current_user["department"]:
        conn.close()
        return jsonify({"message": "You can only assign tasks to employees in your department"}), 403

    db.execute(f"""
        INSERT INTO tasks (title, assignee_name, assignee_role, status, due_date, 
                          created_by_role, assignee_user_id, project_name, 
                          created_by_user_id, updated_at)
        VALUES ({p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p}, {p})
    """, (title, assignee_name, assignee_role, "pending", due_date, 
          "hr", assignee_user_id, project_name,
          g.current_user["id"], datetime.utcnow().isoformat()))
    
    conn.commit()
    conn.close()
    return jsonify({"message": "Task assigned successfully"}), 201

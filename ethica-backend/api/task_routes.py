from flask import Blueprint, request, jsonify, g
from datetime import datetime
from database.db_manager import get_db
from core.auth_middleware import token_required, role_required

task_bp = Blueprint("tasks", __name__)

@task_bp.route("", methods=["GET"])
@token_required
def list_tasks():
    conn = get_db()
    db = conn.cursor()
    role = g.current_user["role"]
    user_id = g.current_user["id"]

    if role == "admin":
        db.execute("SELECT * FROM tasks")
    elif role == "hr":
        # HR only sees tasks for employees in their department
        dept = g.current_user["department"]
        db.execute("""
            SELECT t.* FROM tasks t
            JOIN users u ON t.assignee_user_id = u.id
            WHERE u.department = ?
        """, (dept,))
    elif role == "manager":
        db.execute("SELECT * FROM tasks WHERE created_by_user_id = ? OR assignee_user_id = ?", (user_id, user_id))
    else:
        db.execute("SELECT * FROM tasks WHERE assignee_user_id = ?", (user_id,))
    
    tasks = []
    for row in db.fetchall():
        d = dict(row)
        d["employeeReport"] = row["employee_report"]
        tasks.append(d)
        
    conn.close()
    return jsonify({"tasks": tasks})

@task_bp.route("", methods=["POST"])
@token_required
@role_required("admin", "hr", "manager")
def create_task():
    data = request.get_json() or {}
    title = data.get("title")
    assignee_user_id = data.get("assigneeUserId")
    due_date = data.get("dueDate")
    project_name = data.get("projectName")
    client_name = data.get("clientName")

    conn = get_db()
    db = conn.cursor()
    
    # Get assignee details
    db.execute("SELECT firstName, lastName, role FROM users WHERE id = ?", (assignee_user_id,))
    user = db.fetchone()
    if not user:
        conn.close()
        return jsonify({"message": "Assignee not found"}), 404

    assignee_name = f"{user['firstName']} {user['lastName']}"
    assignee_role = user["role"]
    assignee_dept = user.get("department")

    # HR can only assign to their own department
    if g.current_user["role"] == "hr" and assignee_dept != g.current_user["department"]:
        conn.close()
        return jsonify({"message": f"HR can only assign tasks to employees in the {g.current_user['department']} department"}), 403

    db.execute("""
        INSERT INTO tasks (title, assignee_name, assignee_role, status, due_date, 
                          created_by_role, assignee_user_id, project_name, client_name, 
                          created_by_user_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (title, assignee_name, assignee_role, "in_progress", due_date, 
          g.current_user["role"], assignee_user_id, project_name, client_name,
          g.current_user["id"], datetime.utcnow().isoformat()))
    
    conn.commit()
    conn.close()
    return jsonify({"message": "Task created"}), 201

@task_bp.route("/<int:task_id>/status", methods=["PUT"])
@token_required
def update_task_status(task_id):
    data = request.get_json() or {}
    status = data.get("status")
    
    conn = get_db()
    db = conn.cursor()
    db.execute("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?", 
               (status, datetime.utcnow().isoformat(), task_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Status updated"})

from flask import Blueprint, request, jsonify, g
from database.db_manager import get_db
from core.auth_middleware import token_required
from datetime import datetime, date

employee_bp = Blueprint("employee", __name__)

@employee_bp.route("/overview", methods=["GET"])
@token_required
def get_employee_overview():
    try:
        conn = get_db()
        db = conn.cursor()
        user_id = g.current_user["id"]
        dept = g.current_user["department"]

        # 1. Task Metrics
        db.execute("SELECT COUNT(*) as total FROM tasks WHERE assignee_user_id = ?", (user_id,))
        total = db.fetchone()["total"]

        db.execute("SELECT COUNT(*) as completed FROM tasks WHERE assignee_user_id = ? AND status = 'completed'", (user_id,))
        completed = db.fetchone()["completed"]

        db.execute("""
            SELECT COUNT(*) as overdue FROM tasks 
            WHERE assignee_user_id = ? AND (status = 'overdue' OR (status != 'completed' AND due_date <= date('now')))
        """, (user_id,))
        overdue = db.fetchone()["overdue"]

        pending = total - completed - overdue
        if pending < 0: pending = 0

        summary = {
            "total": total,
            "completed": completed,
            "overdue": overdue,
            "pending": pending
        }

        # 2. Tasks List
        db.execute("SELECT * FROM tasks WHERE assignee_user_id = ? ORDER BY due_date ASC", (user_id,))
        rows = db.fetchall()
        tasks = []
        for row in rows:
            t = dict(row)
            t["dueDate"] = row["due_date"] # Map to CamelCase for frontend
            tasks.append(t)

        # 3. Assigned HR
        db.execute("SELECT firstName, lastName, department FROM users WHERE role = 'hr' AND department = ? LIMIT 1", (dept,))
        hr_row = db.fetchone()
        assigned_hr = None
        if hr_row:
            assigned_hr = {
                "name": f"{hr_row['firstName']} {hr_row['lastName']}",
                "department": hr_row["department"]
            }

        # 4. Notifications
        db.execute("""
            SELECT id, message, type, created_at as date 
            FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC LIMIT 10
        """, (user_id,))
        notifications = [dict(row) for row in db.fetchall()]

        conn.close()
        return jsonify({
            "summary": summary,
            "tasks": tasks,
            "assignedHr": assigned_hr,
            "notifications": notifications
        })
    except Exception as e:
        print("EMPLOYEE OVERVIEW ERROR:", str(e))
        return jsonify({"message": "Server error"}), 500

@employee_bp.route("/tasks/<int:task_id>/status", methods=["PUT"])
@token_required
def update_own_task_status(task_id):
    data = request.get_json() or {}
    status = data.get("status")
    user_id = g.current_user["id"]

    try:
        conn = get_db()
        db = conn.cursor()
        
        # Verify ownership
        db.execute("SELECT * FROM tasks WHERE id = ? AND assignee_user_id = ?", (task_id, user_id))
        if not db.fetchone():
            conn.close()
            return jsonify({"message": "Task not found or access denied"}), 404

        completed_at = datetime.utcnow().isoformat() if status == "completed" else None
        
        db.execute("""
            UPDATE tasks SET status = ?, updated_at = ?, completed_at = ?
            WHERE id = ?
        """, (status, datetime.utcnow().isoformat(), completed_at, task_id))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Status updated"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@employee_bp.route("/tasks/<int:task_id>/problem", methods=["PUT"])
@token_required
def report_task_problem(task_id):
    data = request.get_json() or {}
    problem = data.get("problem")
    user_id = g.current_user["id"]

    try:
        conn = get_db()
        db = conn.cursor()
        
        # Verify ownership
        db.execute("SELECT * FROM tasks WHERE id = ? AND assignee_user_id = ?", (task_id, user_id))
        if not db.fetchone():
            conn.close()
            return jsonify({"message": "Task not found or access denied"}), 404

        db.execute("""
            UPDATE tasks SET employee_report = ?, updated_at = ?
            WHERE id = ?
        """, (problem, datetime.utcnow().isoformat(), task_id))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Problem report updated"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

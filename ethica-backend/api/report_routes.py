from flask import Blueprint, request, jsonify, g
from database.db_manager import get_db
from core.auth_middleware import token_required
from datetime import datetime, date

report_bp = Blueprint("reports", __name__)

@report_bp.route("/deadline-violations", methods=["GET"])
@token_required
def get_deadline_violations():
    try:
        conn = get_db()
        db = conn.cursor()
        user_id = g.current_user["id"]
        
        # Fetch overdue tasks for this employee
        db.execute("""
            SELECT id, title, due_date, status, escalation_level, employee_report 
            FROM tasks 
            WHERE assignee_user_id = ? AND (status = 'overdue' OR (status != 'completed' AND due_date <= date('now')))
            ORDER BY due_date ASC
        """, (user_id,))
        rows = db.fetchall()
        
        violations = []
        for row in rows:
            try:
                due = datetime.strptime(row["due_date"], "%Y-%m-%d").date()
                delay_days = (date.today() - due).days
                delay_str = f"{delay_days} days overdue"
            except:
                delay_str = "Overdue"

            violations.append({
                "id": row["id"],
                "task": row["title"],
                "dueDate": row["due_date"],
                "delay": delay_str,
                "level": row["escalation_level"] or "Escalated",
                "problem": row["employee_report"] or ""
            })
            
        conn.close()
        return jsonify({"violations": violations})
    except Exception as e:
        print("REPORT ERROR:", str(e))
        return jsonify({"message": "Server error", "error": str(e)}), 500

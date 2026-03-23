from flask import Blueprint, jsonify, g
from database.db_manager import get_db, get_db_cursor, get_placeholder
from core.config import DATABASE_URL
from core.auth_middleware import token_required
from datetime import datetime, date

report_bp = Blueprint("reports", __name__)

@report_bp.route("/deadline-violations", methods=["GET"])
@token_required
def get_deadline_violations():
    try:
        conn = get_db()
        db = get_db_cursor(conn)
        p = get_placeholder()
        user_id = g.current_user["id"]
        
        # SQLite: date('now'), Postgres: CURRENT_DATE
        now_sql = "CURRENT_DATE" if DATABASE_URL else "date('now')"
        
        # Fetch overdue tasks for this employee
        db.execute(f"""
            SELECT id, title, due_date, status, escalation_level, employee_report 
            FROM tasks 
            WHERE assignee_user_id = {p} AND (status = 'overdue' OR (status != 'completed' AND due_date <= {now_sql}))
            ORDER BY due_date ASC
        """, (user_id,))
        rows = db.fetchall()
        
        violations = []
        for row in rows:
            try:
                due_val = row["due_date"]
                if isinstance(due_val, str):
                    due = datetime.strptime(due_val, "%Y-%m-%d").date()
                else:
                    due = due_val # Already date from Postgres
                delay_days = (date.today() - due).days
                delay_str = f"{delay_days} days overdue"
            except:
                delay_str = "Overdue"

            violations.append({
                "id": row["id"],
                "task": row["title"],
                "dueDate": row["due_date"],
                "delay": delay_str,
                "level": row["escalation_level"] if "escalation_level" in row else "Escalated",
                "problem": row["employee_report"] or ""
            })
            
        conn.close()
        return jsonify({"violations": violations})
    except Exception as e:
        print("REPORT ERROR:", str(e))
        return jsonify({"message": "Server error", "error": str(e)}), 500

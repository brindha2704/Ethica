from flask import Blueprint, jsonify
from database.db_manager import get_db, get_db_cursor, get_placeholder
from core.config import DATABASE_URL
from core.auth_middleware import token_required, role_required
from datetime import datetime, date

admin_bp = Blueprint("admin_stats", __name__)

@admin_bp.route("/stats/teams", methods=["GET"])
@token_required
@role_required("admin")
def get_team_stats():
    try:
        conn = get_db()
        db = get_db_cursor(conn)
        
        # Join tasks with users to get departments
        # We group by the department of the assignee
        query = """
            SELECT 
                u.department,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN t.status = 'overdue' THEN 1 ELSE 0 END) as overdue_tasks,
                SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks
            FROM users u
            LEFT JOIN tasks t ON u.id = t.assignee_user_id
            WHERE u.role = 'employee' AND u.department IS NOT NULL
            GROUP BY u.department
        """
        db.execute(query)
        rows = db.fetchall()
        
        stats = []
        for row in rows:
            stats.append({
                "department": row["department"],
                "total": row["total_tasks"],
                "completed": row["completed_tasks"] or 0,
                "overdue": row["overdue_tasks"] or 0,
                "in_progress": row["in_progress_tasks"] or 0
            })
            
        conn.close()
        return jsonify({"teamStats": stats})
    except Exception as e:
        print("ADMIN STATS ERROR:", str(e))
        return jsonify({"message": "Server error fetching stats"}), 500

@admin_bp.route("/stats/overview", methods=["GET"])
@token_required
@role_required("admin")
def get_overview_stats():
    try:
        conn = get_db()
        db = get_db_cursor(conn)
        p = get_placeholder()
        
        # 1. Metrics
        db.execute("SELECT COUNT(*) as total FROM users")
        total_users = db.fetchone()["total"]
        db.execute(f"SELECT COUNT(*) as total FROM users WHERE role = {p}", ("employee",))
        total_employees = db.fetchone()["total"]
        db.execute(f"SELECT COUNT(*) as total FROM users WHERE role = {p}", ("hr",))
        total_hr = db.fetchone()["total"]
        db.execute(f"SELECT COUNT(*) as total FROM users WHERE role = {p}", ("manager",))
        total_managers = db.fetchone()["total"]
        db.execute(f"SELECT COUNT(*) as total FROM tasks WHERE status = {p}", ("overdue",))
        total_overdue = db.fetchone()["total"]
        
        metrics = {
            "users": total_users,
            "employees": total_employees,
            "hr": total_hr,
            "managers": total_managers,
            "overdue": total_overdue
        }

        # 2. Overdue Summary
        # SQLite: date('now'), Postgres: CURRENT_DATE
        now_sql = "CURRENT_DATE" if DATABASE_URL else "date('now')"
        db.execute(f"""
            SELECT assignee_name as owner, title as task, due_date, status
            FROM tasks
            WHERE status = 'overdue' OR (status != 'completed' AND due_date < {now_sql})
            ORDER BY due_date ASC LIMIT 10
        """)
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
                "owner": row["owner"],
                "task": row["task"],
                "delay": delay,
                "status": row["status"]
            })

        # 3. Notifications
        db.execute("SELECT id, message, type, created_at FROM notifications ORDER BY id DESC LIMIT 10")
        notifications = [dict(row) for row in db.fetchall()]

        conn.close()
        return jsonify({
            "metrics": metrics,
            "overdueSummary": overdue_summary,
            "notifications": notifications
        })
    except Exception as e:
        print("ADMIN OVERVIEW ERROR:", str(e))
        return jsonify({"message": "Server error"}), 500

from flask import Blueprint, request, jsonify, g
from database.db_manager import get_db, get_db_cursor, get_placeholder
from core.auth_middleware import token_required

notification_bp = Blueprint("notifications", __name__)

@notification_bp.route("", methods=["GET"])
@token_required
def get_notifications():
    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    
    # SQLite uses 0/1, Postgres uses FALSE/TRUE
    is_read_val = "FALSE" if get_db_cursor(conn).__class__.__name__ == 'RealDictCursor' else "0"
    
    db.execute(f"""
        SELECT * FROM notifications 
        WHERE user_id = {p} AND is_read = FALSE
        ORDER BY created_at DESC LIMIT 10
    """, (g.current_user["id"],))
    
    notifs = [dict(row) for row in db.fetchall()]
    conn.close()
    return jsonify({"notifications": notifs})

@notification_bp.route("/<int:notif_id>/read", methods=["PUT"])
@token_required
def mark_read(notif_id):
    conn = get_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    
    db.execute(f"UPDATE notifications SET is_read = TRUE WHERE id = {p} AND user_id = {p}", 
               (notif_id, g.current_user["id"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Marked as read"})

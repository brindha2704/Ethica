from flask import Blueprint, request, jsonify, g
from database.db_manager import get_db
from core.auth_middleware import token_required

notification_bp = Blueprint("notifications", __name__)

@notification_bp.route("", methods=["GET"])
@token_required
def get_notifications():
    conn = get_db()
    db = conn.cursor()
    db.execute("""
        SELECT * FROM notifications 
        WHERE user_id = ? AND is_read = 0 
        ORDER BY created_at DESC LIMIT 10
    """, (g.current_user["id"],))
    
    notifs = [dict(row) for row in db.fetchall()]
    conn.close()
    return jsonify({"notifications": notifs})

@notification_bp.route("/<int:notif_id>/read", methods=["PUT"])
@token_required
def mark_read(notif_id):
    conn = get_db()
    db = conn.cursor()
    db.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", 
               (notif_id, g.current_user["id"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Marked as read"})

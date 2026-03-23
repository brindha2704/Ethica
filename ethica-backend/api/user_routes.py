from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash
import jwt
from datetime import datetime, timedelta
from core.config import SECRET_KEY, VALID_ROLES
from database.db_manager import get_db, get_tokens_db
from core.auth_middleware import token_required, role_required, serialize_user
from services.token_service import save_token

user_bp = Blueprint("users", __name__)

@user_bp.route("", methods=["GET"])
@token_required
@role_required("admin", "hr", "manager")
def list_users():
    conn = get_db()
    db = conn.cursor()
    
    role = g.current_user["role"]
    if role == "hr":
        db.execute("SELECT * FROM users WHERE role = 'employee' AND department = ?", (g.current_user["department"],))
    elif role == "manager":
        db.execute("SELECT * FROM users WHERE role IN ('employee', 'hr')")
    else:
        db.execute("SELECT * FROM users")
    
    users = [serialize_user(row) for row in db.fetchall()]
    conn.close()
    return jsonify({"users": users})

@user_bp.route("", methods=["POST"])
@token_required
@role_required("admin")
def create_user():
    data = request.get_json() or {}
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    department = data.get("department")

    if not all([first_name, last_name, email, password, role]):
        return jsonify({"message": "Missing fields"}), 400

    conn = get_db()
    db = conn.cursor()
    db.execute("""
        INSERT INTO users (firstName, lastName, email, password, role, department)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (first_name, last_name, email, generate_password_hash(password), role, department))
    conn.commit()
    conn.close()
    return jsonify({"message": "User created"}), 201

@user_bp.route("/<int:user_id>", methods=["PUT"])
@token_required
@role_required("admin")
def update_user(user_id):
    data = request.get_json() or {}
    conn = get_db()
    db = conn.cursor()
    
    db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = db.fetchone()
    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404

    # Capture original data for logging or comparison
    original_role = user["role"]
    
    # If updating password, generate a token as requested
    password = data.get("password")
    if password:
        # User requirement: Only Admin can change Employee, HR, and Manager passwords.
        # This endpoint is already @role_required("admin").
        print(f"SECURITY: Admin {g.current_user['id']} (Email: {g.current_user['email']}) changed password for user {user_id} ({original_role})")
        
        new_hashed = generate_password_hash(password)
        db.execute("UPDATE users SET password = ? WHERE id = ?", (new_hashed, user_id))
        
        # Invalidate/Update session for the target user
        # Fetch latest state (in case role changed too)
        new_role = data.get("role", original_role)
        token = jwt.encode({
            "id": user_id,
            "firstName": user["firstName"],
            "role": new_role,
            "exp": datetime.utcnow() + timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")
        
        from services.token_service import save_token
        save_token(user_id, token)

    firstName = data.get("firstName", user["firstName"])
    lastName = data.get("lastName", user["lastName"])
    email = data.get("email", user["email"])
    role = data.get("role", user["role"])
    department = data.get("department", user["department"])

    db.execute("""
        UPDATE users SET firstName=?, lastName=?, email=?, role=?, department=?
        WHERE id=?
    """, (firstName, lastName, email, role, department, user_id))
    
    conn.commit()
    conn.close()
    return jsonify({"message": "User updated"})

@user_bp.route("/<int:user_id>", methods=["DELETE"])
@token_required
@role_required("admin")
def delete_user(user_id):
    conn = get_db()
    db = conn.cursor()
    
    db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = db.fetchone()
    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404

    # Delete notifications first (FK constraint)
    db.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
    
    # Delete the user
    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    
    conn.commit()
    conn.close()
    
    # Also clean up tokens in the other database
    tokens_conn = get_tokens_db()
    tdb = tokens_conn.cursor()
    tdb.execute("DELETE FROM tokens WHERE user_id = ?", (user_id,))
    tokens_conn.commit()
    tokens_conn.close()
    
    return jsonify({"message": "User deleted"}), 200

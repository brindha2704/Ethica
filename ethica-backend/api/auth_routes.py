from flask import Blueprint, request, jsonify, g
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from core.config import SECRET_KEY
from database.db_manager import get_db
from core.auth_middleware import serialize_user, token_required, role_required
from services.token_service import save_token, list_all_tokens

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not all([first_name, last_name, email, password, role]):
            return jsonify({"message": "All fields are required"}), 400

        conn = get_db()
        db = conn.cursor()
        
        db.execute("SELECT * FROM users WHERE email = ?", (email,))
        if db.fetchone():
            conn.close()
            return jsonify({"message": "Email already exists"}), 400

        hashed_password = generate_password_hash(password)
        db.execute("""
            INSERT INTO users (firstName, lastName, email, password, role)
            VALUES (?, ?, ?, ?, ?)
        """, (first_name, last_name, email, hashed_password, role))
        user_id = db.lastrowid
        conn.commit()
        
        # Capture token for new registration
        token = jwt.encode({
            "id": user_id,
            "firstName": first_name,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")
        
        save_token(user_id, token)
        
        conn.close()
        return jsonify({"message": "Registration successful", "token": token}), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        first_name = data.get("firstName")
        password = data.get("password")

        conn = get_db()
        db = conn.cursor()
        
        if email:
            db.execute("SELECT * FROM users WHERE email = ?", (email,))
        else:
            db.execute("SELECT * FROM users WHERE firstName = ?", (first_name,))
        
        user = db.fetchone()
        if not user or not check_password_hash(user["password"], password):
            conn.close()
            return jsonify({"message": "Invalid credentials"}), 401

        token = jwt.encode({
            "id": user["id"],
            "firstName": user["firstName"],
            "role": user["role"],
            "exp": datetime.utcnow() + timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        save_token(user["id"], token)
        conn.close()

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": serialize_user(user)
        })
    except Exception as e:
        return jsonify({"message": "Server error"}), 500

@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    return jsonify({"user": g.current_user})

@auth_bp.route("/admin/tokens", methods=["GET"])
@token_required
@role_required("admin")
def list_tokens():
    tokens = list_all_tokens()
    # Join with user info for better display
    conn = get_db()
    db = conn.cursor()
    
    enriched_tokens = []
    for t in tokens:
        db.execute("SELECT firstName, lastName, email, role FROM users WHERE id = ?", (t["user_id"],))
        u = db.fetchone()
        if u:
            t["user"] = dict(u)
        enriched_tokens.append(t)
    
    conn.close()
    return jsonify({"tokens": enriched_tokens})

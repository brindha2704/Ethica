import jwt
from flask import request, jsonify, g
from functools import wraps
from core.config import SECRET_KEY
from database.db_manager import get_db
from services.token_service import is_token_valid, get_token_user_id

def serialize_user(user):
    return {
        "id": user["id"],
        "firstName": user["firstName"],
        "lastName": user["lastName"],
        "email": user["email"],
        "role": user["role"],
        "department": user["department"]
    }

def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"message": "Missing token"}), 401

            token = auth_header.split(" ", 1)[1].strip()
            if not token:
                return jsonify({"message": "Invalid token"}), 401

            # Validate against separate tokens.db
            if not is_token_valid(token):
                return jsonify({"message": "Invalid or expired session"}), 401

            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("id")
            
            from database.db_manager import get_db, get_db_cursor, get_placeholder
            conn = get_db()
            db = get_db_cursor(conn)
            p = get_placeholder()
            db.execute(f"SELECT * FROM users WHERE id = {p}", (user_id,))
            user = db.fetchone()
            conn.close()

            if not user:
                return jsonify({"message": "User not found"}), 404

            g.current_user = serialize_user(user)
            return fn(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        except Exception as e:
            print("AUTH ERROR:", str(e))
            return jsonify({"message": "Server error"}), 500
    return wrapper

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if g.current_user.get("role") not in roles:
                return jsonify({"message": "Forbidden"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

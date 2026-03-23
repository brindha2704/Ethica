from datetime import datetime
from database.db_manager import get_tokens_db

def save_token(user_id, token):
    conn = get_tokens_db()
    db = conn.cursor()
    db.execute("INSERT INTO tokens (user_id, token, created_at) VALUES (?, ?, ?)",
               (user_id, token, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def is_token_valid(token):
    conn = get_tokens_db()
    db = conn.cursor()
    db.execute("SELECT user_id FROM tokens WHERE token = ?", (token,))
    row = db.fetchone()
    conn.close()
    return row is not None

def get_token_user_id(token):
    conn = get_tokens_db()
    db = conn.cursor()
    db.execute("SELECT user_id FROM tokens WHERE token = ?", (token,))
    row = db.fetchone()
    conn.close()
    return row["user_id"] if row else None

def list_all_tokens():
    conn = get_tokens_db()
    db = conn.cursor()
    db.execute("SELECT * FROM tokens ORDER BY created_at DESC")
    tokens = [dict(row) for row in db.fetchall()]
    conn.close()
    return tokens

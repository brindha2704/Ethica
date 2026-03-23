from database.db_manager import get_tokens_db, get_db_cursor, get_placeholder

def save_token(user_id, token):
    conn = get_tokens_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    db.execute(f"INSERT INTO tokens (user_id, token, created_at) VALUES ({p}, {p}, {p})",
               (user_id, token, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()

def is_token_valid(token):
    conn = get_tokens_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    db.execute(f"SELECT user_id FROM tokens WHERE token = {p}", (token,))
    row = db.fetchone()
    conn.close()
    return row is not None

def get_token_user_id(token):
    conn = get_tokens_db()
    db = get_db_cursor(conn)
    p = get_placeholder()
    db.execute(f"SELECT user_id FROM tokens WHERE token = {p}", (token,))
    row = db.fetchone()
    conn.close()
    return row["user_id"] if row else None

def list_all_tokens():
    conn = get_tokens_db()
    db = get_db_cursor(conn)
    db.execute("SELECT * FROM tokens ORDER BY created_at DESC")
    tokens = [dict(row) for row in db.fetchall()]
    conn.close()
    return tokens

import sqlite3
from core.config import DB_NAME, TOKENS_DB_NAME

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def get_tokens_db():
    conn = sqlite3.connect(TOKENS_DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

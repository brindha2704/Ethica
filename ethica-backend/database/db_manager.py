import os
import sqlite3
import psycopg2
import psycopg2.extras
from core.config import DATABASE_URL, DB_NAME

def get_db():
    if DATABASE_URL:
        # Connect to Postgres (Supabase)
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    elif os.getenv("VERCEL"):
        # Explicit error for Vercel if DATABASE_URL is missing
        raise ValueError("DATABASE_URL environment variable is MISSING on Vercel. Please add it to your Project Settings.")
    else:
        # Fallback to SQLite (local)
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row
        return conn

def get_tokens_db():
    if DATABASE_URL:
        return get_db()  # Use same DB for tokens in Postgres
    else:
        from core.config import TOKENS_DB_NAME
        conn = sqlite3.connect(TOKENS_DB_NAME)
        conn.row_factory = sqlite3.Row
        return conn

def get_db_cursor(conn):
    if hasattr(conn, "row_factory") and conn.row_factory == sqlite3.Row:
        return conn.cursor()
    else:
        # PostgreSQL cursor with dictionary-like behavior
        return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

def get_placeholder():
    return "%s" if DATABASE_URL else "?"

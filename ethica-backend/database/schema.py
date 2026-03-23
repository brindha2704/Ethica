from datetime import datetime
from database.db_manager import get_db, get_tokens_db

def init_db():
    print("Initializing main database...")
    main_conn = get_db()
    db = main_conn.cursor()

    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT
        )
    """)

    db.execute("PRAGMA table_info(users)")
    user_columns = {row["name"] for row in db.fetchall()}
    if "department" not in user_columns:
        db.execute("ALTER TABLE users ADD COLUMN department TEXT")

    db.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            assignee_name TEXT NOT NULL,
            assignee_role TEXT NOT NULL,
            status TEXT NOT NULL,
            due_date TEXT NOT NULL,
            created_by_role TEXT NOT NULL,
            assignee_user_id INTEGER,
            project_name TEXT,
            client_name TEXT,
            created_by_user_id INTEGER,
            updated_at TEXT,
            employee_report TEXT,
            escalation_level TEXT DEFAULT 'Normal',
            completed_at TEXT
        )
    """)

    db.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    db.execute("""
        CREATE TABLE IF NOT EXISTS escalation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id INTEGER NOT NULL,
            escalation_level TEXT NOT NULL,
            triggered_at TEXT NOT NULL,
            FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
    """)

    main_conn.commit()
    main_conn.close()

    print("Initializing tokens database...")
    tokens_conn = get_tokens_db()
    tdb = tokens_conn.cursor()
    tdb.execute("""
        CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    tokens_conn.commit()
    tokens_conn.close()

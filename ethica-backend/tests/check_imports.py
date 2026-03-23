try:
    from flask import Flask, request, jsonify, g
    from flask_cors import CORS
    import sqlite3
    from werkzeug.security import generate_password_hash, check_password_hash
    import jwt
    from flask_apscheduler import APScheduler
    print("All imports successful")
except ImportError as e:
    print(f"Import failed: {e}")
except Exception as e:
    print(f"Error: {e}")

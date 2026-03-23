from flask import Flask, jsonify
from flask_cors import CORS
from core.config import ALLOWED_ORIGINS
from database.schema import init_db
from api.auth_routes import auth_bp
from api.user_routes import user_bp
from api.task_routes import task_bp
from api.notification_routes import notification_bp
from api.admin_routes import admin_bp
from api.hr_routes import hr_bp
from api.manager_routes import manager_bp
from api.employee_routes import employee_bp
from api.report_routes import report_bp
from services.deadline_service import start_deadline_checker

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=True)


# Registered Blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(user_bp, url_prefix="/api/users")
app.register_blueprint(task_bp, url_prefix="/api/tasks")
app.register_blueprint(notification_bp, url_prefix="/api/notifications")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(hr_bp, url_prefix="/api/hr")
app.register_blueprint(manager_bp, url_prefix="/api/manager")
app.register_blueprint(employee_bp, url_prefix="/api/employee")
app.register_blueprint(report_bp, url_prefix="/api/reports")

@app.route("/")
def home():
    return jsonify({"message": "Ethica Modular Backend Running 🚀"})

if __name__ == "__main__":
    init_db()
    # Don't start separate thread if on Vercel (handled by cron or manual triggers later)
    if not os.getenv("VERCEL"):
        start_deadline_checker()
    app.run(debug=True, port=5000)

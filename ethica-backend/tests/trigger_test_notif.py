import sqlite3
from datetime import datetime

def trigger_notification(user_id, message, msg_type="info"):
    conn = sqlite3.connect(r'c:\Users\brind\OneDrive\Desktop\Ethica\ethica-backend\ethica.db')
    db = conn.cursor()
    
    db.execute("""
        INSERT INTO notifications (user_id, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, message, msg_type, 0, datetime.utcnow().isoformat()))
    
    conn.commit()
    conn.close()
    print(f"Notification triggered for user {user_id}: {message}")

if __name__ == "__main__":
    # Manager David Jones (ID 2)
    trigger_notification(2, "Test Notification: Your quarterly report is ready for review!", "info")
    trigger_notification(2, "Escalation: Task 'Project Report' is now Critical!", "escalation")
    
    # HR Sarah Williams (ID 3)
    trigger_notification(3, "Alert: New overdue tasks in Technical department", "escalation")
    trigger_notification(3, "Info: Performance reviews scheduled for next week", "info")
    
    # Admin John Smith (ID 1)
    trigger_notification(1, "Critical: Database backup completed with warnings", "escalation")
    trigger_notification(1, "Notice: 5 new users registered today", "info")

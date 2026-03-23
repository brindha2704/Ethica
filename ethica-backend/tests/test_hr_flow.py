import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_hr_flow():
    # 1. Login as Sarah (HR)
    print("Logging in as Sarah Williams (HR Technical)...")
    try:
        resp = requests.post(f"{BASE_URL}/api/login", json={
            "email": "sarah.w@ethica.com", 
            "password": "HR_Exact#2024" 
        })
        
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} - {resp.text}")
            return

        data = resp.json()
        token = data.get("token")
        print("Login successful. Token received.")

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get HR Overview
        print("\nFetching HR Overview...")
        resp = requests.get(f"{BASE_URL}/api/hr/overview", headers=headers)
        if resp.status_code == 200:
            print("HR Overview Response received.")
            # print(json.dumps(resp.json(), indent=2))
        else:
            print(f"Failed to fetch overview: {resp.status_code} - {resp.text}")

        # 3. Get HR Employees
        print("\nFetching HR Employees...")
        resp = requests.get(f"{BASE_URL}/api/hr/employees", headers=headers)
        if resp.status_code == 200:
            print("HR Employees list received.")
        else:
            print(f"Failed to fetch employees: {resp.status_code} - {resp.text}")

        # 4. Create a task
        print("\nAssigning a new task...")
        # Get first employee ID from the list
        employees = resp.json().get("employees", [])
        if employees:
            emp_id = employees[0]["id"]
            task_resp = requests.post(f"{BASE_URL}/api/hr/tasks", headers=headers, json={
                "title": "Verification Task",
                "assigneeUserId": emp_id,
                "dueDate": "2026-03-20",
                "projectName": "Verification Project"
            })
            if task_resp.status_code == 201:
                print("Task assigned successfully.")
            else:
                print(f"Failed to assign task: {task_resp.status_code} - {task_resp.text}")
        else:
            print("No employees found to assign task.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_hr_flow()

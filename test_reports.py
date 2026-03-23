import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

# Get a manager token from tokens.txt or seeds logic (David Jones is manager)
# Let's try to login directly to get a fresh token
def get_token(email, password):
    resp = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json()["token"]
    return None

def test_report():
    # Manager: David Jones
    mgr_token = get_token("david.j@ethica.com", "Mgr_Lead$99")
    if not mgr_token:
        print("Failed to get Manager token")
        return

    print("\n--- Testing Manager Deadline Report ---")
    headers = {"Authorization": f"Bearer {mgr_token}"}
    resp = requests.get(f"{BASE_URL}/reports/deadline-violations", headers=headers)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        violations = resp.json().get("violations", [])
        print(f"Found {len(violations)} violations")
        if violations:
            print("Sample Violation:", json.dumps(violations[0], indent=2))
    else:
        print(resp.text)

    # HR: Sarah Williams (Technical department)
    hr_token = get_token("sarah.w@ethica.com", "HR_Exact#2024")
    if not hr_token:
        print("Failed to get HR token")
        return

    print("\n--- Testing HR (Technical) Deadline Report ---")
    headers = {"Authorization": f"Bearer {hr_token}"}
    resp = requests.get(f"{BASE_URL}/reports/deadline-violations", headers=headers)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        violations = resp.json().get("violations", [])
        print(f"Found {len(violations)} violations")
        for v in violations:
            if v["department"] != "Technical":
                print(f"ERROR: Found violation in wrong department: {v['department']}")
        if violations:
            print("Sample HR Violation:", json.dumps(violations[0], indent=2))
    else:
        print(resp.text)

if __name__ == "__main__":
    test_report()

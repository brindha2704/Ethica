import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def login(email, password):
    resp = requests.post(f"{BASE_URL}/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json()["token"]
    print(f"Login failed for {email}: {resp.status_code} {resp.text}")
    return None

def test_restriction():
    # 1. Login as Admin
    print("Testing as Admin...")
    admin_token = login("admin@ethica.com", "SuperAdmin@2024")
    if not admin_token: return

    # 2. Admin resets employee password (Mary Miller, ID 6 based on seeds sequence maybe? Let's check ID)
    # Actually, I'll fetch user list first to be sure
    resp = requests.get(f"{BASE_URL}/users", headers={"Authorization": f"Bearer {admin_token}"})
    users = resp.json()["users"]
    mary = next(u for u in users if u["email"] == "mary.m@ethica.com")
    mary_id = mary["id"]

    print(f"Admin resetting password for Mary (ID: {mary_id})...")
    new_pass = "NewPass@123"
    resp = requests.put(f"{BASE_URL}/users/{mary_id}", 
                        json={"password": new_pass}, 
                        headers={"Authorization": f"Bearer {admin_token}"})
    print(f"Admin Reset Status: {resp.status_code}")
    assert resp.status_code == 200

    # 3. Verify Mary can login with NEW password
    print("Verifying Mary's new password...")
    mary_token = login("mary.m@ethica.com", new_pass)
    if mary_token:
        print("Mary successfully logged in with new password.")
    else:
        print("FAILURE: Mary could not log in with new password.")
        return

    # 4. Attempt to change OWN password as Mary (Non-Admin)
    print("Attempting to change own password as Mary (should FAIL)...")
    resp = requests.put(f"{BASE_URL}/users/{mary_id}", 
                        json={"password": "AnotherPass@999"}, 
                        headers={"Authorization": f"Bearer {mary_token}"})
    print(f"Non-Admin Reset Status (expected 403): {resp.status_code}")
    if resp.status_code == 403:
        print("SUCCESS: Non-admin was correctly blocked.")
    else:
        print("FAILURE: Non-admin was NOT blocked.")

if __name__ == "__main__":
    try:
        test_restriction()
    except Exception as e:
        print(f"Error during test: {e}")

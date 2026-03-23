import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_manager_flow():
    # 1. Login
    print("Logging in as David Jones (Manager)...")
    try:
        resp = requests.post(f"{BASE_URL}/api/login", json={
            "email": "david.j@ethica.com", 
            "password": "Mgr_Lead$99" 
        })
        
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} - {resp.text}")
            return

        data = resp.json()
        token = data.get("token")
        print("Login successful. Token received.")

        # 2. Get Manager Overview
        print("\nFetching Manager Overview...")
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/api/manager/overview", headers=headers)
        
        if resp.status_code == 200:
            print("Manager Overview Response:")
            print(json.dumps(resp.json(), indent=2))
        else:
            print(f"Failed to fetch overview: {resp.status_code} - {resp.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_manager_flow()

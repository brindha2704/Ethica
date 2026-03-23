import requests
import jwt
import datetime

BASE_URL = "http://127.0.0.1:5000"
SECRET_KEY = "ethica_super_secret_key"

def get_curl_test():
    # 1. Login to get a valid token
    resp = requests.post(f"{BASE_URL}/api/login", json={
        "firstName": "John",
        "password": "SuperAdmin@2024"
    })
    
    if resp.status_code != 200:
        print("Login failed, please make sure the backend is running.")
        return

    token = resp.json().get("token")
    
    print("\n--- COPY AND PASTE THIS COMMAND INTO YOUR TERMINAL ---")
    print(f'curl -H "Authorization: Bearer {token}" {BASE_URL}/api/admin/overview')
    print("------------------------------------------------------\n")

if __name__ == "__main__":
    get_curl_test()

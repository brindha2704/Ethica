import requests

def get_token_and_print_curl():
    try:
        url = "http://127.0.0.1:5000/api/login"
        payload = {"firstName": "John", "password": "SuperAdmin@2024"}
        resp = requests.post(url, json=payload)
        
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code}")
            return
            
        token = resp.json().get("token")
        
        print("\n--- COPY AND PASTE THIS INTO YOUR TERMINAL ---")
        print(f'curl -H "Authorization: Bearer {token}" http://127.0.0.1:5000/api/admin/overview')
        print("----------------------------------------------\n")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_token_and_print_curl()

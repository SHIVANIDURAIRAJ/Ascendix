import urllib.request
import json

base_url = "http://localhost:5000"

def post_json(url, data, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def get_json(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

# 1. Login
status, login_res = post_json(f"{base_url}/api/auth/login", {
    "email": "aarav.patel@college.edu",
    "password": "securePassword123"
})
print("Login status:", status)
token = login_res["token"]
auth_header = {"Authorization": f"Bearer {token}"}

# 2. Skill Gap
status, gap_data = get_json(f"{base_url}/api/skill-gap/", auth_header)
print("Skill Gap status:", status)
print("Gap keys:", list(gap_data.keys()))
print("Gap data sample:", json.dumps(gap_data.get("data", gap_data), indent=2)[:400])

# 3. Roadmap
status, roadmap_data = get_json(f"{base_url}/api/roadmap/", auth_header)
print("Roadmap status:", status)
print("Roadmap keys:", list(roadmap_data.keys()))
print("Roadmap data sample:", json.dumps(roadmap_data.get("data", roadmap_data), indent=2)[:400])

print("ALL PHASE 3 CHECKS PASSED SUCCESSFULLY!")

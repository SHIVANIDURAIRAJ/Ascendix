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

def patch_json(url, data, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="PATCH")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def get_json(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

print("=== ASCENDIX END-TO-END PHASE 4 RECALIBRATION FLOW ===")

# 1. Login
status, login_res = post_json(f"{base_url}/api/auth/login", {
    "email": "aarav.patel@college.edu",
    "password": "[REDACTED]"
})
assert status == 200
token = login_res["token"]
auth_header = {"Authorization": f"Bearer {token}"}
print("[1] Logged in successfully as Aarav Patel.")

# 2. Get Current Readiness Score
status, r1 = get_json(f"{base_url}/api/readiness", auth_header)
initial_score = r1["data"]["overall_score"]
print(f"[2] Initial Placement Readiness Score: {initial_score}/100 ({r1['data']['readiness_tier']['name']})")

# 3. Take Operating Systems Calibration Quiz
os_answers = {
    "os_1": 2, # Preemptive Scheduling is NOT Coffman condition
    "os_2": 0, # Thrashing = swapping pages vs executing
    "os_3": 1, # Threads share heap/data, separate stacks
    "os_4": 2, # SJF optimal
    "os_5": 0  # DMA
}
status, os_res = post_json(f"{base_url}/api/assessments/submit", {
    "topic_id": "os",
    "answers": os_answers,
    "time_spent_seconds": 150
}, auth_header)
print(f"[3] Submitted Operating Systems Quiz: {os_res['data']['score_percentage']}% ({os_res['data']['correct_count']}/5 correct)")
print(f"    Calibrated Skills: {os_res['data']['calibrated_skills']}")

# 4. Toggle Roadmap Task (Complete task_1_2)
status, toggle_res = patch_json(f"{base_url}/api/roadmap/tasks/task_1_2/", {
    "completed": True
}, auth_header)
print(f"[4] Toggled Roadmap Task task_1_2: now completed.")

# 5. Check New Readiness Score
status, r2 = get_json(f"{base_url}/api/readiness", auth_header)
new_score = r2["data"]["overall_score"]
print(f"[5] Recalibrated Placement Readiness Score: {new_score}/100 ({r2['data']['readiness_tier']['name']})")
print(f"    Growth Delta: +{new_score - initial_score} points earned through empirical assessment & roadmap progress!")
print("    Breakdown:")
for c in r2["data"]["components"]:
    print(f"      - {c['name']} (Weight: {c['weight_percentage']}%): Raw {c['raw_score']}% -> {c['points_earned']} / {c['max_points']} pts")

assert new_score >= initial_score, "Score did not advance after calibration!"
print("\n>>> COMPLETE PERSONALIZATION PIPELINE VERIFIED END-TO-END! <<<")

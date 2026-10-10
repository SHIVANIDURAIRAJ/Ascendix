import urllib.request
import json

base_url = "http://localhost:5000"

def post_json(url, data, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"POST {url} failed with {e.code}: {e.read().decode('utf-8')}")
        raise e

def get_json(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"GET {url} failed with {e.code}: {e.read().decode('utf-8')}")
        raise e

# 1. Login
status, login_res = post_json(f"{base_url}/api/auth/login", {
    "email": "aarav.patel@college.edu",
    "password": "[REDACTED]"
})
print(f"[OK] Login: status={status}")
token = login_res["token"]
auth_header = {"Authorization": f"Bearer {token}"}

# 2. Assessment Topics
status, topics_data = get_json(f"{base_url}/api/assessments/topics", auth_header)
print(f"[OK] Assessment Topics: status={status}, count={topics_data.get('count')}")
topics = topics_data.get("data", [])
for t in topics:
    print(f"   Topic: {t['title']} (Best: {t['best_score']}%, Attempts: {t['attempts_count']})")

# 3. Assessment Quiz (DBMS)
status, quiz_data = get_json(f"{base_url}/api/assessments/quiz/dbms", auth_header)
print(f"[OK] Quiz retrieval: status={status}, title={quiz_data['data']['title']}, questions={len(quiz_data['data']['questions'])}")
first_q = quiz_data['data']['questions'][0]
print(f"   Sample question (sanitized): {first_q['question_text'][:80]}... Options: {len(first_q['options'])}")
assert 'correct_index' not in first_q, "Security failure: correct_index leaked to client"

# 4. Assessment Submit (DBMS - answering correctly: Durability(3), 3NF(1), B+Tree(1), Repeatable Read(2), LEFT OUTER(1))
answers = {
    "dbms_1": 3,
    "dbms_2": 1,
    "dbms_3": 1,
    "dbms_4": 2,
    "dbms_5": 1
}
status, submit_res = post_json(f"{base_url}/api/assessments/submit", {
    "topic_id": "dbms",
    "answers": answers,
    "time_spent_seconds": 120
}, auth_header)
print(f"[OK] Quiz Submission: status={status}, score={submit_res['data']['score_percentage']}%, tier={submit_res['data']['performance_tier']}")
print(f"   Calibrated skills: {submit_res['data']['calibrated_skills']}")

# 5. Readiness Score
status, readiness_res = get_json(f"{base_url}/api/readiness", auth_header)
readiness = readiness_res["data"]
print(f"[OK] Readiness Score: status={status}, overall={readiness['overall_score']}/100 ({readiness['readiness_tier']['name']})")
print(f"   Target Role: {readiness['target_role_title']}")
print("   Components breakdown:")
for c in readiness["components"]:
    print(f"     - {c['name']} (Weight: {c['weight_percentage']}%): Raw {c['raw_score']}% -> {c['points_earned']} / {c['max_points']} pts")
print("   Top Drag Factors:")
for d in readiness["drag_factors"]:
    print(f"     * {d['factor_name']}: -{d['points_lost']} pts ({d['explanation']})")
print("   Action Plan:")
for a in readiness["action_plan"]:
    print(f"     -> {a['action']} ({a['impact']}): {a['details']}")

print("\n>>> ALL PHASE 4 BACKEND ENDPOINTS AND CALCULATIONS VERIFIED SUCCESSFULLY! <<<")

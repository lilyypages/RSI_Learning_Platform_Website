#!/usr/bin/env python3
"""Generate Postman-style screenshots using weasyprint HTML->PNG"""
import json
import os
import weasyprint

BASE = "screenshots"

METHOD_COLORS = {
    "POST": "#27ae60",
    "GET":  "#3498db",
    "PUT":  "#f39c12",
    "DELETE": "#e74c3c",
    "PATCH": "#8e44ad",
}

def style(method, url, req_body, resp_code, resp_body):
    mc = METHOD_COLORS.get(method, "#777")
    body_html = ""
    if req_body:
        body_html = f"""
        <div class="section-label">Body</div>
        <pre class="code">{json.dumps(req_body, indent=2)}</pre>
        """

    if isinstance(resp_body, str):
        resp_str = resp_body
    else:
        resp_str = json.dumps(resp_body, indent=2, ensure_ascii=False)

    sc = "#27ae60" if resp_code < 300 else "#f39c12" if resp_code < 400 else "#e74c3c"

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: 'DejaVu Sans Mono', 'Courier New', monospace;
    font-size: 13px;
    background: #f5f5f5;
    padding: 20px;
  }}
  .card {{
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,.1);
    overflow: hidden;
    max-width: 900px;
  }}
  .header {{
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
  }}
  .method {{
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    background: {mc};
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    margin-right: 12px;
  }}
  .url {{
    font-size: 14px;
    color: #333;
  }}
  .tabs {{
    display: flex;
    padding: 8px 20px 0;
    border-bottom: 1px solid #eee;
    font-size: 12px;
    color: #666;
  }}
  .tab {{ padding: 6px 14px; cursor: pointer; }}
  .tab.active {{
    color: #3498db;
    border-bottom: 2px solid #3498db;
  }}
  .content {{ padding: 16px 20px; }}
  .section-label {{
    font-size: 12px;
    font-weight: bold;
    color: #555;
    margin-bottom: 8px;
  }}
  pre.code {{
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 12px;
    font-size: 13px;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }}
  .response-status {{
    padding: 10px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
  }}
  .status-badge {{
    display: inline-block;
    padding: 3px 10px;
    border-radius: 3px;
    background: {sc};
    color: #fff;
    font-weight: bold;
    font-size: 13px;
  }}
  .response-label {{
    font-size: 12px;
    font-weight: bold;
    color: #555;
    margin-bottom: 8px;
  }}
</style></head><body>
<div class="card">
  <div class="header">
    <span class="method">{method}</span>
    <span class="url">{url}</span>
  </div>
  <div class="tabs">
    <span class="tab">Params</span>
    <span class="tab">Auth</span>
    <span class="tab active">Body</span>
    <span class="tab">Scripts</span>
  </div>
  <div class="content">
    {body_html}
  </div>
  <div class="response-status">
    <span class="status-badge">{resp_code}</span>
    <span style="margin-left:10px;color:#666;">Response</span>
  </div>
  <div class="content">
    <pre class="code">{resp_str}</pre>
  </div>
</div>
</body></html>"""

def status_code_from_body(body):
    """Infer status code from response body"""
    if isinstance(body, dict):
        if body.get("success") is True:
            return 200
        if body.get("success") is False:
            if "salah" in str(body.get("message", "")):
                return 401
            if "valid" in str(body.get("message", "")):
                return 400
            if "Forbidden" in str(body.get("error", "")):
                return 403
            return 400
        if body.get("error"):
            if "Forbidden" in str(body.get("error", "")):
                return 403
            return 500
        if isinstance(body, list):
            return 200
        if "success" in body:
            return 200
    if isinstance(body, str):
        if "redirect" in body.lower():
            return 302
    return 200

test_specs = [
    ("1_login_kepsek.json", "POST", "http://localhost:3001/api/auth/login", {"email": "kepsek@test.com", "password": "password123"}),
    ("2_login_guru.json", "POST", "http://localhost:3001/api/auth/login", {"email": "guru@test.com", "password": "password123"}),
    ("3_login_siswa.json", "POST", "http://localhost:3001/api/auth/login", {"email": "siswa@test.com", "password": "password123"}),
    ("4_login_ortu.json", "POST", "http://localhost:3001/api/auth/login", {"email": "ortu@test.com", "password": "password123"}),
    ("5_login_wrong_password.json", "POST", "http://localhost:3001/api/auth/login", {"email": "kepsek@test.com", "password": "wrongpass"}),
    ("6_login_validation_error.json", "POST", "http://localhost:3001/api/auth/login", {"email": "notanemail"}),
    ("9_notifications.json", "GET", "http://localhost:3001/api/notifications", None),
    ("10_progress_siswa.json", "GET", "http://localhost:3001/api/progress", None),
    ("11_progress_kepsek.json", "GET", "http://localhost:3001/api/progress", None),
    ("12_messages.json", "GET", "http://localhost:3001/api/messages", None),
    ("13_quiz_sessions.json", "GET", "http://localhost:3001/api/quiz/sessions", None),
    ("14_guru_dashboard.json", "GET", "http://localhost:3001/api/guru/dashboard", None),
    ("15_guru_subjects.json", "GET", "http://localhost:3001/api/guru/subjects", None),
    ("16_teachers.json", "GET", "http://localhost:3001/api/teachers", None),
    ("17_students.json", "GET", "http://localhost:3001/api/students", None),
    ("18_users.json", "GET", "http://localhost:3001/api/users", None),
    ("22_unauthorized.json", "GET", "http://localhost:3001/api/guru/dashboard", None),
]

os.makedirs(f"{BASE}/images", exist_ok=True)

for fname, method, url, req_body in test_specs:
    filepath = f"{BASE}/{fname}"
    if not os.path.exists(filepath):
        print(f"  SKIP {fname}")
        continue

    with open(filepath) as f:
        raw = f.read()

    try:
        resp_body = json.loads(raw)
    except:
        resp_body = raw

    if isinstance(raw, str) and raw.startswith("/auth/"):
        resp_body = {"redirect": raw}
        code = 302
    else:
        code = status_code_from_body(resp_body)

    html = style(method, url, req_body, code, resp_body)
    outname = f"{BASE}/images/{fname.replace('.json', '.png')}"

    pdf_path = f"/tmp/_ss_{fname}"
    doc = weasyprint.HTML(string=html)
    doc.write_pdf(pdf_path)
    prefix = outname.replace('.png', '')
    os.system(f"pdftoppm -png -r 150 -singlefile \"{pdf_path}\" \"{prefix}\"")
    os.remove(pdf_path)
    if os.path.exists(outname):
        print(f"  -> {outname} ({os.path.getsize(outname)} bytes)")
    else:
        print(f"  FAIL -> {outname}")

print(f"\nSelesai! Semua screenshot di {BASE}/images/")

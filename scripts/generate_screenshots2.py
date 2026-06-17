#!/usr/bin/env python3
"""
generate_screenshots2.py — Generate Postman-style API screenshot images
Reads JSON response files from screenshots/ and generates PNG images.
Covers all 4 roles: PRINCIPAL, TEACHER, STUDENT, PARENT.

Usage:
  python3 scripts/generate_screenshots2.py
"""
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

ROLE_COLORS = {
    "PRINCIPAL": "#8e44ad",
    "TEACHER":   "#e67e22",
    "STUDENT":   "#27ae60",
    "PARENT":    "#3498db",
    "AUTH":      "#2c3e50",
    "CROSS":     "#e74c3c",
    "MESSAGE":   "#16a085",
    "LOGOUT":    "#95a5a6",
}


def style(method, url, req_body, resp_code, resp_body, role_label=""):
    mc = METHOD_COLORS.get(method, "#777")
    rc = ROLE_COLORS.get(role_label, "#555")
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

    role_badge = f'<span style="background:{rc};color:#fff;padding:3px 10px;border-radius:3px;font-size:11px;font-weight:bold;margin-left:12px;">{role_label}</span>' if role_label else ""

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
</style></head><body>
<div class="card">
  <div class="header">
    <span class="method">{method}</span>
    <span class="url">{url}</span>
    {role_badge}
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
            msg = str(body.get("message", ""))
            if "Unauthorized" in msg or "salah" in msg:
                return 401
            if "Forbidden" in msg:
                return 403
            if "valid" in msg or "wajib" in msg:
                return 400
            if "ditemukan" in msg:
                return 404
            return 400
        if body.get("error"):
            if "Forbidden" in str(body.get("error", "")):
                return 403
            return 500
    if isinstance(body, list):
        return 200
    if isinstance(body, str):
        if "redirect" in body.lower() or body.startswith("/"):
            return 302
    return 200


# ═══════════════════════════════════════════════════════════════════════
# Test Specs — all 4 roles
# Format: (filename, method, url, req_body, role_label)
# ═══════════════════════════════════════════════════════════════════════
API = "http://localhost:3001"

test_specs = [
    # ── A. AUTHENTICATION ──
    ("A01_login_kepsek.json",           "POST", f"{API}/api/auth/login", {"email": "kepsek@test.com", "password": "admin123"}, "AUTH"),
    ("A02_login_guru.json",             "POST", f"{API}/api/auth/login", {"email": "guru@test.com", "password": "admin123"}, "AUTH"),
    ("A03_login_siswa.json",            "POST", f"{API}/api/auth/login", {"email": "siswa@test.com", "password": "admin123"}, "AUTH"),
    ("A04_login_ortu.json",             "POST", f"{API}/api/auth/login", {"email": "ortu@test.com", "password": "admin123"}, "AUTH"),
    ("A05_login_wrong_password.json",   "POST", f"{API}/api/auth/login", {"email": "kepsek@test.com", "password": "wrongpass"}, "AUTH"),
    ("A06_login_validation_error.json", "POST", f"{API}/api/auth/login", {"email": "notanemail"}, "AUTH"),

    # ── B. PRINCIPAL (KEPSEK) ──
    ("B01_kepsek_users.json",           "GET", f"{API}/api/users", None, "PRINCIPAL"),
    ("B02_kepsek_teachers.json",        "GET", f"{API}/api/teachers", None, "PRINCIPAL"),
    ("B03_kepsek_students.json",        "GET", f"{API}/api/students", None, "PRINCIPAL"),
    ("B04_kepsek_classes.json",         "GET", f"{API}/api/classes", None, "PRINCIPAL"),
    ("B05_kepsek_subjects.json",        "GET", f"{API}/api/subjects", None, "PRINCIPAL"),
    ("B06_kepsek_audit_log.json",       "GET", f"{API}/api/audit-log", None, "PRINCIPAL"),
    ("B07_kepsek_progress.json",        "GET", f"{API}/api/progress", None, "PRINCIPAL"),
    ("B08_kepsek_profile.json",         "GET", f"{API}/api/profile", None, "PRINCIPAL"),
    ("B09_kepsek_notifications.json",   "GET", f"{API}/api/notifications", None, "PRINCIPAL"),
    ("B10_kepsek_reset_password.json",  "POST", f"{API}/api/auth/reset-password", {"userId": "test-user-id"}, "PRINCIPAL"),

    # ── C. TEACHER (GURU) ──
    ("C01_guru_dashboard.json",    "GET", f"{API}/api/guru/dashboard", None, "TEACHER"),
    ("C02_guru_subjects.json",     "GET", f"{API}/api/guru/subjects", None, "TEACHER"),
    ("C03_guru_materials.json",    "GET", f"{API}/api/materials", None, "TEACHER"),
    ("C04_guru_students.json",     "GET", f"{API}/api/students?includeProgress=true", None, "TEACHER"),
    ("C05_guru_reports.json",      "GET", f"{API}/api/reports", None, "TEACHER"),
    ("C06_guru_messages.json",     "GET", f"{API}/api/messages", None, "TEACHER"),
    ("C07_guru_questions.json",    "GET", f"{API}/api/questions", None, "TEACHER"),
    ("C08_guru_profile.json",      "GET", f"{API}/api/profile", None, "TEACHER"),
    ("C09_guru_notifications.json","GET", f"{API}/api/notifications", None, "TEACHER"),
    ("C10_guru_progress.json",     "GET", f"{API}/api/progress", None, "TEACHER"),

    # ── D. STUDENT (SISWA) ──
    ("D01_siswa_profile.json",        "GET", f"{API}/api/profile", None, "STUDENT"),
    ("D02_siswa_progress.json",       "GET", f"{API}/api/progress", None, "STUDENT"),
    ("D03_siswa_materials.json",      "GET", f"{API}/api/materials", None, "STUDENT"),
    ("D04_siswa_messages.json",       "GET", f"{API}/api/messages", None, "STUDENT"),
    ("D05_siswa_quiz_sessions.json",  "GET", f"{API}/api/quiz/sessions", None, "STUDENT"),
    ("D06_siswa_notifications.json",  "GET", f"{API}/api/notifications", None, "STUDENT"),
    ("D07_siswa_subjects.json",       "GET", f"{API}/api/subjects", None, "STUDENT"),

    # ── E. PARENT (ORTU) ──
    ("E01_ortu_profile.json",       "GET", f"{API}/api/profile", None, "PARENT"),
    ("E02_ortu_reports.json",       "GET", f"{API}/api/reports", None, "PARENT"),
    ("E03_ortu_messages.json",      "GET", f"{API}/api/messages", None, "PARENT"),
    ("E04_ortu_notifications.json", "GET", f"{API}/api/notifications", None, "PARENT"),
    ("E05_ortu_progress.json",      "GET", f"{API}/api/progress", None, "PARENT"),

    # ── F. CROSS-ROLE AUTHORIZATION ──
    ("F01_siswa_unauthorized_guru.json",  "GET", f"{API}/api/guru/dashboard", None, "CROSS"),
    ("F02_ortu_unauthorized_guru.json",   "GET", f"{API}/api/guru/dashboard", None, "CROSS"),
    ("F03_guru_unauthorized_audit.json",  "GET", f"{API}/api/audit-log", None, "CROSS"),
    ("F04_siswa_unauthorized_audit.json", "GET", f"{API}/api/audit-log", None, "CROSS"),
    ("F05_no_auth_profile.json",          "GET", f"{API}/api/profile", None, "CROSS"),

    # ── G. MESSAGING (WRITE) ──
    ("G01_guru_msg_to_siswa.json",       "POST", f"{API}/api/messages", {"receiverId": "<siswaId>", "content": "Halo siswa, bagaimana progressnya?"}, "MESSAGE"),
    ("G02_siswa_msg_to_guru.json",       "POST", f"{API}/api/messages", {"receiverId": "<guruId>", "content": "Terima kasih Bu Guru!"}, "MESSAGE"),
    ("G03_ortu_messages_after_sync.json", "GET", f"{API}/api/messages", None, "MESSAGE"),

    # ── H. LOGOUT ──
    ("H01_logout_kepsek.json", "POST", f"{API}/api/auth/logout", None, "LOGOUT"),
    ("H02_logout_guru.json",   "POST", f"{API}/api/auth/logout", None, "LOGOUT"),
    ("H03_logout_siswa.json",  "POST", f"{API}/api/auth/logout", None, "LOGOUT"),
    ("H04_logout_ortu.json",   "POST", f"{API}/api/auth/logout", None, "LOGOUT"),
]


os.makedirs(f"{BASE}/images", exist_ok=True)

generated = 0
skipped = 0

for entry in test_specs:
    fname, method, url, req_body, role_label = entry
    filepath = f"{BASE}/{fname}"
    if not os.path.exists(filepath):
        print(f"  SKIP {fname}")
        skipped += 1
        continue

    with open(filepath) as f:
        raw = f.read()

    try:
        resp_body = json.loads(raw)
    except Exception:
        resp_body = raw

    if isinstance(raw, str) and raw.startswith("/auth/"):
        resp_body = {"redirect": raw}
        code = 302
    else:
        code = status_code_from_body(resp_body)

    html = style(method, url, req_body, code, resp_body, role_label)
    outname = f"{BASE}/images/{fname.replace('.json', '.png')}"

    pdf_path = f"/tmp/_ss_{fname}"
    doc = weasyprint.HTML(string=html)
    doc.write_pdf(pdf_path)
    prefix = outname.replace('.png', '')
    os.system(f'pdftoppm -png -r 150 -singlefile "{pdf_path}" "{prefix}"')
    try:
        os.remove(pdf_path)
    except OSError:
        pass
    if os.path.exists(outname):
        print(f"  -> {outname} ({os.path.getsize(outname)} bytes)")
        generated += 1
    else:
        print(f"  FAIL -> {outname}")

print(f"\nSelesai! {generated} screenshot berhasil, {skipped} di-skip.")
print(f"Output: {BASE}/images/")

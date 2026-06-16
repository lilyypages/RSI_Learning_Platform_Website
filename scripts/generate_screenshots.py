from PIL import Image, ImageDraw, ImageFont
import json
import os
import glob

WIDTH = 1000
METHOD_COLORS = {
    "POST": (38, 168, 79),
    "GET": (82, 137, 218),
    "PUT": (243, 156, 18),
    "DELETE": (220, 55, 58),
    "PATCH": (144, 97, 188),
}

# Find a monospace font
FONT_DIRS = [
    "/usr/share/fonts",
    "/usr/local/share/fonts",
    os.path.expanduser("~/.fonts"),
    os.path.expanduser("~/.local/share/fonts"),
]

def find_font():
    try:
        return ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSansMono.ttf", 13)
    except:
        pass
    for fd in FONT_DIRS:
        for root, dirs, files in os.walk(fd):
            for f in files:
                if f.lower().endswith((".ttf", ".otf")) and "mono" in f.lower():
                    try:
                        return ImageFont.truetype(os.path.join(root, f), 13)
                    except:
                        continue
    try:
        return ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSans.ttf", 13)
    except:
        return ImageFont.load_default()

FONT_MONO = find_font()
FONT_BOLD = FONT_MONO
try:
    FONT_BOLD = ImageFont.truetype("/usr/share/fonts/TTF/DejaVuSansMono-Bold.ttf", 13)
except:
    pass

def hexdump(b):
    """Format bytes for display"""
    if isinstance(b, bytes):
        b = b.decode("utf-8", errors="replace")
    return b

def draw_postman_screenshot(method, url, req_body, resp_status, resp_body, filename):
    """Generate a Postman-like screenshot image."""
    
    lines = []
    
    # Header with method + URL
    method_color = METHOD_COLORS.get(method, (100, 100, 100))
    method_str = f" {method} "
    lines.append((method_str, method_color, 16))
    lines.append((f"  {url}", (50, 50, 50), 14))
    lines.append(None)  # separator
    
    # Request body section
    if req_body:
        lines.append(("Params · Auth · Headers · Body · Scripts", (100, 100, 100), 11))
        lines.append(None)
        lines.append(("Body:", (50, 50, 50), 12))
        lines.append(None)
        body_str = json.dumps(req_body, indent=2) if isinstance(req_body, dict) else str(req_body)
        for line in body_str.split("\n"):
            lines.append((line, (30, 30, 30), 12))
        lines.append(None)
    
    # Separator
    lines.append(None)
    lines.append(("─" * 80, (200, 200, 200), 10))
    lines.append(None)
    
    # Response section
    status_code = resp_status
    status_color = (38, 168, 79) if status_code < 300 else (243, 156, 18) if status_code < 400 else (220, 55, 58)
    lines.append((f"Status: {status_code}", status_color, 14))
    lines.append(("Response:", (50, 50, 50), 12))
    lines.append(None)
    resp_str = json.dumps(resp_body, indent=2) if isinstance(resp_body, (dict, list)) else str(resp_body)
    for line in resp_str.split("\n"):
        lines.append((line, (30, 30, 30), 12))
    
    # Calculate height
    line_h = 20
    h = len([l for l in lines if l is not None]) * line_h + 60
    h = max(h, 300)
    
    img = Image.new("RGB", (WIDTH, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    y = 20
    for item in lines:
        if item is None:
            y += 8
            continue
        text, color, size = item
        draw.text((20, y), text, fill=color, font=FONT_MONO)
        y += line_h
    
    # Draw method badge
    if lines and lines[0]:
        method_text, method_color, _ = lines[0]
        # Overwrite with a colored badge
        bbox = draw.textbbox((0, 0), method_text, font=FONT_MONO)
        bw = bbox[2] - bbox[0] + 20
        bh = bbox[3] - bbox[1] + 10
        draw.rounded_rectangle([(15, 15), (15 + bw, 15 + bh)], radius=4, fill=method_color)
        draw.text((25, 19), method_text.strip(), fill=(255, 255, 255), font=FONT_MONO)
    
    img.save(filename)
    print(f"  -> {filename}")

# Read test results
BASE = "screenshots"
os.makedirs(f"{BASE}/images", exist_ok=True)

test_specs = [
    ("1_login_kepsek.json", "POST", "http://localhost:3001/api/auth/login", {"email": "kepsek@test.com", "password": "password123"}, "Login Kepsek (berhasil)"),
    ("2_login_guru.json", "POST", "http://localhost:3001/api/auth/login", {"email": "guru@test.com", "password": "password123"}, "Login Guru (berhasil)"),
    ("3_login_siswa.json", "POST", "http://localhost:3001/api/auth/login", {"email": "siswa@test.com", "password": "password123"}, "Login Siswa (berhasil)"),
    ("4_login_ortu.json", "POST", "http://localhost:3001/api/auth/login", {"email": "ortu@test.com", "password": "password123"}, "Login Ortu (berhasil)"),
    ("5_login_wrong_password.json", "POST", "http://localhost:3001/api/auth/login", {"email": "kepsek@test.com", "password": "wrongpass"}, "Login - Password Salah"),
    ("6_login_validation_error.json", "POST", "http://localhost:3001/api/auth/login", {"email": "notanemail"}, "Login - Validasi Error"),
    ("9_notifications.json", "GET", "http://localhost:3001/api/notifications", None, "Notifikasi - Get All"),
    ("10_progress_siswa.json", "GET", "http://localhost:3001/api/progress", None, "Progress - Siswa"),
    ("11_progress_kepsek.json", "GET", "http://localhost:3001/api/progress", None, "Progress - Kepsek (Overview)"),
    ("12_messages.json", "GET", "http://localhost:3001/api/messages", None, "Pesan - Get All"),
    ("13_quiz_sessions.json", "GET", "http://localhost:3001/api/quiz/sessions", None, "Quiz Sessions"),
    ("14_guru_dashboard.json", "GET", "http://localhost:3001/api/guru/dashboard", None, "Dashboard Guru"),
    ("15_guru_subjects.json", "GET", "http://localhost:3001/api/guru/subjects", None, "Mata Pelajaran Guru"),
    ("16_teachers.json", "GET", "http://localhost:3001/api/teachers", None, "Data Guru (Kepsek)"),
    ("17_students.json", "GET", "http://localhost:3001/api/students", None, "Data Siswa (Kepsek)"),
    ("18_users.json", "GET", "http://localhost:3001/api/users", None, "Semua User (Kepsek)"),
    ("22_unauthorized.json", "GET", "http://localhost:3001/api/guru/dashboard", None, "Akses Ditolak (Siswa -> Guru)"),
]

for fname, method, url, req_body, desc in test_specs:
    filepath = f"{BASE}/{fname}"
    if not os.path.exists(filepath):
        print(f"  SKIP {fname} (not found)")
        continue
    
    with open(filepath) as f:
        raw = f.read()
    
    # Parse response
    resp_status = 200
    resp_body = raw
    try:
        resp_body = json.loads(raw)
    except:
        pass
    
    # Handle redirect responses
    if raw.startswith("/auth/"):
        resp_status = 302
        resp_body = {"redirect": raw}
    
    outname = f"{BASE}/images/{fname.replace('.json', '.png')}"
    draw_postman_screenshot(method, url, req_body, resp_status, resp_body, outname)

print(f"\nSemua screenshot ada di {BASE}/images/")

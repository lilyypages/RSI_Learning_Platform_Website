#!/bin/bash
BASE="http://localhost:3001"
OUTDIR="screenshots"
mkdir -p "$OUTDIR"

COOKIE_JAR="/tmp/rsi_cookies.txt"

echo "=== 1. LOGIN KEPSEK ==="
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kepsek@test.com","password":"password123"}' \
  -c "$COOKIE_JAR" > "$OUTDIR/1_login_kepsek.json"

echo "=== 2. LOGIN GURU ==="
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"guru@test.com","password":"password123"}' \
  -c /tmp/rsi_guru_cookies.txt > "$OUTDIR/2_login_guru.json"

echo "=== 3. LOGIN SISWA ==="
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"siswa@test.com","password":"password123"}' \
  -c /tmp/rsi_siswa_cookies.txt > "$OUTDIR/3_login_siswa.json"

echo "=== 4. LOGIN ORTU ==="
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ortu@test.com","password":"password123"}' \
  -c /tmp/rsi_ortu_cookies.txt > "$OUTDIR/4_login_ortu.json"

echo "=== 5. LOGIN WRONG PASSWORD ==="
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kepsek@test.com","password":"wrongpass"}' > "$OUTDIR/5_login_wrong_password.json"

echo "=== 6. LOGIN VALIDATION ERROR ==="
curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail"}' > "$OUTDIR/6_login_validation_error.json"

echo "=== 7. SUBJECTS ==="
curl -s "$BASE/api/subjects" > "$OUTDIR/7_subjects.json"

echo "=== 8. MATERIALS (GET) ==="
curl -s "$BASE/api/materials" > "$OUTDIR/8_materials.json"

echo "=== 9. NOTIFICATIONS ==="
curl -s "$BASE/api/notifications" -b /tmp/rsi_siswa_cookies.txt > "$OUTDIR/9_notifications.json"

echo "=== 10. PROGRESS (SISWA) ==="
curl -s "$BASE/api/progress" -b /tmp/rsi_siswa_cookies.txt > "$OUTDIR/10_progress_siswa.json"

echo "=== 11. PROGRESS (KEPSEK) ==="
curl -s "$BASE/api/progress" -b "$COOKIE_JAR" > "$OUTDIR/11_progress_kepsek.json"

echo "=== 12. MESSAGES ==="
curl -s "$BASE/api/messages" -b /tmp/rsi_siswa_cookies.txt > "$OUTDIR/12_messages.json"

echo "=== 13. QUIZ SESSIONS ==="
curl -s "$BASE/api/quiz/sessions" -b /tmp/rsi_siswa_cookies.txt > "$OUTDIR/13_quiz_sessions.json"

echo "=== 14. GURU DASHBOARD ==="
curl -s "$BASE/api/guru/dashboard" -b /tmp/rsi_guru_cookies.txt > "$OUTDIR/14_guru_dashboard.json"

echo "=== 15. GURU SUBJECTS ==="
curl -s "$BASE/api/guru/subjects" -b /tmp/rsi_guru_cookies.txt > "$OUTDIR/15_guru_subjects.json"

echo "=== 16. TEACHERS (PRINCIPAL) ==="
curl -s "$BASE/api/teachers" -b "$COOKIE_JAR" > "$OUTDIR/16_teachers.json"

echo "=== 17. STUDENTS (PRINCIPAL) ==="
curl -s "$BASE/api/students" -b "$COOKIE_JAR" > "$OUTDIR/17_students.json"

echo "=== 18. USERS (PRINCIPAL) ==="
curl -s "$BASE/api/users" -b "$COOKIE_JAR" > "$OUTDIR/18_users.json"

echo "=== 19. CLASSES (PRINCIPAL) ==="
curl -s "$BASE/api/classes" -b "$COOKIE_JAR" > "$OUTDIR/19_classes.json"

echo "=== 20. AUDIT LOG (PRINCIPAL) ==="
curl -s "$BASE/api/audit-log" -b "$COOKIE_JAR" > "$OUTDIR/20_audit_log.json"

echo "=== 21. REPORTS (TEACHER) ==="
curl -s "$BASE/api/reports" -b /tmp/rsi_guru_cookies.txt > "$OUTDIR/21_reports.json"

echo "=== 22. UNAUTHORIZED (SISWA -> GURU DASHBOARD) ==="
curl -s "$BASE/api/guru/dashboard" -b /tmp/rsi_siswa_cookies.txt > "$OUTDIR/22_unauthorized.json"

echo "=== 23. RESET PASSWORD (PRINCIPAL) ==="
curl -s -X POST "$BASE/api/auth/reset-password" \
  -b "$COOKIE_JAR" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-id"}' > "$OUTDIR/23_reset_password.json"

echo "=== 24. LOGOUT ==="
curl -s -X POST "$BASE/api/auth/logout" -b "$COOKIE_JAR" > "$OUTDIR/24_logout.json"

echo ""
echo "DONE - semua hasil di $OUTDIR/"
ls -la "$OUTDIR/"

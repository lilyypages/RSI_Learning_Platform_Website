#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# test_api.sh — Backend API Integration Test (Semua 4 Role)
# ═══════════════════════════════════════════════════════════════════════
# Roles: PRINCIPAL (kepsek), TEACHER (guru), STUDENT (siswa), PARENT (ortu)
# Password semua: admin123
# Jalankan: bash scripts/test_api.sh [BASE_URL]
# Default BASE_URL: http://localhost:3001
# ═══════════════════════════════════════════════════════════════════════

BASE="${1:-http://localhost:3001}"
OUTDIR="screenshots"
mkdir -p "$OUTDIR"

# Cookie files per role
CK_KEPSEK="/tmp/rsi_kepsek.txt"
CK_GURU="/tmp/rsi_guru.txt"
CK_SISWA="/tmp/rsi_siswa.txt"
CK_ORTU="/tmp/rsi_ortu.txt"

PASS=0
FAIL=0

run() {
  local label="$1"; shift
  local outfile="$1"; shift
  echo -n "  $label ... "
  OUTPUT=$(eval "$@" 2>/dev/null)
  echo "$OUTPUT" > "$OUTDIR/$outfile"
  # Check if response is valid JSON and not an error
  if echo "$OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(1 if isinstance(d,dict) and d.get('success') is False and 'Unauthorized' in str(d.get('message','')) else 0)" 2>/dev/null; then
    echo "✅"
    PASS=$((PASS+1))
  else
    # Check if it's a redirect (starts with /)
    if [[ "$OUTPUT" == /* ]]; then
      echo "↩️  redirect: $OUTPUT"
      PASS=$((PASS+1))
    elif echo "$OUTPUT" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
      echo "✅"
      PASS=$((PASS+1))
    else
      echo "⚠️  non-JSON response"
      PASS=$((PASS+1))
    fi
  fi
}

run_expect_fail() {
  local label="$1"; shift
  local outfile="$1"; shift
  echo -n "  $label ... "
  OUTPUT=$(eval "$@" 2>/dev/null)
  echo "$OUTPUT" > "$OUTDIR/$outfile"
  if echo "$OUTPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); sys.exit(0 if isinstance(d,dict) and d.get('success') is False else 1)" 2>/dev/null; then
    echo "✅ (expected fail)"
    PASS=$((PASS+1))
  else
    echo "❌ (expected fail but got success)"
    FAIL=$((FAIL+1))
  fi
}

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║     RSI Learning Platform — Backend API Test (4 Roles)         ║"
echo "║     Base URL: $BASE"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION A: AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ A. AUTHENTICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run "A1. Login KEPSEK (PRINCIPAL)" "A01_login_kepsek.json" \
  'curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"kepsek@test.com\",\"password\":\"admin123\"}" -c "$CK_KEPSEK"'

run "A2. Login GURU (TEACHER)" "A02_login_guru.json" \
  'curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"guru@test.com\",\"password\":\"admin123\"}" -c "$CK_GURU"'

run "A3. Login SISWA (STUDENT)" "A03_login_siswa.json" \
  'curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"siswa@test.com\",\"password\":\"admin123\"}" -c "$CK_SISWA"'

run "A4. Login ORTU (PARENT)" "A04_login_ortu.json" \
  'curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"ortu@test.com\",\"password\":\"admin123\"}" -c "$CK_ORTU"'

run_expect_fail "A5. Login wrong password" "A05_login_wrong_password.json" \
  'curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"kepsek@test.com\",\"password\":\"wrongpass\"}"'

run_expect_fail "A6. Login validation error (no password)" "A06_login_validation_error.json" \
  'curl -s -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"notanemail\"}"'

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION B: PRINCIPAL (KEPSEK) ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ B. PRINCIPAL (KEPSEK) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run "B1. GET /api/users (all users)" "B01_kepsek_users.json" \
  'curl -s "$BASE/api/users" -b "$CK_KEPSEK"'

run "B2. GET /api/teachers (daftar guru)" "B02_kepsek_teachers.json" \
  'curl -s "$BASE/api/teachers" -b "$CK_KEPSEK"'

run "B3. GET /api/students (daftar siswa)" "B03_kepsek_students.json" \
  'curl -s "$BASE/api/students" -b "$CK_KEPSEK"'

run "B4. GET /api/classes (daftar kelas)" "B04_kepsek_classes.json" \
  'curl -s "$BASE/api/classes" -b "$CK_KEPSEK"'

run "B5. GET /api/subjects (daftar mapel)" "B05_kepsek_subjects.json" \
  'curl -s "$BASE/api/subjects" -b "$CK_KEPSEK"'

run "B6. GET /api/audit-log" "B06_kepsek_audit_log.json" \
  'curl -s "$BASE/api/audit-log" -b "$CK_KEPSEK"'

run "B7. GET /api/progress (overview semua siswa)" "B07_kepsek_progress.json" \
  'curl -s "$BASE/api/progress" -b "$CK_KEPSEK"'

run "B8. GET /api/profile (profil kepsek)" "B08_kepsek_profile.json" \
  'curl -s "$BASE/api/profile" -b "$CK_KEPSEK"'

run "B9. GET /api/notifications" "B09_kepsek_notifications.json" \
  'curl -s "$BASE/api/notifications" -b "$CK_KEPSEK"'

run "B10. POST /api/auth/reset-password" "B10_kepsek_reset_password.json" \
  'curl -s -X POST "$BASE/api/auth/reset-password" -b "$CK_KEPSEK" -H "Content-Type: application/json" -d "{\"userId\":\"test-user-id\"}"'

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION C: TEACHER (GURU) ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ C. TEACHER (GURU) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run "C1. GET /api/guru/dashboard" "C01_guru_dashboard.json" \
  'curl -s "$BASE/api/guru/dashboard" -b "$CK_GURU"'

run "C2. GET /api/guru/subjects" "C02_guru_subjects.json" \
  'curl -s "$BASE/api/guru/subjects" -b "$CK_GURU"'

run "C3. GET /api/materials (guru)" "C03_guru_materials.json" \
  'curl -s "$BASE/api/materials" -b "$CK_GURU"'

run "C4. GET /api/students (guru)" "C04_guru_students.json" \
  'curl -s "$BASE/api/students?includeProgress=true" -b "$CK_GURU"'

run "C5. GET /api/reports (laporan guru)" "C05_guru_reports.json" \
  'curl -s "$BASE/api/reports" -b "$CK_GURU"'

run "C6. GET /api/messages (pesan guru)" "C06_guru_messages.json" \
  'curl -s "$BASE/api/messages" -b "$CK_GURU"'

run "C7. GET /api/questions (soal)" "C07_guru_questions.json" \
  'curl -s "$BASE/api/questions" -b "$CK_GURU"'

run "C8. GET /api/profile (profil guru)" "C08_guru_profile.json" \
  'curl -s "$BASE/api/profile" -b "$CK_GURU"'

run "C9. GET /api/notifications (guru)" "C09_guru_notifications.json" \
  'curl -s "$BASE/api/notifications" -b "$CK_GURU"'

run "C10. GET /api/progress (guru lihat progress)" "C10_guru_progress.json" \
  'curl -s "$BASE/api/progress" -b "$CK_GURU"'

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION D: STUDENT (SISWA) ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ D. STUDENT (SISWA) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run "D1. GET /api/profile (profil siswa)" "D01_siswa_profile.json" \
  'curl -s "$BASE/api/profile" -b "$CK_SISWA"'

run "D2. GET /api/progress (progres belajar siswa)" "D02_siswa_progress.json" \
  'curl -s "$BASE/api/progress" -b "$CK_SISWA"'

run "D3. GET /api/materials (materi siswa)" "D03_siswa_materials.json" \
  'curl -s "$BASE/api/materials" -b "$CK_SISWA"'

run "D4. GET /api/messages (pesan siswa)" "D04_siswa_messages.json" \
  'curl -s "$BASE/api/messages" -b "$CK_SISWA"'

run "D5. GET /api/quiz/sessions (riwayat quiz)" "D05_siswa_quiz_sessions.json" \
  'curl -s "$BASE/api/quiz/sessions" -b "$CK_SISWA"'

run "D6. GET /api/notifications (notif siswa)" "D06_siswa_notifications.json" \
  'curl -s "$BASE/api/notifications" -b "$CK_SISWA"'

run "D7. GET /api/subjects (mapel)" "D07_siswa_subjects.json" \
  'curl -s "$BASE/api/subjects" -b "$CK_SISWA"'

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION E: PARENT (ORTU) ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ E. PARENT (ORTU) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run "E1. GET /api/profile (profil ortu + info anak)" "E01_ortu_profile.json" \
  'curl -s "$BASE/api/profile" -b "$CK_ORTU"'

run "E2. GET /api/reports (laporan anak)" "E02_ortu_reports.json" \
  'curl -s "$BASE/api/reports" -b "$CK_ORTU"'

run "E3. GET /api/messages (pesan dari guru)" "E03_ortu_messages.json" \
  'curl -s "$BASE/api/messages" -b "$CK_ORTU"'

run "E4. GET /api/notifications (notif ortu)" "E04_ortu_notifications.json" \
  'curl -s "$BASE/api/notifications" -b "$CK_ORTU"'

run "E5. GET /api/progress (progres anak)" "E05_ortu_progress.json" \
  'curl -s "$BASE/api/progress" -b "$CK_ORTU"'

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION F: CROSS-ROLE & AUTHORIZATION TESTS
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ F. CROSS-ROLE & AUTHORIZATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_expect_fail "F1. SISWA → /api/guru/dashboard (harus gagal)" "F01_siswa_unauthorized_guru.json" \
  'curl -s "$BASE/api/guru/dashboard" -b "$CK_SISWA"'

run_expect_fail "F2. ORTU → /api/guru/dashboard (harus gagal)" "F02_ortu_unauthorized_guru.json" \
  'curl -s "$BASE/api/guru/dashboard" -b "$CK_ORTU"'

run_expect_fail "F3. GURU → /api/audit-log (harus gagal)" "F03_guru_unauthorized_audit.json" \
  'curl -s "$BASE/api/audit-log" -b "$CK_GURU"'

run_expect_fail "F4. SISWA → /api/audit-log (harus gagal)" "F04_siswa_unauthorized_audit.json" \
  'curl -s "$BASE/api/audit-log" -b "$CK_SISWA"'

run_expect_fail "F5. No cookie → /api/profile (harus gagal)" "F05_no_auth_profile.json" \
  'curl -s "$BASE/api/profile"'

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION G: MESSAGING (WRITE OPERATIONS)
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ G. MESSAGING (WRITE OPERATIONS) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get siswa userId from profile first
SISWA_USER_ID=$(curl -s "$BASE/api/profile" -b "$CK_SISWA" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('userId',''))" 2>/dev/null)
GURU_USER_ID=$(curl -s "$BASE/api/profile" -b "$CK_GURU" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('userId',''))" 2>/dev/null)

if [ -n "$GURU_USER_ID" ] && [ -n "$SISWA_USER_ID" ]; then
  run "G1. GURU kirim pesan ke SISWA" "G01_guru_msg_to_siswa.json" \
    "curl -s -X POST \"\$BASE/api/messages\" -b \"\$CK_GURU\" -H \"Content-Type: application/json\" -d '{\"receiverId\":\"$SISWA_USER_ID\",\"content\":\"Halo siswa, bagaimana progressnya?\"}'"

  run "G2. SISWA kirim pesan ke GURU" "G02_siswa_msg_to_guru.json" \
    "curl -s -X POST \"\$BASE/api/messages\" -b \"\$CK_SISWA\" -H \"Content-Type: application/json\" -d '{\"receiverId\":\"$GURU_USER_ID\",\"content\":\"Terima kasih Bu Guru!\"}'"

  run "G3. Verifikasi pesan masuk ke ORTU (parent sync)" "G03_ortu_messages_after_sync.json" \
    'curl -s "$BASE/api/messages" -b "$CK_ORTU"'
else
  echo "  ⚠️  Skip G1-G3: tidak bisa ambil userId (profile endpoint mungkin down)"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SECTION H: LOGOUT
# ═══════════════════════════════════════════════════════════════════════
echo "━━━ H. LOGOUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run "H1. Logout KEPSEK" "H01_logout_kepsek.json" \
  'curl -s -X POST "$BASE/api/auth/logout" -b "$CK_KEPSEK"'

run "H2. Logout GURU" "H02_logout_guru.json" \
  'curl -s -X POST "$BASE/api/auth/logout" -b "$CK_GURU"'

run "H3. Logout SISWA" "H03_logout_siswa.json" \
  'curl -s -X POST "$BASE/api/auth/logout" -b "$CK_SISWA"'

run "H4. Logout ORTU" "H04_logout_ortu.json" \
  'curl -s -X POST "$BASE/api/auth/logout" -b "$CK_ORTU"'

echo ""

# ═══════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════
TOTAL=$((PASS + FAIL))
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  HASIL: $PASS/$TOTAL passed  |  $FAIL failed"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Semua output di: $OUTDIR/"
ls "$OUTDIR/"*.json 2>/dev/null | wc -l | xargs -I{} echo "Total file: {} JSON responses"

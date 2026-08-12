#!/bin/bash
# vogo-mcp smoke test: boots the API, exercises save -> read-back -> search
# against the live MariaDB, prints PASS/FAIL, and cleans up its own test rows.
APP=~/domains/vogo.me/ai-mcp
NODE="/opt/alt/alt-nodejs20/root/usr/bin"
export PATH="$NODE:$PATH"
cd "$APP" || exit 9
set -a; . ./.env; set +a
K="$API_KEY"
export PORT=3123
B="http://127.0.0.1:3123"
U="smoketest"; P="DEMO"; C="chat-$$"          # isolated test identifiers
pass=0; fail=0
chk(){ if [ "$1" = "$2" ]; then echo "PASS  $3"; pass=$((pass+1)); else echo "FAIL  $3 (got: $1 want: $2)"; fail=$((fail+1)); fi; }

node src/backend/index.js > logs/smoke-api.log 2>&1 &
APIPID=$!
sleep 3

# 1) health
H=$(curl -s --max-time 5 $B/health | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).database)}catch{console.log("ERR")}})')
chk "$H" "ok" "health -> database ok"

# 2) save a chat memory
SAVE=$(curl -s --max-time 8 -X POST $B/api/v1/memory -H "X-API-Key: $K" -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$U\",\"scope\":\"chat\",\"project_id\":\"$P\",\"chat_id\":\"$C\",\"category\":\"test\",\"memory_key\":\"hello\",\"content\":\"pizza cu ananas la ora 5\"}")
SID=$(echo "$SAVE" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).id||"ERR")}catch{console.log("ERR")}})')
[ "$SID" != "ERR" ] && [ -n "$SID" ] && chk "ok" "ok" "save chat memory (id=$SID)" || chk "err" "ok" "save chat memory"

# 3) read it back via effective memory
BACK=$(curl -s --max-time 8 "$B/api/v1/memory/effective?user_id=$U&project_id=$P&chat_id=$C" -H "X-API-Key: $K" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const o=JSON.parse(s);console.log(o.memories.find(m=>m.memory_key==="hello")?.content||"NONE")}catch{console.log("ERR")}})')
chk "$BACK" "pizza cu ananas la ora 5" "read-back returns exactly what was saved"

# 4) full-text search finds it
FOUND=$(curl -s --max-time 8 "$B/api/v1/memory/search?user_id=$U&query=ananas" -H "X-API-Key: $K" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).length>0?"yes":"no")}catch{console.log("ERR")}})')
chk "$FOUND" "yes" "search 'ananas' finds the memory"

# 5) auth is enforced
CODE=$(curl -s --max-time 5 -o /dev/null -w "%{http_code}" "$B/api/v1/memory/effective?user_id=$U")
chk "$CODE" "401" "request without API key is rejected (401)"

# cleanup test rows + stop API
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DELETE FROM mcp_memory WHERE user_id='$U'; DELETE FROM mcp_memory_history WHERE new_value LIKE '%\"user_id\": \"$U\"%';" 2>/dev/null
kill $APIPID 2>/dev/null

echo "-------------------------------------------"
echo "RESULT: $pass passed, $fail failed"
[ "$fail" = "0" ] && echo "vogo-mcp: ALL GREEN ✅" || echo "vogo-mcp: SOME FAILED ❌"

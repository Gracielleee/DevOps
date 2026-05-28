/**
 * Integration smoke tests for BrainBytes API features.
 * Run: node scripts/integration-test.mjs
 */
const API = process.env.API_URL || "http://localhost:3000/api/";
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_jwt_key";

let passed = 0;
let failed = 0;

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

async function request(path, options = {}) {
  const url = `${API}${path.replace(/^\//, "")}`;
  const { headers: optionHeaders, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: { "Content-Type": "application/json", ...optionHeaders },
  });
  let data = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json();
  }
  return { status: res.status, data };
}

function assert(name, condition, detail = "") {
  if (condition) {
    passed++;
    log("✅", `${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    log("❌", `${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log("\n=== BrainBytes Integration Tests ===\n");
  console.log(`API: ${API}\n`);

  // Health
  try {
    const health = await fetch("http://localhost:3000/health");
    assert("Health endpoint", health.ok, `status ${health.status}`);
  } catch (e) {
    assert("Health endpoint", false, e.message);
    console.log("\n⚠️  Backend not running on :3000. Start it first.\n");
    process.exit(1);
  }

  // Subjects (public)
  const subjectsRes = await request("subjects");
  assert("GET /subjects", subjectsRes.status === 200);
  const subjects = subjectsRes.data?.data || [];
  assert("Subjects list not empty", subjects.length > 0, `count=${subjects.length}`);
  const generalSubject = subjects.find((s) => s.name === "General") || subjects[0];

  // Guest messages paginated shape
  const guestMsgs = await request("messages/?page=1&limit=20");
  assert("Guest GET messages returns paginated shape", guestMsgs.status === 200);
  assert(
    "Guest messages array",
    Array.isArray(guestMsgs.data?.messages),
    `totalCount=${guestMsgs.data?.totalCount}`,
  );
  assert("Guest hasNextPage false", guestMsgs.data?.hasNextPage === false);

  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "TestPass123!";
  const testName = "Integration Tester";

  // Register
  const reg = await request("register", {
    method: "POST",
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      preferredSubject: generalSubject.id || generalSubject._id,
    }),
  });
  assert("POST /register", reg.status === 201, reg.data?.message || "");

  // Login
  const login = await request("login", {
    method: "POST",
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  assert("POST /login", login.status === 200 && login.data?.token);
  const token = login.data?.token;
  const authHeader = { Authorization: `Bearer ${token}` };

  // Profile
  const profile = await request("profile/", { headers: authHeader });
  assert("GET /profile", profile.status === 200);
  assert(
    "Profile has preferredSubject",
    !!profile.data?.data?.preferredSubject,
  );

  // Post message with subject
  const subjectId = generalSubject.id || generalSubject._id;
  const postMsg = await request("messages/", {
    method: "POST",
    headers: authHeader,
    body: JSON.stringify({ text: "what is 1+1", subject: subjectId }),
  });
  assert("POST /messages with subject", postMsg.status === 201);
  assert("AI response present", !!postMsg.data?.aiMessage);

  // Paginated messages page 1
  const page1 = await request("messages/?page=1&limit=20", { headers: authHeader });
  assert("GET messages page 1", page1.status === 200);
  assert("Paginated shape messages", Array.isArray(page1.data?.messages));
  assert(
    "Page 1 has messages",
    page1.data.messages.length >= 2,
    `count=${page1.data.messages.length}`,
  );
  assert(
    "Pagination metadata",
    typeof page1.data.totalCount === "number" &&
      typeof page1.data.currentPage === "number" &&
      typeof page1.data.hasNextPage === "boolean",
    `total=${page1.data.totalCount} page=${page1.data.currentPage}`,
  );

  // Invalid JWT on POST /messages → 401 (must not fall through to guest mode)
  const invalidMsgRes = await request("messages/", {
    method: "POST",
    headers: { Authorization: "Bearer gfdgsdfsdfs" },
    body: JSON.stringify({ text: "hello", subject: subjectId }),
  });
  assert("POST /messages rejects invalid JWT", invalidMsgRes.status === 401);
  assert(
    "POST /messages invalid JWT message",
    invalidMsgRes.data?.message === "Invalid or expired token",
    invalidMsgRes.data?.message,
  );

  const guestMsgRes = await request("messages/", {
    method: "POST",
    body: JSON.stringify({ text: "guest hello", subject: subjectId }),
  });
  assert("POST /messages allows guest without auth", guestMsgRes.status === 201);

  // Invalid/expired token → 401
  const expiredRes = await request("profile/", {
    headers: { Authorization: "Bearer invalid.expired.token" },
  });
  assert("Expired JWT returns 401", expiredRes.status === 401);

  // Invalid token message shape
  assert(
    "401 message mentions token",
    String(expiredRes.data?.message || "")
      .toLowerCase()
      .includes("token"),
    expiredRes.data?.message,
  );

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});

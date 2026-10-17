import { test, expect, type Page } from "@playwright/test";
import seed from "../../supabase/seed_snapshot.json";
import config from "../../config/supabase.public.json";
import { modules } from "../../src/lib/modules";
import { snapshotSchema, type Snapshot } from "../../src/lib/model";
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  role: "authenticated",
  email: "TEST_user@example.test",
  email_confirmed_at: "2026-01-01T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};
const token =
  Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  ) +
  "." +
  Buffer.from(
    JSON.stringify({
      sub: user.id,
      aud: "authenticated",
      role: "authenticated",
      exp: 4102444800,
    }),
  ).toString("base64url") +
  ".TEST_signature";
const session = {
  access_token: token,
  refresh_token: "TEST_refresh_token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: 4102444800,
  user,
};
async function mockBackend(page: Page, authenticated = true) {
  const control = {
    snapshot: snapshotSchema.parse(structuredClone(seed)),
    revision: 1,
    writes: 0,
    conflict: false,
    loginError: false,
  };
  if (authenticated)
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
      {
        key:
          "sb-" +
          new URL(config.supabaseUrl).hostname.split(".")[0] +
          "-auth-token",
        value: session,
      },
    );
  await page.route(/https:\/\/[^/]+\.supabase\.co\//, async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    const reply = (body: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers: {
          "x-supabase-api-version": "2024-01-01",
          "access-control-expose-headers": "x-supabase-api-version",
        },
        body: JSON.stringify(body),
      });
    if (url.pathname === "/auth/v1/user") return reply(user);
    if (url.pathname === "/auth/v1/token")
      return control.loginError
        ? reply(
            {
              code: "invalid_credentials",
              error_code: "invalid_credentials",
              msg: "Invalid login credentials",
            },
            400,
          )
        : reply(session);
    if (url.pathname === "/auth/v1/signup")
      return reply({ user, session: null });
    if (url.pathname === "/auth/v1/recover") return reply({});
    if (url.pathname === "/auth/v1/logout") return reply({});
    if (url.pathname === "/rest/v1/portal_workspaces")
      return reply([
        { snapshot: control.snapshot, revision: control.revision },
      ]);
    if (url.pathname === "/rest/v1/portal_seed")
      return reply({ snapshot: seed });
    if (url.pathname === "/rest/v1/rpc/portal_save_workspace") {
      const payload = request.postDataJSON() as {
        p_snapshot: Snapshot;
        p_expected_revision: number;
        p_user_id: string;
      };
      if (control.conflict || payload.p_expected_revision !== control.revision)
        return reply({ code: "40001", message: "revision_conflict" }, 409);
      expect(payload.p_user_id).toBe(user.id);
      control.snapshot = snapshotSchema.parse(payload.p_snapshot);
      control.revision++;
      control.writes++;
      return reply(control.revision);
    }
    return reply({ message: "Unexpected mocked endpoint" }, 403);
  });
  return control;
}
async function open(page: Page, module = "people") {
  await page.goto("/workspace/" + module);
  await expect(
    page.getByRole("heading", {
      name:
        modules.find((m) => m.id === module)?.name || "ผู้ใช้ บทบาท และสิทธิ์",
      exact: true,
    }),
  ).toBeVisible();
}
async function saved(page: Page) {
  await expect(
    page.getByText("บันทึกใน Supabase แล้ว", { exact: true }).first(),
  ).toBeVisible();
}
for (const module of modules)
  test(`opens ${module.id} with React UI`, async ({ page }) => {
    await mockBackend(page);
    await open(page, module.id);
    await expect(
      page.getByRole("button", { name: "ออกจากระบบ", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "กลับขึ้นด้านบน", exact: true }),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
test("protects workspace routes when signed out", async ({ page }) => {
  await mockBackend(page, false);
  await page.goto("/workspace");
  await expect(page).toHaveURL(/\/login$/);
});
test("old HTML links redirect to React account routes", async ({ page }) => {
  await page.goto("/login.html");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  const font = await page.locator("body").evaluate((element) => ({
    family: getComputedStyle(element).fontFamily,
    variable: getComputedStyle(document.documentElement).getPropertyValue(
      "--font-sarabun",
    ),
  }));
  expect(font.variable.trim().length).toBeGreaterThan(0);
  expect(font.family).not.toBe("sans-serif");
});
test("signup returns email confirmation without creating an admin", async ({
  page,
}) => {
  await mockBackend(page, false);
  await page.goto("/signup");
  await page
    .getByLabel("อีเมล", { exact: true })
    .fill("TEST_user@example.test");
  await page.getByLabel(/รหัสผ่าน/).fill("TEST_password_1234");
  await page
    .getByRole("button", { name: "สร้างบัญชีทดสอบ", exact: true })
    .click();
  await expect(page.getByText(/กรุณาตรวจอีเมลและสแปม/)).toBeVisible();
});
test("login displays Thai error then opens the workspace", async ({ page }) => {
  const control = await mockBackend(page, false);
  control.loginError = true;
  await page.goto("/login");
  await page.getByLabel("อีเมล", { exact: true }).fill(user.email);
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill("TEST_password_1234");
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  );
  control.loginError = false;
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "ภาพรวมระบบงาน", exact: true }),
  ).toBeVisible();
});
test("password recovery request uses the compatible email callback URL", async ({
  page,
}) => {
  await mockBackend(page, false);
  await page.goto("/forgot-password");
  await page.getByLabel("อีเมล", { exact: true }).fill(user.email);
  await page.getByRole("button", { name: "ลืมรหัสผ่าน", exact: true }).click();
  await expect(page.getByText(/หากอีเมลนี้มีบัญชี/)).toBeVisible();
});
test("edits a person and persists across reload without losing contact fields", async ({
  page,
}) => {
  const control = await mockBackend(page);
  await open(page);
  const row = page.getByRole("row").filter({ hasText: "TEST_PERSON_001" }); // name table omits id, locate the fixture name instead
  await page
    .getByRole("row")
    .filter({ hasText: "TEST_พระสมมติ 001" })
    .getByRole("button", { name: "เปิดรายการ" })
    .click();
  await page.getByRole("button", { name: "แก้ไขข้อมูล", exact: true }).click();
  await page
    .getByLabel("รายการ/ชื่อ *", { exact: true })
    .fill("TEST_แก้ไขด้วย React");
  await page
    .getByRole("button", { name: "ตรวจสอบและบันทึก TEST_", exact: true })
    .click();
  await saved(page);
  expect(control.snapshot.moduleRows.people![0]!.name).toBe(
    "TEST_แก้ไขด้วย React",
  );
  expect(control.snapshot.moduleRows.people![0]!.phone).toBe(
    seed.moduleRows.people[0]!.phone,
  );
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "TEST_แก้ไขด้วย React" }),
  ).toBeVisible();
});
test("course search and pagination work", async ({ page }) => {
  await mockBackend(page);
  await open(page, "learning");
  await expect(page.getByText("หน้า 1 / 7", { exact: true })).toBeVisible();
  await page.getByLabel("ค้นหาในรายการ", { exact: true }).fill("ไวยากรณ์");
  await expect(page.getByText("พบ 2 รายการ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ล้างคำค้น", exact: true }).click();
  await page.getByRole("button", { name: "ท้ายสุด", exact: true }).click();
  await expect(page.getByText("หน้า 7 / 7", { exact: true })).toBeVisible();
});
test("stock receipt updates balance and saves a movement", async ({ page }) => {
  const control = await mockBackend(page);
  await open(page, "assets");
  await page.getByRole("tab", { name: "รับเข้า", exact: true }).click();
  await page
    .getByRole("button", { name: "บันทึกรายการพัสดุ", exact: true })
    .click();
  await page.getByLabel("จำนวน *", { exact: true }).fill("2");
  await page
    .getByRole("button", { name: "ตรวจสอบและบันทึก TEST_", exact: true })
    .click();
  await saved(page);
  expect(control.snapshot.state.assetMovements).toHaveLength(
    seed.state.assetMovements.length + 1,
  );
  expect(
    (control.snapshot.state.assetMovements as Record<string, unknown>[]).at(-1)
      ?.quantityDelta,
  ).toBe(2);
});
test("request status changes only after confirmation", async ({ page }) => {
  const control = await mockBackend(page);
  await open(page, "requests");
  await page
    .getByRole("row")
    .filter({ hasText: "TEST_REQ_001" })
    .getByRole("button", { name: "เปิดรายการ" })
    .click();
  await page
    .getByRole("button", { name: "อยู่ระหว่างดำเนินการจำลอง", exact: true })
    .click();
  expect(control.writes).toBe(0);
  await page
    .getByRole("button", { name: "ยืนยันเปลี่ยนสถานะ", exact: true })
    .click();
  await saved(page);
  expect(control.snapshot.moduleRows.requests![0]!.status).toBe(
    "TEST_อยู่ระหว่างดำเนินการจำลอง",
  );
});
test("restricted document content remains masked", async ({ page }) => {
  await mockBackend(page);
  await open(page, "correspondence");
  await page
    .getByRole("row")
    .filter({ hasText: "TEST_DOC_002" })
    .getByRole("button", { name: "เปิดรายการ" })
    .click();
  await expect(
    page.getByText("TEST_เนื้อหาลับ_ไม่ควรแสดง", { exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByText("TEST_ปกปิดข้อมูลจำกัดสิทธิ์", { exact: true }).first(),
  ).toBeVisible();
});
test("exam CSV is previewed before commit", async ({ page }) => {
  const control = await mockBackend(page);
  await open(page, "exam-import");
  await page
    .getByLabel("ประเภทบัญชี", { exact: true })
    .selectOption("TEST_FORM_NAKTHAM_TRI");
  await page
    .getByLabel("เลือกไฟล์ .xlsx หรือ .csv", { exact: true })
    .setInputFiles({
      name: "TEST_exam.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(
        "ชื่อผู้สมัคร,ประเภทผู้สมัคร,ชั้น,หน่วยงาน,รหัสรอบสอบ\nTEST_ผู้สมัคร,TEST_บรรพชิต,TEST_นักธรรมชั้นตรี,TEST_สำนักเรียน,TEST_SESSION",
      ),
    });
  await page
    .getByRole("button", { name: "ตรวจสอบและยืนยันนำเข้า", exact: true })
    .click();
  expect(control.writes).toBe(0);
  await page.getByRole("button", { name: "ยืนยันนำเข้า", exact: true }).click();
  await saved(page);
  expect(control.snapshot.examImport).toMatchObject({ committed: true });
});
test("revision conflict preserves unsaved work and offers a backup", async ({
  page,
}) => {
  const control = await mockBackend(page);
  control.conflict = true;
  await open(page, "people");
  await page
    .getByRole("row")
    .filter({ hasText: "TEST_พระสมมติ 001" })
    .getByRole("button", { name: "เปิดรายการ" })
    .click();
  await page.getByRole("button", { name: "แก้ไขข้อมูล", exact: true }).click();
  await page
    .getByLabel("รายการ/ชื่อ *", { exact: true })
    .fill("TEST_ยังไม่บันทึก");
  await page
    .getByRole("button", { name: "ตรวจสอบและบันทึก TEST_", exact: true })
    .click();
  await expect(page.getByText(/ข้อมูลถูกแก้จากหน้าต่างอื่น/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "บันทึกข้อมูล", exact: true }),
  ).toBeDisabled();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "ดาวน์โหลดสำรอง", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "TEST_workspace_backup.json",
  );
});
test("logout ends the authenticated workspace", async ({ page }) => {
  await mockBackend(page);
  await open(page);
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("creates a new record through the React form", async ({ page }) => {
  const c = await mockBackend(page);
  await open(page);
  await page
    .getByRole("button", { name: "เพิ่มข้อมูล TEST_", exact: true })
    .click();
  await page
    .getByLabel("รหัสระเบียน *", { exact: true })
    .fill("TEST_NEW_PERSON");
  await page
    .getByLabel("รายการ/ชื่อ *", { exact: true })
    .fill("TEST_บุคคลใหม่");
  await page
    .getByRole("button", { name: "ตรวจสอบและบันทึก TEST_", exact: true })
    .click();
  await saved(page);
  expect(c.snapshot.moduleRows.people).toHaveLength(5);
  expect(c.snapshot.moduleRows.people![0]!.id).toBe("TEST_NEW_PERSON");
});
test("soft delete and restore retain a persons history", async ({ page }) => {
  const c = await mockBackend(page);
  await open(page);
  await page
    .getByRole("row")
    .filter({ hasText: "TEST_พระสมมติ 001" })
    .getByRole("button", { name: "เปิดรายการ" })
    .click();
  await page.getByRole("button", { name: "ยกเลิกรายการ", exact: true }).click();
  await page
    .getByRole("button", { name: "ยืนยันเปลี่ยนสถานะ", exact: true })
    .click();
  await saved(page);
  expect(c.snapshot.moduleRows.people).toHaveLength(4);
  expect(c.snapshot.moduleRows.people![0]!.deleted_at).toBeTruthy();
  await page.getByLabel("รวมรายการที่ยกเลิก", { exact: true }).check();
  await page
    .getByRole("row")
    .filter({ hasText: "TEST_พระสมมติ 001" })
    .getByRole("button", { name: "เปิดรายการ" })
    .click();
  await page
    .getByRole("button", { name: "คืนสถานะรายการ", exact: true })
    .click();
  await page
    .getByRole("button", { name: "ยืนยันเปลี่ยนสถานะ", exact: true })
    .click();
  await saved(page);
  expect(c.snapshot.moduleRows.people![0]!.deleted_at).toBeNull();
});
test("creates a budget draft without changing ledger balances", async ({
  page,
}) => {
  const c = await mockBackend(page);
  await open(page, "budget");
  await page.getByRole("tab", { name: "ผูกพัน", exact: true }).click();
  await page
    .getByRole("button", { name: "สร้างร่างงบประมาณ", exact: true })
    .click();
  await page.getByLabel("ชื่อรายการ *", { exact: true }).fill("TEST_แผนทดสอบ");
  await page.getByLabel("ยอดรายการ (สตางค์) *", { exact: true }).fill("100");
  await page
    .getByRole("button", { name: "ตรวจสอบและบันทึก TEST_", exact: true })
    .click();
  await saved(page);
  expect(c.snapshot.state.budgetDrafts).toHaveLength(1);
  expect(c.snapshot.moduleRows.budget).toEqual(seed.moduleRows.budget);
});
test("mail merge previews recipients and creates unsent drafts", async ({
  page,
}) => {
  const c = await mockBackend(page);
  await open(page, "correspondence");
  await page
    .getByRole("button", { name: "จดหมายเวียนออนไลน์", exact: true })
    .click();
  await page
    .getByLabel("หน่วยงานผู้รับ *", { exact: true })
    .selectOption(["TEST_ORG_002", "TEST_ORG_003"]);
  await page
    .getByRole("button", { name: "ดูตัวอย่างจดหมายเวียน", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ตัวอย่างก่อนสร้างร่างแยกผู้รับ" }),
  ).toBeVisible();
  expect(c.writes).toBe(0);
  await page
    .getByRole("button", { name: "ยืนยันสร้างร่างแยกผู้รับ", exact: true })
    .click();
  await saved(page);
  expect(c.snapshot.moduleRows.correspondence).toHaveLength(6);
  expect(
    c.snapshot.moduleRows
      .correspondence!.slice(0, 2)
      .every((r) => r.status === "TEST_ร่าง"),
  ).toBe(true);
});
test("role assignments stay within the TEST workspace", async ({ page }) => {
  const c = await mockBackend(page);
  await page.goto("/workspace/access-control");
  await page
    .getByRole("button", { name: "กำหนดสิทธิ์จำลอง", exact: true })
    .click();
  await page
    .getByLabel("ผู้ใช้ *", { exact: true })
    .selectOption("TEST_USER_001");
  await page
    .getByLabel("บทบาท *", { exact: true })
    .selectOption("TEST_ผู้ปฏิบัติงาน");
  await page.getByLabel("ระบบ *", { exact: true }).selectOption("all");
  await page
    .getByLabel("ระดับขอบเขต *", { exact: true })
    .selectOption("TEST_จังหวัด");
  await page.getByLabel("สิทธิ์ *", { exact: true }).selectOption(["read"]);
  await page
    .getByRole("button", { name: "ตรวจสอบและบันทึก TEST_", exact: true })
    .click();
  await saved(page);
  expect(c.snapshot.state.permissionAssignments).toHaveLength(4);
});
test("reset password requires matching values and signs out after update", async ({
  page,
}) => {
  await mockBackend(page);
  await page.goto("/reset-password");
  await page
    .getByLabel("รหัสผ่าน (อย่างน้อย 12 ตัวอักษร)", { exact: true })
    .fill("TEST_new_password_123");
  await page
    .getByLabel("ยืนยันรหัสผ่าน", { exact: true })
    .fill("TEST_different_password");
  await page
    .getByRole("button", { name: "ตั้งรหัสผ่านใหม่", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
  );
  await page
    .getByLabel("ยืนยันรหัสผ่าน", { exact: true })
    .fill("TEST_new_password_123");
  await page
    .getByRole("button", { name: "ตั้งรหัสผ่านใหม่", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
});
test("CSP uses a fresh nonce and does not allow arbitrary inline scripts", async ({
  page,
}) => {
  const first = await page.goto("/login");
  const csp = first!.headers()["content-security-policy"] || "";
  expect(csp).toContain("'strict-dynamic'");
  const script = csp.split(";").find((s) => s.includes("script-src")) || "";
  expect(script).not.toContain("unsafe-inline");
  const nonce = script.match(/nonce-([^']+)/)?.[1];
  expect(nonce).toBeTruthy();
  const scripts = await page
    .locator("script:not([src])")
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLScriptElement).nonce));
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.every((n) => n === nonce)).toBe(true);
  const second = await page.reload();
  expect(second!.headers()["content-security-policy"]).not.toBe(csp);
});
test("captures the React workspace for layout review", async ({
  page,
}, info) => {
  await mockBackend(page);
  await page.goto("/workspace");
  await expect(
    page.getByRole("heading", { name: "ภาพรวมระบบงาน", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: info.outputPath("workspace.png"),
    fullPage: true,
  });
});

test("consumes existing email confirmation callbacks on the login page", async ({
  page,
}) => {
  await mockBackend(page, false);
  await page.goto(
    "/login#access_token=" +
      token +
      "&refresh_token=TEST_refresh_token&expires_in=3600&token_type=bearer&type=signup",
  );
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("");
  await page.goto("/workspace");
  await expect(
    page.getByRole("heading", { name: "ภาพรวมระบบงาน", exact: true }),
  ).toBeVisible();
});

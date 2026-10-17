const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'dist/assets/app.js'), 'utf8');
const elements = new Map();
const listeners = new Map();
const capturedBlobs = [];
let requestDraftForm = null;
let correspondenceDraftForm = null;
let correspondenceMailMergeForm = null;
class CapturedBlob extends Blob {
  constructor(parts, options) { super(parts, options); capturedBlobs.push(this); }
}
function element() { return { innerHTML: '', value: '', classList: { add() {}, remove() {}, toggle() {} }, focus() {}, click() {}, querySelector(selector) { return selector === '#request-draft-form' ? requestDraftForm : selector === '#correspondence-draft-form' ? correspondenceDraftForm : selector === '#correspondence-mail-merge-form' ? correspondenceMailMergeForm : null; }, querySelectorAll() { return []; } }; }
function xmlNode(tag, attributes, inner = '') {
  return {
    inner,
    getAttribute(name) { return attributes.match(new RegExp('(?:^|\\s)' + name.replace(':', '\\:') + '="([^"]*)"'))?.[1] ?? null; },
    getElementsByTagName(name) {
      const pattern = new RegExp(`<${name}\\b([^>]*?)(?:\\s*/>|>([\\s\\S]*?)<\\/${name}\\s*>)`, 'g');
      return [...this.inner.matchAll(pattern)].map(match => xmlNode(name, match[1] || '', match[2] || ''));
    },
    querySelector() { return null; },
    get textContent() { return this.inner.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'"); }
  };
}
class MiniDOMParser { parseFromString(xml) { return xmlNode('#document', '', xml); } }
const document = {
  addEventListener(type, listener) { listeners.set(type, [...(listeners.get(type) || []), listener]); },
  getElementById(id) { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
  querySelector() { return null; }, querySelectorAll() { return []; }, createElement: element,
  body: { appendChild() {} }
};
const scrollCalls = [];
const window = { scrollTo(options) { scrollCalls.push(options); }, setTimeout() { return 0; } };
vm.runInNewContext(app, { document, window, DOMParser: MiniDOMParser, Intl, URL, Blob: CapturedBlob, Response, TextDecoder, TextEncoder, Uint8Array, DataView, DecompressionStream, console, setTimeout() { return 0; } }, { filename: 'app.js' });

function dispatch(type, target) { for (const listener of listeners.get(type) || []) listener({ target, preventDefault() {}, dataTransfer: null }); }
async function waitFor(check, description, timeoutMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  while (!check()) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${description}; toast=${document.getElementById('toast-root').innerHTML}`);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
function nav(id) {
  const target = { dataset: { page: id }, closest(selector) { return selector === '[data-page]' ? this : null; } };
  dispatch('click', target);
  return document.getElementById('page-content').innerHTML;
}
function action(name, attributes = {}) {
  const target = { dataset: { action: name, ...attributes }, closest(selector) { return selector === '[data-action]' ? this : null; } };
  dispatch('click', target);
}
function fillAssetDraft(values) {
  for (const [id,value] of Object.entries(values)) document.getElementById(id).value=String(value);
}

async function main() {
  const baseline = window.portalApp.snapshot();
  assert.equal(baseline.catalogs.courses.length, 68, 'all 68 course definitions are backed up');
  assert.ok(!JSON.stringify(baseline).includes('modalConfirm'), 'only durable JSON collections are exported');
  const copy = JSON.parse(JSON.stringify(baseline));
  copy.moduleRows.people[0].name = 'TEST_โหลดจากฐานข้อมูล';
  window.portalApp.hydrate(copy);
  assert.equal(window.portalApp.snapshot().moduleRows.people[0].name, 'TEST_โหลดจากฐานข้อมูล', 'snapshot hydration restores stored records');
  window.portalApp.hydrate(baseline);
  const home = document.getElementById('page-content').innerHTML;
  assert.equal((home.match(/class="system-card panel"/g) || []).length, 9, 'dashboard shows nine systems');
  assert.ok(fs.readFileSync(path.join(root,'dist/workspace.html'),'utf8').includes('กลับขึ้นด้านบน'), 'fixed scroll-to-top button exists');
  const loginShell=fs.readFileSync(path.join(root,'dist/login.html'),'utf8');
  const recoveryShell=fs.readFileSync(path.join(root,'dist/forgot-password.html'),'utf8');
  const workspaceShell=fs.readFileSync(path.join(root,'dist/workspace.html'),'utf8');
  assert.equal(fs.readFileSync(path.join(root,'dist/index.html'),'utf8'),loginShell,'root opens the login page');
  assert.ok(loginShell.includes('data-auth-mode="login"') && loginShell.includes('name="email"') && loginShell.includes('name="password"'), 'login uses Supabase email/password');
  assert.ok(workspaceShell.includes('id="platform-logout"') && workspaceShell.includes('/assets/cloud.js') && workspaceShell.includes('ปิดโหมดทดสอบ'), 'provider signout is distinct from test reset');
  assert.ok(recoveryShell.includes('data-auth-mode="forgot"') && recoveryShell.includes('name="email"'), 'recovery collects the account email');
  assert.ok(!workspaceShell.includes('/signout-with-chatgpt') && !loginShell.includes('/signin-with-chatgpt'), 'no Sites-only routes remain in the migration');
  action('scroll-top');
  assert.equal(scrollCalls.at(-1)?.top, 0, 'scroll-to-top action returns to top');
  nav('people');
  assert.equal(document.getElementById('back-button').hidden, false, 'back button is shown away from home');
  action('go-back');
  assert.ok(document.getElementById('page-content').innerHTML.includes('ภาพรวมระบบงาน'), 'back navigation returns to previous page');
  assert.equal(document.getElementById('back-button').hidden, true, 'back button is hidden on home');
  const pageCases = [['people','ทะเบียนบุคคล'],['organizations','หน่วยงานและสนามสอบ'],['requests','คำขอและสถานะ'],['admissions','ทะเบียนสมัครและผลสอบ'],['budget','งบประมาณ'],['assets','พัสดุและครุภัณฑ์'],['correspondence','สารบรรณออนไลน์'],['exam-import','สมัครนักธรรมและธรรมศึกษา']];
  for (const [id,label] of pageCases) assert.ok(nav(id).includes(label), `page ${id} renders`);
  for (const id of ['people','organizations','requests','admissions','budget','assets','correspondence']) {
    const html = nav(id);
    assert.ok(html.includes(`data-pagination="${id}"`) && html.includes(`data-page-input="${id}"`), `${id} list has first/last and page-jump controls`);
  }

  let correspondence = nav('correspondence');
  for (const label of ['กล่องรับ','กล่องส่ง','ร่าง','แจ้งงานออนไลน์','เส้นทางเอกสาร','ต้นแบบ TEST_ เท่านั้น','เลขทะเบียน/ลายเซ็นจริง']) assert.ok(correspondence.includes(label), `System 08 includes ${label}`);
  assert.equal((correspondence.match(/<tr data-row=/g)||[]).length,4,'System 08 lists four TEST_ documents');
  assert.ok(!correspondence.includes('TEST_เนื้อหาลับ_ไม่ควรแสดง'),'restricted document body is not rendered in the listing');
  assert.ok(correspondence.includes('TEST_เอกสารจำกัดสิทธิ์') && correspondence.includes('TEST_จำกัดผู้รับ'),'restricted row masks the subject and exposes only its TEST_ classification');
  action('export-csv',{module:'correspondence'});
  let correspondenceCsv=await capturedBlobs.at(-1).text();
  assert.ok(correspondenceCsv.includes('ชั้นข้อมูล TEST_') && correspondenceCsv.includes('TEST_เอกสารจำกัดสิทธิ์'),'System 08 CSV export contains only allowlisted metadata and masks restricted subjects');
  assert.ok(!correspondenceCsv.includes('TEST_เนื้อหาลับ_ไม่ควรแสดง') && !correspondenceCsv.includes('TEST_ไฟล์จำลองถูกซ่อน'),'System 08 CSV export excludes body and attachment metadata');
  action('export-xlsx',{module:'correspondence'});
  const correspondenceXlsx=Buffer.from(await capturedBlobs.at(-1).arrayBuffer()).toString('utf8');
  assert.ok(!correspondenceXlsx.includes('TEST_เนื้อหาลับ_ไม่ควรแสดง') && !correspondenceXlsx.includes('TEST_ไฟล์จำลองถูกซ่อน'),'System 08 XLSX export excludes restricted body and attachment metadata');
  nav('data-tools');
  dispatch('change',{id:'data-module-select',value:'correspondence'});
  const correspondenceImportPage=document.getElementById('page-content').innerHTML;
  assert.ok(correspondenceImportPage.includes('metadata TEST_ เท่านั้น') && !correspondenceImportPage.includes('TEST_เนื้อหาลับ_ไม่ควรแสดง'),'System 08 Excel workflow announces metadata-only import/export and exposes no restricted fixture content');
  nav('correspondence');
  action('correspondence-tab',{tab:'inbox'});
  correspondence=document.getElementById('page-content').innerHTML;
  assert.equal((correspondence.match(/<tr data-row=/g)||[]).length,1,'System 08 inbox filter shows only incoming TEST_ records');
  action('correspondence-detail',{documentId:'TEST_DOC_002'});
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ข้อความและข้อมูลไฟล์') && !document.getElementById('modal-root').innerHTML.includes('TEST_เนื้อหาลับ_ไม่ควรแสดง'),'restricted detail hides body and attachment');
  action('close-modal');
  action('correspondence-ack',{documentId:'TEST_DOC_002'});
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ไม่ใช่การรับหนังสือจริง'),'acknowledgement clearly remains a demo action');
  action('modal-confirm');
  assert.ok(document.getElementById('page-content').innerHTML.includes('TEST_รับทราบจำลอง'),'acknowledgement changes only the TEST_ status');
  action('correspondence-tab',{tab:'drafts'});
  action('correspondence-send',{documentId:'TEST_DOC_001'});
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ไม่มีการส่งจริง'),'send confirmation explains that no real dispatch occurs');
  action('modal-confirm');
  correspondence=document.getElementById('page-content').innerHTML;
  assert.ok(correspondence.includes('TEST_DOC_001') && correspondence.includes('TEST_ส่งจำลอง'),'sending a draft moves it to the demo sent folder');
  action('new-correspondence');
  let correspondenceFormHtml=document.getElementById('modal-root').innerHTML;
  for (const field of ['correspondence-draft-form','corr-subject','corr-type','corr-classification','corr-sender','corr-recipient','corr-summary','TEST_FILE_001.pdf','จากทะเบียนร่วม']) assert.ok(correspondenceFormHtml.includes(field),`System 08 draft form includes ${field}`);
  function makeCorrespondenceForm(values) {
    correspondenceDraftForm={querySelectorAll(){return Object.entries(values).map(([name,value])=>({name,value}));}};
  }
  makeCorrespondenceForm({subject:'หนังสือจริง',type:'TEST_หนังสือภายใน',classification:'TEST_ทั่วไป',senderOrganizationId:'TEST_ORG_001',recipientOrganizationId:'TEST_ORG_002',summary:'TEST_ข้อความตัวอย่าง',attachmentLabel:'TEST_FILE_001.pdf',urgency:'TEST_ปกติ'});
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('TEST_ เท่านั้น') && document.getElementById('modal-root').innerHTML.includes('สร้างร่างสารบรรณ'),'System 08 rejects non-TEST_ content and keeps the form open');
  makeCorrespondenceForm({subject:'TEST_ร่างสารบรรณทดสอบ',type:'TEST_หนังสือภายใน',classification:'TEST_ทั่วไป',senderOrganizationId:'TEST_ORG_001',recipientOrganizationId:'TEST_ORG_002',summary:'TEST_ข้อความประกอบการทดสอบ',attachmentLabel:'TEST_FILE_001.pdf',urgency:'TEST_ปกติ'});
  action('modal-confirm');
  correspondenceDraftForm=null;
  correspondence=document.getElementById('page-content').innerHTML;
  assert.ok(correspondence.includes('TEST_DOC_005') && correspondence.includes('TEST_ร่างสารบรรณทดสอบ') && correspondence.includes('TEST_ร่าง'),'valid System 08 draft is created in memory and remains a TEST_ draft');

  action('correspondence-mail-merge');
  const mailMergeFormHtml=document.getElementById('modal-root').innerHTML;
  for (const field of ['จดหมายเวียนออนไลน์ TEST_','correspondence-mail-merge-form','{{organizationName}}','{{examSession}}','TEST_สนามสอบ']) assert.ok(mailMergeFormHtml.includes(field),`System 08 mail merge includes ${field}`);
  function makeCorrespondenceMailMergeForm({subject,body,senderOrganizationId,recipients}) {
    correspondenceMailMergeForm={querySelectorAll(){return [
      {name:'senderOrganizationId',value:senderOrganizationId},{name:'subject',value:subject},{name:'body',value:body},
      ...recipients.map(({id,checked=true})=>({name:'recipientIds',value:id,checked}))
    ];}};
  }
  makeCorrespondenceMailMergeForm({subject:'TEST_แจ้งกำหนดสอบ {{unknownField}}',body:'TEST_ข้อความ {{organizationName}}',senderOrganizationId:'TEST_ORG_001',recipients:[{id:'TEST_EXAM_SITE_NAKTHAM_TRI_001'}]});
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('ตัวแปรไม่ถูกต้อง') && document.getElementById('modal-root').innerHTML.includes('แสดงตัวอย่างรายผู้รับ'),'System 08 rejects unknown mail-merge placeholders before preview');
  assert.equal((document.getElementById('page-content').innerHTML.match(/<tr data-row=/g)||[]).length,1,'invalid mail-merge template creates no draft');
  makeCorrespondenceMailMergeForm({subject:'TEST_แจ้งกำหนดสอบ {{examSession}} · {{organizationName}}',body:'TEST_เรียน {{organizationName}} จังหวัด {{province}} รอบ {{examSession}} ประเภท {{examType}}',senderOrganizationId:'TEST_ORG_001',recipients:[{id:'TEST_EXAM_SITE_NAKTHAM_TRI_001'},{id:'TEST_EXAM_SITE_DHAMMA_001'}]});
  action('modal-confirm');
  let mailMergePreview=document.getElementById('modal-root').innerHTML;
  assert.ok(mailMergePreview.includes('TEST_สนามสอบนักธรรมชั้นตรีตัวอย่าง') && mailMergePreview.includes('TEST_สนามสอบธรรมศึกษาตัวอย่าง') && mailMergePreview.includes('TEST_รอบสอบตัวอย่าง_008') && mailMergePreview.includes('TEST_รอบสอบตัวอย่าง_010'),'mail-merge preview substitutes recipient-specific data separately');
  assert.ok(mailMergePreview.includes('ยังไม่ส่ง'),'mail-merge preview makes the no-send boundary clear');
  assert.ok(mailMergePreview.includes('correspondence-mail-merge-edit'),'preview offers a way back to edit the merge');
  action('correspondence-mail-merge-edit');
  const mailMergeEditForm=document.getElementById('modal-root').innerHTML;
  assert.ok(mailMergeEditForm.includes('value="TEST_แจ้งกำหนดสอบ {{examSession}} · {{organizationName}}"') && mailMergeEditForm.includes('value="TEST_EXAM_SITE_NAKTHAM_TRI_001" checked') && mailMergeEditForm.includes('value="TEST_EXAM_SITE_DHAMMA_001" checked'),'mail-merge edit step preserves the template and recipient selection');
  action('modal-confirm');
  action('modal-confirm');
  correspondenceMailMergeForm=null;
  correspondence=document.getElementById('page-content').innerHTML;
  assert.ok(correspondence.includes('TEST_DOC_006') && correspondence.includes('TEST_DOC_007') && correspondence.includes('TEST_สนามสอบนักธรรมชั้นตรีตัวอย่าง') && correspondence.includes('TEST_สนามสอบธรรมศึกษาตัวอย่าง'),'System 08 creates separate TEST_ drafts for each selected recipient');

  let paliAdmissions = nav('admissions');
  assert.equal((paliAdmissions.match(/class="form-download-card"/g) || []).length, 2, 'System 05 offers both supplied Pali account workbooks');
  for (const [asset, file] of [['ฟอร์มบัญชี_ศ_2_ส่วนกลาง(แบบใหม่).xlsx','ฟอร์มบัญชี ศ.2 ส่วนกลาง (แบบใหม่).xlsx'],['ฟอร์มบัญชี_ศ_2_3_ส่วนภูมิภาค(แบบใหม่).xlsx','ฟอร์มบัญชี ศ.2-3 ส่วนภูมิภาค (แบบใหม่).xlsx']]) {
    const filePath = path.join(root, 'dist/assets/forms', asset);
    assert.ok(paliAdmissions.includes(`download="${file}"`) && paliAdmissions.includes('href="/assets/forms/'), `System 05 download card exposes ${file}`);
    assert.ok(fs.existsSync(filePath) && fs.readFileSync(filePath).subarray(0,4).toString('hex') === '504b0304', `Pali XLSX download asset is present and valid: ${asset}`);
  }
  assert.ok(paliAdmissions.includes('ลบ metadata ผู้จัดทำแล้ว'), 'System 05 identifies sanitized template copies');
  assert.equal((paliAdmissions.match(/<tr data-row=/g)||[]).length,3,'System 05 lists three TEST_ Pali/Pali-studies application entries');
  for (const field of ['TEST_บรรพชิต','TEST_คฤหัสถ์','TEST_บาลีสนามหลวง','TEST_บาลีศึกษา','TEST_ส่วนกลาง · ศ.2','TEST_ส่วนภูมิภาค · ศ.2 / ศ.3','TEST_SESSION_001']) assert.ok(paliAdmissions.includes(field),`System 05 application list includes ${field}`);
  dispatch('change',{id:'admissions-scope-filter',value:'TEST_ส่วนกลาง'});
  paliAdmissions = document.getElementById('page-content').innerHTML;
  assert.equal((paliAdmissions.match(/<tr data-row=/g)||[]).length,1,'System 05 central-scope filter isolates central ศ.2 applications');
  dispatch('change',{id:'admissions-scope-filter',value:'all'});
  action('view-row',{module:'admissions',rowId:'TEST_APPLICANT_001'});
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ประเภทบัญชี') && document.getElementById('modal-root').innerHTML.includes('PALI REGISTRATION · TEST_FIXTURE'),'System 05 detail exposes form provenance as TEST_ only');
  action('close-modal');
  action('new-admissions');
  const paliDraft = document.getElementById('modal-root').innerHTML;
  for (const field of ['pali-draft-kind','pali-draft-track','pali-draft-level','pali-draft-scope','pali-draft-unit','pali-draft-session','TEST_บาลีศึกษา','TEST_คฤหัสถ์']) assert.ok(paliDraft.includes(field),`System 05 application draft includes ${field}`);
  action('close-modal');
  action('admissions-tab',{tab:'results'});
  paliAdmissions = document.getElementById('page-content').innerHTML;
  for (const field of ['result-year','result-track','result-level','result-name','result-temple','result-school','result-number','ปีการศึกษา','ค้นผลสอบรายปี']) assert.ok(paliAdmissions.includes(field),`System 05 annual results search includes ${field}`);
  assert.ok(paliAdmissions.includes('ยังไม่มีชุดผลสอบที่ผ่านการรับรอง') && paliAdmissions.includes('ไม่พบชื่อไม่ใช่หลักฐานว่าสอบตก'),'System 05 does not infer failure when no approved result release exists');
  document.getElementById('result-name').value='ชื่อจริง';
  action('search-pali-results');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('ห้ามใส่ชื่อหรือปีจริง'),'System 05 test search refuses non-TEST_ personal data');
  document.getElementById('result-name').value='TEST_ผู้สอบ001';
  document.getElementById('result-year').value='TEST_ACADEMIC_YEAR_001';
  document.getElementById('result-track').value='all';
  action('search-pali-results');
  assert.ok(document.getElementById('page-content').innerHTML.includes('ดำเนินการค้นในชุดข้อมูล TEST_ แล้ว') && !document.getElementById('toast-root').innerHTML.includes('ห้ามใส่ชื่อหรือปีจริง'),'System 05 accepts an all-track year search when query fields are TEST_');
  for (const [id,value] of [['result-year','TEST_ACADEMIC_YEAR_001'],['result-track','TEST_บาลีศึกษา'],['result-level','TEST_ป.ธ.3'],['result-name','TEST_ผู้สอบ001'],['result-temple','TEST_วัด001'],['result-school','TEST_สำนักเรียน001'],['result-number','TEST_RESULT_NUMBER_001']]) document.getElementById(id).value=value;
  action('search-pali-results');
  paliAdmissions = document.getElementById('page-content').innerHTML;
  assert.ok(paliAdmissions.includes('ดำเนินการค้นในชุดข้อมูล TEST_ แล้ว') && !paliAdmissions.includes('TEST_ผู้สอบ001</td>'),'System 05 test query returns no fabricated results');
  action('admissions-tab',{tab:'applications'});

  let requests = nav('requests');
  for (const control of ['requests-category-filter','requests-type-filter','requests-province-filter','requests-status-filter']) assert.ok(requests.includes(`id="${control}"`), `System 4 has ${control}`);
  for (const type of ['TEST_จัดตั้งสำนักเรียน','TEST_จัดตั้งสำนักศาสนศึกษา','TEST_ยุบสำนักเรียน','TEST_ยุบสำนักศาสนศึกษา','TEST_เปิดสนามสอบนักธรรมชั้นตรี','TEST_ปิดสนามสอบนักธรรมชั้นโท-เอก','TEST_ย้ายสนามสอบธรรมศึกษา']) assert.ok(requests.includes(type), `System 4 offers ${type}`);
  assert.equal((requests.match(/<tr data-row=/g) || []).length, 9, 'System 4 shows nine TEST_ requests across both categories');
  action('export-csv', { module:'requests' });
  const requestCsv = await capturedBlobs.at(-1).text();
  for (const header of ['ประเภทคำขอ','หมวดคำขอ','สำนัก/สนามสอบ','จังหวัด','สถานะจำลอง']) assert.ok(requestCsv.includes(header), `System 4 export includes ${header}`);
  dispatch('change', { id:'requests-category-filter', value:'TEST_สนามสอบ' });
  requests = document.getElementById('page-content').innerHTML;
  assert.equal((requests.match(/<tr data-row=/g) || []).length, 5, 'request category filter selects exam-site requests');
  dispatch('change', { id:'requests-type-filter', value:'TEST_ย้ายสนามสอบธรรมศึกษา' });
  dispatch('change', { id:'requests-province-filter', value:'TEST_จังหวัดตัวอย่าง_001' });
  dispatch('change', { id:'requests-status-filter', value:'TEST_รอข้อมูลเพิ่มเติมจำลอง' });
  requests = document.getElementById('page-content').innerHTML;
  assert.equal((requests.match(/<tr data-row=/g) || []).length, 1, 'type, province, and status filters narrow request list');
  assert.ok(requests.includes('TEST_REQ_007'), 'filtered request is the matching Dhamma Studies relocation');
  action('view-row', { module:'requests', rowId:'TEST_REQ_007' });
  let requestDetail = document.getElementById('modal-root').innerHTML;
  for (const field of ['ประวัติความคืบหน้า','TEST_รับข้อมูลจำลอง','TEST_รอข้อมูลเพิ่มเติมจำลอง','TO VERIFY','ไม่มีคำสั่ง']) assert.ok(requestDetail.includes(field), `System 4 detail includes ${field}`);
  action('close-modal');
  dispatch('change', { id:'requests-category-filter', value:'all' });
  dispatch('change', { id:'requests-type-filter', value:'all' });
  dispatch('change', { id:'requests-province-filter', value:'all' });
  dispatch('change', { id:'requests-status-filter', value:'all' });
  action('new-requests');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ไม่มีการส่งคำขอจริง'), 'request draft form explains the TEST-only boundary');
  requestDraftForm = { querySelectorAll() { return [
    { name:'type', value:'TEST_จัดตั้งสำนักเรียน' }, { name:'target', value:'REAL_TARGET' },
    { name:'unit', value:'TEST_หน่วยงานผู้ยื่นทดสอบ' }, { name:'province', value:'TEST_จังหวัดตัวอย่าง_001' },
    { name:'summary', value:'TEST_รายละเอียดทดสอบ' }
  ]; } };
  action('modal-confirm');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('สร้างร่างคำขอ TEST_'), 'non-TEST_ request form data is rejected without closing the draft');
  requestDraftForm = { querySelectorAll() { return [
    { name:'type', value:'TEST_จัดตั้งสำนักเรียน' }, { name:'target', value:'TEST_สำนักเรียนทดสอบใหม่' },
    { name:'unit', value:'TEST_หน่วยงานผู้ยื่นทดสอบ' }, { name:'province', value:'TEST_จังหวัดตัวอย่าง_001' },
    { name:'summary', value:'TEST_รายละเอียดทดสอบ' }
  ]; } };
  action('modal-confirm');
  requestDraftForm = null;
  requests = document.getElementById('page-content').innerHTML;
  assert.ok(requests.includes('TEST_REQ_DRAFT_001') && requests.includes('TEST_ร่างคำขอจำลอง'), 'valid TEST_ request draft is added in memory');
  assert.equal((requests.match(/<tr data-row=/g) || []).length, 10, 'created TEST_ draft appears in the request list');

  let people = nav('people');
  for (const label of ['ตำแหน่งทางการปกครอง', 'ตำแหน่ง จศป. ฝ่ายการศึกษา', 'TEST_วัดตัวอย่าง 001', 'TEST_ตำบลตัวอย่าง', 'TEST_อำเภอตัวอย่าง', 'TEST_จังหวัดตัวอย่าง', 'TEST_ภาค_1']) assert.ok(people.includes(label), `System 1 includes ${label}`);
  for (const type of ['TEST_ขอย้าย', 'TEST_ลาออก', 'TEST_มรณภาพ-ตาย', 'TEST_ลาสิกขา']) assert.ok(people.includes(type), `System 1 includes status type ${type}`);
  assert.equal((people.match(/<tr data-row=/g) || []).length, 4, 'all four TEST_ status examples are listed');
  dispatch('change', { id: 'people-status-filter', value: 'TEST_ลาออก' });
  people = document.getElementById('page-content').innerHTML;
  assert.equal((people.match(/<tr data-row=/g) || []).length, 1, 'status filter narrows records to the selected category');
  assert.ok(people.includes('TEST_ลาออก'), 'filtered record shows the selected status category');
  dispatch('change', { id: 'people-status-filter', value: 'all' });
  people = document.getElementById('page-content').innerHTML;
  assert.ok(!people.includes('TEST_PHONE_001') && !people.includes('TEST_EMAIL_001') && !people.includes('TEST_LINE_001'), 'contact channels are absent from the people listing');
  action('view-row', { module: 'people', rowId: 'TEST_PERSON_001' });
  let profile = document.getElementById('modal-root').innerHTML;
  for (const field of ['ตำแหน่ง', 'สังกัดวัด', 'ตำบล', 'อำเภอ', 'จังหวัด', 'ภาค (1–18)', 'TEST_ภาค_1', 'ตรวจสอบสถานะและประวัติรายการ', 'TEST_ขอย้าย', 'วันที่มีผล', 'วันที่บันทึก', 'TEST_ไม่มีหลักฐานจริง', 'ไม่มีผลพิจารณาหรือคำสั่งจริง', 'เบอร์โทรติดต่อ', 'อีเมล', 'LINE ID', 'TEST_PHONE_001', 'TEST_EMAIL_001@example.test', 'TEST_LINE_001']) assert.ok(profile.includes(field), `person detail includes ${field}`);
  assert.ok(profile.includes('จำกัดสิทธิ์') && profile.includes('ห้ามใส่ข้อมูลติดต่อจริง'), 'person detail clearly marks contact as restricted and TEST-only');
  action('close-modal');
  action('view-row', { module: 'people', rowId: 'TEST_PERSON_003' });
  profile = document.getElementById('modal-root').innerHTML;
  assert.ok(profile.includes('TEST_ครูบาลี') && profile.includes('TEST_อาจารย์ใหญ่สำนักเรียน') && profile.includes('หลายตำแหน่ง') && profile.includes('ซ้ำ/ทับซ้อน'), 'person detail separates and warns about multiple education positions');
  action('close-modal');
  action('new-people');
  const personDraft = document.getElementById('modal-root').innerHTML;
  for (const field of ['draft-governancePosition', 'draft-education-position-1', 'draft-section', 'draft-office', 'draft-temple', 'draft-subdistrict', 'draft-district', 'draft-province', 'draft-sanghaRegion', 'draft-region', 'draft-phone', 'draft-email', 'draft-lineId', 'TEST_เลขานุการเจ้าคณะภาค', 'TEST_เลขานุการเจ้าสำนักเรียน', 'TEST_เจ้าสำนักเรียน', 'TEST_เจ้าสำนักศาสนศึกษา', 'TEST_เลขานุการเจ้าสำนักศาสนศึกษา', 'TEST_รองอาจารย์ใหญ่สำนักศาสนศึกษา', 'TEST_พระปริยัตินิเทศก์', 'TEST_ครูธรรม']) assert.ok(personDraft.includes(field), `person form includes ${field}`);
  assert.equal((personDraft.match(/data-education-position=/g) || []).length, 12, 'education roles are multi-select checkboxes with 12 options');
  assert.ok(personDraft.includes('เลือกได้มากกว่า 1 ตำแหน่ง') && personDraft.includes('education-role-warning'), 'education multi-select explains duplicate warning behavior');
  const governanceOptions = personDraft.match(/<select id="draft-governancePosition"[\s\S]*?<\/select>/)?.[0] || '';
  assert.equal((governanceOptions.match(/<option value="TEST_/g) || []).length, 12, 'governance position is a single select with 12 options');
  for (const role of ['TEST_เลขานุการเจ้าคณะตำบล','TEST_เจ้าคณะตำบล','TEST_เลขานุการเจ้าคณะอำเภอ','TEST_เจ้าคณะอำเภอ','TEST_เลขานุการรองเจ้าคณะจังหวัด','TEST_รองเจ้าคณะจังหวัด','TEST_เลขานุการเจ้าคณะจังหวัด','TEST_เจ้าคณะจังหวัด','TEST_เลขานุการรองเจ้าคณะภาค','TEST_รองเจ้าคณะภาค','TEST_เลขานุการเจ้าคณะภาค','TEST_เจ้าคณะภาค']) assert.ok(governanceOptions.includes(`value="${role}"`), `System 1 governance choices include ${role}`);
  for (const role of ['TEST_ครูธรรม','TEST_ครูบาลี','TEST_พระปริยัตินิเทศก์','TEST_ผู้อำนวยการโรงเรียนปริยัติสามัญ','TEST_เลขานุการเจ้าสำนักเรียน','TEST_รองอาจารย์ใหญ่สำนักเรียน','TEST_อาจารย์ใหญ่สำนักเรียน','TEST_เจ้าสำนักเรียน','TEST_เลขานุการเจ้าสำนักศาสนศึกษา','TEST_รองอาจารย์ใหญ่สำนักศาสนศึกษา','TEST_อาจารย์ใหญ่สำนักศาสนศึกษา','TEST_เจ้าสำนักศาสนศึกษา']) assert.ok(personDraft.includes(`data-education-position="${role}"`), `System 1 education choices include ${role}`);
  const regionSelect = personDraft.match(/<select id="draft-sanghaRegion"[\s\S]*?<\/select>/)?.[0] || '';
  assert.ok(regionSelect.includes('value="TEST_ภาค_1">ภาค 1') && regionSelect.includes('value="TEST_ภาค_18">ภาค 18'), 'region dropdown includes TEST_ values from 1 through 18');
  assert.equal((regionSelect.match(/<option value="TEST_ภาค_/g) || []).length, 18, 'region dropdown has exactly 18 selectable regions');
  assert.ok(personDraft.indexOf('id="draft-province"') < personDraft.indexOf('id="draft-sanghaRegion"') && personDraft.indexOf('id="draft-sanghaRegion"') < personDraft.indexOf('id="draft-region"'), 'region dropdown follows province and precedes the existing area field');
  assert.ok(personDraft.includes('ช่องทางติดต่อไม่บังคับ'), 'contact inputs are optional in the TEST form');
  dispatch('input', { id:'draft-name', value:'TEST_คฤหัสถ์สมมติ 003' });
  dispatch('change', { dataset:{educationPosition:'TEST_ครูบาลี'}, checked:true });
  dispatch('change', { dataset:{educationPosition:'TEST_อาจารย์ใหญ่สำนักเรียน'}, checked:true });
  const positionWarning = document.getElementById('education-role-warning').innerHTML;
  assert.ok(positionWarning.includes('หลายตำแหน่ง') && positionWarning.includes('ชื่อซ้ำกับระเบียน TEST_PERSON_003') && positionWarning.includes('ซ้ำหรือไม่'), 'education selection warns for multiple roles and same-name role overlap');
  action('close-modal');
  action('export-csv', { module: 'people' });
  const peopleCsv = await capturedBlobs.at(-1).text();
  for (const field of ['ตำแหน่งทางการปกครอง', 'ตำแหน่ง จศป. ฝ่ายการศึกษา', 'TEST_ครูบาลี | TEST_อาจารย์ใหญ่สำนักเรียน', 'แท่ง/แผนก', 'สังกัดวัด', 'ตำบล', 'อำเภอ', 'จังหวัด', 'ภาค (1–18)', 'TEST_ภาค_1']) assert.ok(peopleCsv.includes(field), `people CSV includes ${field}`);
  assert.ok(!peopleCsv.includes('TEST_PHONE_001') && !peopleCsv.includes('TEST_EMAIL_001') && !peopleCsv.includes('TEST_LINE_001') && !peopleCsv.includes('TEST_ขอย้าย'), 'people CSV excludes contact and lifecycle status data');

  let organizations = nav('organizations');
  for (const type of ['TEST_สำนักเรียน','TEST_สำนักศาสนศึกษา','TEST_สำนักเรียนบาลีประจำจังหวัด','TEST_วัด','TEST_องค์กร','TEST_สถานศึกษา','TEST_สนามสอบบาลี','TEST_สนามสอบนักธรรมชั้นตรี','TEST_สนามสอบนักธรรมชั้นโท-เอก','TEST_สนามสอบธรรมศึกษา']) assert.ok(organizations.includes(type), `System 2 includes ${type}`);
  assert.equal((organizations.match(/<tr data-row=/g)||[]).length,10,'System 2 starts with ten TEST_ directory entries');
  assert.ok(organizations.includes('TEST_สนามสอบนักธรรมชั้นตรีตัวอย่าง') && organizations.includes('TEST_สนามสอบนักธรรมชั้นโท-เอกตัวอย่าง'),'System 2 lists the two Naktham exam levels separately');
  for (const field of ['ที่อยู่','ตำบล','อำเภอ','จังหวัด','ประเภทสนาม / รอบสอบ','ประธานสนามสอบ','ผู้รับข้อสอบ']) assert.ok(organizations.includes(field), `System 2 table includes ${field}`);
  assert.ok(organizations.includes('organization-province-filter') && organizations.includes('กรองจังหวัด'), 'System 2 has a province filter');
  assert.ok(!organizations.includes('TEST_ที่อยู่ประธาน_007') && !organizations.includes('TEST_PHONE_CHAIR_007') && !organizations.includes('TEST_EMAIL_RECEIVER_007') && !organizations.includes('TEST_LINE_RECEIVER_007'), 'System 2 table hides contact addresses and channels');
  dispatch('change',{id:'organization-type-filter',value:'TEST_สนามสอบบาลี'});
  organizations = document.getElementById('page-content').innerHTML;
  assert.equal((organizations.match(/<tr data-row=/g)||[]).length,1,'System 2 type filter narrows to Pali exam sites');
  dispatch('change',{id:'organization-type-filter',value:'TEST_สนามสอบนักธรรมชั้นตรี'});
  organizations = document.getElementById('page-content').innerHTML;
  assert.ok(organizations.includes('TEST_EXAM_SITE_NAKTHAM_TRI_001') && !organizations.includes('TEST_EXAM_SITE_NAKTHAM_UPPER_001'),'System 2 filters Naktham Tri independently');
  dispatch('change',{id:'organization-type-filter',value:'TEST_สนามสอบนักธรรมชั้นโท-เอก'});
  organizations = document.getElementById('page-content').innerHTML;
  assert.ok(organizations.includes('TEST_EXAM_SITE_NAKTHAM_UPPER_001') && !organizations.includes('TEST_EXAM_SITE_NAKTHAM_TRI_001'),'System 2 filters Naktham Tho-Ek independently');
  dispatch('change',{id:'organization-type-filter',value:'TEST_สนามสอบบาลี'});
  organizations = document.getElementById('page-content').innerHTML;
  dispatch('change',{id:'organization-type-filter',value:'all'});
  dispatch('change',{id:'organization-province-filter',value:'TEST_จังหวัด_007'});
  organizations = document.getElementById('page-content').innerHTML;
  assert.ok(organizations.includes('TEST_EXAM_SITE_PALI_001') && !organizations.includes('TEST_ORG_001'), 'System 2 province filter narrows rows to the selected province');
  dispatch('change',{id:'organization-province-filter',value:'all'});
  dispatch('change',{id:'organization-type-filter',value:'TEST_สนามสอบบาลี'});
  action('view-row',{module:'organizations',rowId:'TEST_EXAM_SITE_PALI_001'});
  let organizationProfile = document.getElementById('modal-root').innerHTML;
  for (const field of ['TEST_SESSION_PALI_001','TEST_ประธานสนาม_007','TEST_ผู้รับข้อสอบ_007','ประธานสนามสอบ','ผู้รับข้อสอบประจำสนาม','ที่อยู่','เบอร์โทร','อีเมล','LINE ID','TEST_PHONE_CHAIR_007','TEST_EMAIL_RECEIVER_007@example.test','TEST_LINE_RECEIVER_007','จำกัดสิทธิ์']) assert.ok(organizationProfile.includes(field),`System 2 details include ${field}`);
  action('close-modal');
  action('new-organizations');
  const organizationDraft = document.getElementById('modal-root').innerHTML;
  for (const field of ['org-draft-name','org-draft-type','org-draft-address','org-draft-province','org-draft-examType','org-draft-examSessionId','org-draft-chairAddress','org-draft-chairPhone','org-draft-chairEmail','org-draft-chairLineId','org-draft-receiverAddress','org-draft-receiverPhone','org-draft-receiverEmail','org-draft-receiverLineId']) assert.ok(organizationDraft.includes(field),`System 2 entry form includes ${field}`);
  for (const level of ['TEST_นักธรรมชั้นตรี','TEST_นักธรรมชั้นโท-เอก']) assert.ok(organizationDraft.includes(level),`System 2 exam assignment form includes ${level}`);
  action('close-modal');
  action('export-csv',{module:'organizations'});
  const organizationCsv = await capturedBlobs.at(-1).text();
  for (const field of ['ชื่อประธานสนามสอบ','โทรศัพท์ประธานสนามสอบ','อีเมลผู้รับข้อสอบ','LINE ID ผู้รับข้อสอบ','TEST_สนามสอบนักธรรมชั้นตรี','TEST_สนามสอบนักธรรมชั้นโท-เอก','TEST_PHONE_CHAIR_007','TEST_EMAIL_RECEIVER_007@example.test','TEST_LINE_RECEIVER_007']) assert.ok(organizationCsv.includes(field),`System 2 CSV includes ${field}`);

  let pali = nav('pali');
  assert.equal((pali.match(/<tr><td>/g) || []).length, 20, 'Pali catalogue contains 20 class-subject pairs');
  assert.ok(pali.includes('คลังบทเรียนและข้อสอบ') && pali.includes('นักธรรม') && pali.includes('ธรรมศึกษา') && pali.includes('บาลี'), 'System 3 combines three learning banks in one menu');
  dispatch('change', { id: 'level-filter', value: 'ป.ธ.8' });
  pali = document.getElementById('page-content').innerHTML;
  assert.equal((pali.match(/<tr><td>/g) || []).length, 3, 'P.Th.8 filter contains three subjects');
  action('course-track', { track: 'naktham' });
  let courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/<tr><td>/g) || []).length, 12, 'Naktham catalogue contains 12 level-subject pairs');
  for (const label of ['นักธรรมชั้นตรี','นักธรรมชั้นโท','นักธรรมชั้นเอก','เรียงความแก้กระทู้ธรรม','ธรรมวิภาค','พุทธประวัติ','วินัยมุข']) assert.ok(courses.includes(label), `Naktham catalogue includes ${label}`);
  action('course-tab', { tab: 'assessments' });
  courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/data-assessment-mode="pre"/g) || []).length, 12, 'Naktham offers a pre-test status entry for every subject');
  assert.equal((courses.match(/data-assessment-mode="post"/g) || []).length, 12, 'Naktham offers a post-test status entry for every subject');
  action('assessment-status', { courseId: 'TEST_COURSE_NAKTHAM_1_1', assessmentMode: 'pre' });
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ยังเริ่มทำแบบทดสอบไม่ได้') && document.getElementById('modal-root').innerHTML.includes('ไม่มีการสร้างข้อสอบ'), 'pre-test entry is gated until approved content exists and creates no fake questions');
  action('close-modal');
  action('course-track', { track: 'dhamma-studies' });
  courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/<tr><td>/g) || []).length, 25, 'Dhamma Studies first page shows no more than 25 subject rows');
  assert.ok(courses.includes('36 รายวิชา') && courses.includes('หน้า 1 จาก 2'), 'Dhamma Studies catalogue paginates all 36 subject rows');
  for (const label of [
    'ธรรมศึกษาชั้นตรี · ระดับประถมศึกษา','ธรรมศึกษาชั้นตรี · ระดับมัธยมศึกษา','ธรรมศึกษาชั้นตรี · ระดับอุดมศึกษา',
    'ธรรมศึกษาชั้นโท · ระดับประถมศึกษา','ธรรมศึกษาชั้นโท · ระดับมัธยมศึกษา','ธรรมศึกษาชั้นโท · ระดับอุดมศึกษา',
    'ธรรมศึกษาชั้นเอก · ระดับประถมศึกษา','ธรรมศึกษาชั้นเอก · ระดับมัธยมศึกษา','ธรรมศึกษาชั้นเอก · ระดับอุดมศึกษา',
    'เรียงความแก้กระทู้ธรรม','ธรรม','พุทธประวัติ','พุทธานุพุทธประวัติ','วินัย (เบญจศีล-เบญจธรรม)','วินัย (อุโบสถศีล)'
  ]) assert.ok(courses.includes(label), `Dhamma Studies catalogue includes ${label}`);
  action('page-last', { pageKey: 'pali' });
  courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/<tr><td>/g) || []).length, 11, 'last Dhamma Studies page contains remaining 11 subject rows');
  assert.ok(courses.includes('วินัย (กรรมบถ)'), 'last Dhamma Studies page includes the Ek curriculum subject');
  action('page-first', { pageKey: 'pali' });
  dispatch('change', { id: 'level-filter', value: 'ธรรมศึกษาชั้นตรี · ระดับประถมศึกษา' });
  courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/<tr><td>/g) || []).length, 4, 'each Dhamma Study education stage filters to its four subject rows');
  const selectedStageRows = courses.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] || '';
  assert.ok(selectedStageRows.includes('ธรรมศึกษาชั้นตรี · ระดับประถมศึกษา') && !selectedStageRows.includes('ธรรมศึกษาชั้นโท · ระดับประถมศึกษา'), 'stage filter isolates the selected tier and education band');
  dispatch('change', { id: 'level-filter', value: 'ทั้งหมด' });
  action('course-tab', { tab: 'assessments' });
  courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/data-assessment-mode="pre"/g) || []).length, 25, 'first page exposes pre-test status for each listed subject');
  assert.equal((courses.match(/data-assessment-mode="post"/g) || []).length, 25, 'first page exposes post-test status for each listed subject');
  action('page-last', { pageKey: 'pali' });
  courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/data-assessment-mode="pre"/g) || []).length, 11, 'last page exposes pre-test status for remaining subjects');
  assert.equal((courses.match(/data-assessment-mode="post"/g) || []).length, 11, 'last page exposes post-test status for remaining subjects');
  action('assessment-status', { courseId: 'TEST_COURSE_DHAMMA_1_1', assessmentMode: 'post' });
  assert.ok(document.getElementById('modal-root').innerHTML.includes('แบบทดสอบหลังเรียน') && document.getElementById('modal-root').innerHTML.includes('ไม่พบชุดข้อสอบหลังเรียน'), 'post-test entry is gated until a released question bank exists');
  action('close-modal');
  action('course-track', { track: 'pali' });
  courses = document.getElementById('page-content').innerHTML;
  assert.equal((courses.match(/<tr><td>/g) || []).length, 20, 'switching back to Pali restores all 20 pairs');

  nav('budget');
  let budget = document.getElementById('page-content').innerHTML;
  assert.ok(budget.includes('500,000.00'), 'plan remaining uses allocation minus commitment');
  assert.ok(budget.includes('1,600,000.00') && budget.includes('540,000.00') && budget.includes('270,000.00') && budget.includes('1,060,000.00'), 'budget KPIs are calculated from TEST_ plan rows');
  assert.ok(budget.includes('ค้างจ่ายตามผูกพัน') && budget.includes('จ่ายจริง · เป็นส่วนหนึ่งของยอดผูกพัน'), 'paid amount is tracked inside commitments without double counting');
  assert.equal((budget.match(/class="budget-tab /g) || []).length, 8, 'System 06 exposes all eight budget workflow stages');
  assert.ok(budget.includes('นำเข้าแผน Excel') && budget.includes('ส่งออกแผน Excel'), 'System 06 retains Excel plan import/export routes');
  assert.ok(!budget.includes('860,000.00'), 'stale hard-coded budget summary is removed');
  for (const stage of ['overview','plan','transfer','commitment','disbursement','refund','reconcile','close']) {
    action('budget-tab', { tab:stage });
    budget = document.getElementById('page-content').innerHTML;
    if (stage !== 'overview') assert.ok(budget.includes(`data-pagination="${stage === 'plan' ? 'budget' : `budget-events-${stage}`}"`), `System 06 ${stage} list has pagination controls`);
    assert.ok(budget.includes('TEST_'), `System 06 ${stage} remains TEST_-only`);
  }
  action('budget-tab', { tab:'commitment' });
  action('budget-new', { stage:'commitment' });
  assert.ok(document.getElementById('modal-root').innerHTML.includes('จำนวนเต็มสตางค์'), 'commitment draft explains integer satang input');
  document.getElementById('budget-draft-ref').value = 'TEST_BUDGET_DRAFT_101';
  document.getElementById('budget-draft-period').value = 'TEST_PERIOD_01';
  document.getElementById('budget-draft-name').value = 'TEST_รายการผูกพันทดสอบ';
  document.getElementById('budget-draft-unit').value = 'TEST_หน่วยงานทดสอบ';
  document.getElementById('budget-draft-amount').value = '1.25';
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('จำนวนเต็มสตางค์'), 'decimal amounts are rejected');
  document.getElementById('budget-draft-amount').value = '106000001';
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('เกินวงเงิน'), 'commitment drafts cannot exceed uncommitted TEST_ budget');
  document.getElementById('budget-draft-amount').value = '12500';
  action('modal-confirm');
  budget = document.getElementById('page-content').innerHTML;
  assert.ok(budget.includes('TEST_BUDGET_DRAFT_101') && budget.includes('125.00'), 'valid integer-satang draft is stored in browser memory and displayed');
  assert.ok(budget.includes('ยังไม่ผ่านการตรวจสอบ') && budget.includes('ไม่มีรายการอนุมัติหรือปิดงวดจริง'), 'created budget draft does not imply approval or a real transaction');
  action('budget-tab', { tab:'disbursement' });
  action('budget-new', { stage:'disbursement' });
  document.getElementById('budget-draft-ref').value = 'TEST_BUDGET_DRAFT_102';
  document.getElementById('budget-draft-period').value = 'TEST_PERIOD_01';
  document.getElementById('budget-draft-name').value = 'TEST_รายการจ่ายเกิน';
  document.getElementById('budget-draft-unit').value = 'TEST_หน่วยงานทดสอบ';
  document.getElementById('budget-draft-amount').value = '27000001';
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('เกินยอดผูกพันค้างจ่าย'), 'payment drafts cannot exceed unpaid commitments');
  action('close-modal');
  action('budget-tab', { tab:'reconcile' });
  action('budget-detail', { stage:'reconcile', rowId:'TEST_RECON_002' });
  assert.ok(document.getElementById('modal-root').innerHTML.includes('TEST_พบส่วนต่างจำลอง') && document.getElementById('modal-root').innerHTML.includes('ไม่มีการอนุมัติ'), 'reconciliation detail shows simulated difference without claiming approval');
  action('close-modal');
  dispatch('change', { id:'budget-period-filter', value:'TEST_PERIOD_02' });
  budget = document.getElementById('page-content').innerHTML;
  assert.ok(budget.includes('TEST_RECON_002') && !budget.includes('TEST_RECON_001'), 'budget period filter selects only the requested TEST_ period');

  let assets=nav('assets');
  assert.equal((assets.match(/class="budget-tab /g)||[]).length,11,'System 07 exposes inventory, movement, purchase, receiving, issue, return, transfer, loans, maintenance, count, and disposal tabs');
  assert.ok(assets.includes('data-pagination="assets"')&&assets.includes('ส่งออก Stock card CSV'),'System 07 keeps inventory pagination and stock-card export');
  assert.ok(assets.includes('31 หน่วย')&&assets.includes('23 หน่วย')&&assets.includes('4 หน่วย'),'System 07 calculates inventory per location from TEST_ movement records');
  action('asset-detail',{stage:'inventory',rowId:'TEST_ASSET_001@TEST_สำนักงานตัวอย่าง'});
  assert.ok(document.getElementById('modal-root').innerHTML.includes('TEST_OPENING_PC_001')&&document.getElementById('modal-root').innerHTML.includes('TEST_ISSUE_PC_001'),'System 07 Stock card detail shows the immutable movement history behind a balance');
  action('close-modal');
  for(const stage of ['inventory','movement','purchase','receive','issue','return','transfer','loans','maintenance','count','disposal']){
    action('asset-tab',{tab:stage});
    assets=document.getElementById('page-content').innerHTML;
    if(stage!=='inventory')assert.ok(assets.includes(`data-pagination="asset-events-${stage}"`),`System 07 ${stage} view has pagination`);
    assert.ok(assets.includes('TEST_'),`System 07 ${stage} remains TEST_-only`);
  }
  action('asset-tab',{tab:'issue'});
  action('asset-new',{stage:'issue'});
  fillAssetDraft({'asset-reference':'TEST_ISSUE_OVERDRAW_001','asset-id':'TEST_ASSET_002','asset-quantity':'999','asset-location':'TEST_คลังตัวอย่าง','asset-note':'TEST_ทดสอบเบิกเกิน'});
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('ยอดคงเหลือในคลังต้นทางไม่พอ'),'System 07 rejects over-issue before changing movement-derived stock');
  action('close-modal');

  action('asset-tab',{tab:'purchase'});
  action('asset-new',{stage:'purchase'});
  fillAssetDraft({'asset-reference':'TEST_PURCHASE_REQUEST_002','asset-id':'TEST_ASSET_002','asset-quantity':'2','asset-budget-reference':'TEST_BUDGET_002','asset-note':'TEST_ร่างคำขอซื้อ'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('TEST_PURCHASE_REQUEST_002')&&assets.includes('31 หน่วย'),'System 07 purchase request links a TEST_ budget plan without committing funds or changing stock');

  action('asset-tab',{tab:'receive'});
  action('asset-new',{stage:'receive'});
  fillAssetDraft({'asset-reference':'TEST_RECEIVE_PAPER_999','asset-id':'TEST_ASSET_002','asset-quantity':'2','asset-location':'TEST_คลังตัวอย่าง','asset-note':'TEST_รับเข้าทดสอบ'});
  action('modal-confirm');
  action('asset-tab',{tab:'inventory'});
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('33 หน่วย')&&assets.includes('25 หน่วย'),'System 07 adds a validated receiving movement and recomputes balance');
  action('asset-tab',{tab:'receive'});
  action('asset-new',{stage:'receive'});
  fillAssetDraft({'asset-reference':'TEST_RECEIVE_PAPER_999','asset-id':'TEST_ASSET_002','asset-quantity':'2','asset-location':'TEST_คลังตัวอย่าง','asset-note':'TEST_รับเข้าซ้ำ'});
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('รหัสอ้างอิง TEST_ ซ้ำ'),'System 07 reference uniqueness prevents retry from duplicating a movement');
  action('close-modal');

  action('asset-tab',{tab:'transfer'});
  action('asset-new',{stage:'transfer'});
  fillAssetDraft({'asset-reference':'TEST_ASSET_TRANSFER_001','asset-id':'TEST_ASSET_002','asset-quantity':'2','asset-from-location':'TEST_คลังตัวอย่าง','asset-to-location':'TEST_คลังย่อยตัวอย่าง','asset-note':'TEST_ทดสอบโอน'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('TEST_ASSET_TRANSFER_001')&&assets.includes('33 หน่วย'),'System 07 records transfer pair while preserving total stock');
  action('asset-tab',{tab:'movement'});
  assets=document.getElementById('page-content').innerHTML;
  assert.equal((assets.match(/data-row="[^"]*TEST_ASSET_TRANSFER_001/g)||[]).length,2,'System 07 stores both transfer-out and transfer-in movements under one idempotent reference');

  action('asset-tab',{tab:'count'});
  action('asset-new',{stage:'count'});
  fillAssetDraft({'asset-reference':'TEST_COUNT_VARIANCE_001','asset-id':'TEST_ASSET_002','asset-quantity':'99','asset-location':'TEST_คลังตัวอย่าง','asset-note':'TEST_ตรวจนับคลาดเคลื่อน'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('ต่าง 76')&&assets.includes('33 หน่วย'),'System 07 records a count variance but does not adjust stock automatically');

  action('asset-tab',{tab:'maintenance'});
  action('asset-new',{stage:'maintenance'});
  fillAssetDraft({'asset-reference':'TEST_REPAIR_002','asset-id':'TEST_ASSET_003','asset-quantity':'1','asset-location':'TEST_สำนักเรียนตัวอย่าง','asset-note':'TEST_แจ้งซ่อมตัวอย่าง'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('33 หน่วย')&&assets.includes('2'),'System 07 maintenance entry does not change stock quantity');

  action('asset-tab',{tab:'disposal'});
  action('asset-new',{stage:'disposal'});
  fillAssetDraft({'asset-reference':'TEST_DISPOSAL_REQUEST_002','asset-id':'TEST_ASSET_002','asset-quantity':'1','asset-location':'TEST_คลังย่อยตัวอย่าง','asset-note':'TEST_คำขอจำหน่ายทดสอบ'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('33 หน่วย')&&assets.includes('TEST_รอหลักเกณฑ์และอำนาจ'),'System 07 disposal remains a request and does not write off stock');

  action('asset-tab',{tab:'loans'});
  action('asset-new',{stage:'loans'});
  fillAssetDraft({'asset-reference':'TEST_ASSET_LOAN_CREATE_001','asset-id':'TEST_ASSET_001','asset-quantity':'1','asset-location':'TEST_สำนักงานตัวอย่าง','asset-borrower':'TEST_ผู้ยืมทดสอบ','asset-note':'TEST_ยืมเพื่อทดสอบ'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('32 หน่วย'),'System 07 loan movement reduces stock held in the lending location');
  action('asset-new',{stage:'loans'});
  fillAssetDraft({'asset-reference':'TEST_ASSET_LOAN_RETURN_001','asset-id':'TEST_ASSET_001','asset-quantity':'1','asset-location':'TEST_สำนักงานตัวอย่าง','asset-source-reference':'TEST_ASSET_LOAN_CREATE_001','asset-loan-mode':'return','asset-borrower':'TEST_ผู้ยืมทดสอบ','asset-note':'TEST_คืนยืมทดสอบ'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('33 หน่วย')&&assets.includes('TEST_คืนครบแล้ว'),'System 07 loan return restores quantity and closes only the TEST_ loan record');
  action('asset-tab',{tab:'return'});
  action('asset-new',{stage:'return'});
  fillAssetDraft({'asset-reference':'TEST_ASSET_RETURN_OVER_001','asset-id':'TEST_ASSET_001','asset-quantity':'2','asset-location':'TEST_สำนักงานตัวอย่าง','asset-source-reference':'TEST_ISSUE_PC_001','asset-note':'TEST_คืนเกินยอด'});
  action('modal-confirm');
  assert.ok(document.getElementById('toast-root').innerHTML.includes('จำนวนคืนไม่ตรง'),'System 07 rejects a return quantity above the source issue balance');
  action('close-modal');
  action('asset-new',{stage:'return'});
  fillAssetDraft({'asset-reference':'TEST_ASSET_RETURN_001','asset-id':'TEST_ASSET_001','asset-quantity':'1','asset-location':'TEST_สำนักงานตัวอย่าง','asset-source-reference':'TEST_ISSUE_PC_001','asset-note':'TEST_คืนจากการเบิก'});
  action('modal-confirm');
  assets=document.getElementById('page-content').innerHTML;
  assert.ok(assets.includes('34 หน่วย'),'System 07 valid issue return adds a movement and restores on-hand quantity');
  action('asset-export-movements');
  const assetMovementCsv=await capturedBlobs.at(-1).text();
  for(const field of ['รหัส movement TEST_','ประเภท movement','TEST_ASSET_LOAN_CREATE_001','TEST_ASSET_LOAN_RETURN_001','TEST_ASSET_RETURN_001'])assert.ok(assetMovementCsv.includes(field),`System 07 stock-card CSV includes ${field}`);

  action('open-data-import',{module:'assets'});
  let assetDataTools=document.getElementById('page-content').innerHTML;
  assert.ok(assetDataTools.includes('จำนวนคงเหลือมาจาก stock movement')&&assetDataTools.includes('data-excel-file'),'System 07 Excel import explicitly keeps on-hand quantity movement-derived');
  action('export-xlsx',{module:'assets'});
  const assetWorkbook=capturedBlobs.at(-1);
  const assetWorkbookBytes=new Uint8Array(await assetWorkbook.arrayBuffer());
  const assetWorkbookFile={name:'TEST_assets_master_export.xlsx',size:assetWorkbookBytes.length,arrayBuffer:async()=>assetWorkbookBytes.buffer.slice(assetWorkbookBytes.byteOffset,assetWorkbookBytes.byteOffset+assetWorkbookBytes.byteLength)};
  dispatch('change',{id:'data-excel-file',files:[assetWorkbookFile]});
  await waitFor(()=>document.getElementById('page-content').innerHTML.includes('Preview · TEST_assets_master_export.xlsx'),'System 07 master workbook preview');
  assetDataTools=document.getElementById('page-content').innerHTML;
  assert.ok(assetDataTools.includes('คลัง/หน่วยงานเริ่มต้น')&&!assetDataTools.includes('<th>จำนวน</th>')&&!assetDataTools.includes('TEST_ASSET_MOVEMENT_'),'System 07 master workbook preview does not import movement-derived counts');
  action('commit-data-import');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('เขียนทับข้อมูลเดิม'),'System 07 Excel overwrite requires separate confirmation');
  action('close-modal');
  assets=nav('assets');
  assert.ok(assets.includes('34 หน่วย'),'cancelled Excel overwrite leaves TEST_ stock movements unchanged');

  nav('exam-import');
  let examImportDownloads = document.getElementById('page-content').innerHTML;
  assert.equal((examImportDownloads.match(/class="form-download-card"/g) || []).length, 6, 'System 09 offers all six class-specific Naktham and Dhamma Studies workbooks');
  for (const file of [
    'สำหรับพระภิกษุ-สามเณร-ศ.๑-นักธรรมชั้นตรี_2568-v3.xls',
    'สำหรับพระภิกษุ-สามเณร-ศ.๒-นักธรรมชั้นโท_2568-v3.xls',
    'สำหรับพระภิกษุ-สามเณร-ศ.๒-นักธรรมชั้นเอก_2568-v3.xls',
    'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๕-ธรรมศึกษาชั้นตรี_2568-v3.xls',
    'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๖-ธรรมศึกษาชั้นโท_2568-v3.xls',
    'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๖-ธรรมศึกษาชั้นเอก_2568-v3.xls'
  ]) {
    const filePath = path.join(root, 'dist/assets/forms', file);
    if (file.startsWith('สำหรับพระภิกษุ')) {
      assert.ok(examImportDownloads.includes('https://dhammastudy.org/') && examImportDownloads.includes('เปิดเว็บไซต์เจ้าของแบบ'), 'source-only forms have working owner-source links');
      assert.ok(!fs.existsSync(filePath), 'unapproved legacy forms are excluded from public deployment');
      continue;
    }
    assert.ok(examImportDownloads.includes(`download="${file}"`), `System 09 download card exposes ${file}`);
    assert.ok(fs.existsSync(filePath) && fs.statSync(filePath).size > 0, `download asset exists and is nonempty: ${file}`);
    const header = fs.readFileSync(filePath).subarray(0, 8).toString('hex');
    assert.equal(header, 'd0cf11e0a1b11ae1', `legacy Excel file signature is valid: ${file}`);
  }
  assert.ok(examImportDownloads.includes('ลบ metadata ผู้จัดทำแล้ว') && examImportDownloads.includes('ยังไม่ผ่านการอนุญาตเผยแพร่สาธารณะ'), 'System 09 explains sanitized copies and source-only forms');
  const xlsxPath = path.join(root, 'dist/assets/TEST_exam_signup_template.xlsx');
  const xlsxBytes = fs.readFileSync(xlsxPath);
  const xlsxFile = { name: 'TEST_exam_signup_template.xlsx', size: xlsxBytes.length, arrayBuffer: async () => xlsxBytes.buffer.slice(xlsxBytes.byteOffset, xlsxBytes.byteOffset + xlsxBytes.byteLength) };
  let examImport = document.getElementById('page-content').innerHTML;
  for (const form of ['TEST_FORM_NAKTHAM_TRI','TEST_FORM_NAKTHAM_UPPER','TEST_FORM_DHAMMA_TRI','TEST_FORM_DHAMMA_UPPER','ศ.1','ศ.2','ศ.5','ศ.6']) assert.ok(examImport.includes(form),`System 09 offers ${form}`);
  dispatch('change', { id: 'excel-file', files: [xlsxFile] });
  await new Promise(resolve=>setTimeout(resolve,10));
  assert.ok(!document.getElementById('page-content').innerHTML.includes('Preview · TEST_exam_signup_template.xlsx') && document.getElementById('toast-root').innerHTML.includes('กรุณาเลือกประเภทบัญชี'),'System 09 refuses upload until a form type is selected');
  dispatch('change',{id:'exam-form-type',value:'TEST_FORM_NAKTHAM_TRI'});
  examImport = document.getElementById('page-content').innerHTML;
  assert.ok(examImport.includes('ศ.1–2') && examImport.includes('ต้องยืนยัน'),'System 09 surfaces the user/source discrepancy for Naktham Tri form code');
  dispatch('change', { id: 'excel-file', files: [xlsxFile] });
  await waitFor(() => document.getElementById('page-content').innerHTML.includes('Preview · TEST_exam_signup_template.xlsx'), 'System 9 XLSX preview');
  let content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('TEST_ผู้สมัครตัวอย่าง'), 'XLSX first worksheet is parsed');
  assert.ok(content.includes('นักธรรมชั้นตรี · ศ.1') && content.includes('ไม่ใช่สำเนาแบบฟอร์มทางการ'),'System 09 preview binds the selected form and does not claim an official template');
  assert.ok(content.includes('1 แถวใน preview') && content.includes('0 ข้อผิดพลาด'), 'valid TEST_ XLSX passes preview validation');
  dispatch('change',{id:'exam-form-type',value:'TEST_FORM_DHAMMA_TRI'});
  assert.ok(!document.getElementById('page-content').innerHTML.includes('Preview · TEST_exam_signup_template.xlsx'),'changing form type clears the old preview');
  dispatch('change', { id: 'excel-file', files: [xlsxFile] });
  await waitFor(() => document.getElementById('page-content').innerHTML.includes('Preview · TEST_exam_signup_template.xlsx'), 'System 9 mismatched form preview');
  assert.ok(document.getElementById('page-content').innerHTML.includes('ชั้นไม่ตรงกับประเภทบัญชีที่เลือก') && document.getElementById('page-content').innerHTML.includes('disabled'),'System 09 rejects a class that does not match its selected form');
  dispatch('change',{id:'exam-form-type',value:'TEST_FORM_NAKTHAM_TRI'});
  dispatch('change', { id: 'excel-file', files: [xlsxFile] });
  await waitFor(() => document.getElementById('page-content').innerHTML.includes('Preview · TEST_exam_signup_template.xlsx'), 'System 9 preview after form reselect');
  action('commit-import');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ยืนยันนำเข้า'), 'System 9 import requires confirmation');
  action('modal-confirm');
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('commit และรอบันทึกขึ้น Supabase แล้ว'), 'valid TEST_ XLSX commits only in demo memory');

  nav('exam-import');
  const validCsv = 'ชื่อผู้สมัคร,ประเภทผู้สมัคร,ชั้น,หน่วยงาน,รหัสรอบสอบ\nTEST_ผู้สมัคร001,TEST_บรรพชิต,TEST_นักธรรมตรี,TEST_สำนักเรียน,TEST_SESSION_001';
  dispatch('change', { id: 'excel-file', files: [{ name: 'TEST_valid.csv', size: validCsv.length, text: async () => validCsv }] });
  await new Promise(resolve => setTimeout(resolve, 30));
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('1 แถวใน preview') && content.includes('0 ข้อผิดพลาด'), 'valid TEST_ CSV previews without errors');
  action('commit-import');
  action('modal-confirm');
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('commit และรอบันทึกขึ้น Supabase แล้ว'), 'valid TEST_ CSV commits only in demo memory');

  nav('exam-import');
  const invalidCsv = 'ชื่อผู้สมัคร,ประเภทผู้สมัคร,ชั้น,หน่วยงาน,รหัสรอบสอบ\nREAL_NAME,TEST_บรรพชิต,TEST_นักธรรมตรี,TEST_สำนักเรียน,TEST_SESSION_001\nREAL_NAME,TEST_บรรพชิต,TEST_นักธรรมตรี,TEST_สำนักเรียน,TEST_SESSION_001';
  dispatch('change', { id: 'excel-file', files: [{ name: 'TEST_invalid.csv', size: invalidCsv.length, text: async () => invalidCsv }] });
  await new Promise(resolve => setTimeout(resolve, 30));
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('ชื่อผู้สมัครต้องขึ้นต้น TEST_'), 'non-TEST_ data rejected');
  assert.ok(content.includes('ชื่อซ้ำ'), 'duplicate rows rejected');
  assert.ok(content.includes('disabled'), 'invalid preview cannot commit');

  nav('exam-import');
  const examHeaders = 'ชื่อผู้สมัคร,ประเภทผู้สมัคร,ชั้น,หน่วยงาน,รหัสรอบสอบ';
  const duplicateColumnCsv = `${examHeaders},student_name\nTEST_ผู้สมัคร000,TEST_บรรพชิต,TEST_นักธรรมตรี,TEST_สำนักเรียน,TEST_SESSION_001,TEST_ชื่อสำรอง`;
  dispatch('change', { id:'excel-file', files:[{name:'TEST_exam_duplicate_column.csv',size:duplicateColumnCsv.length,text:async()=>duplicateColumnCsv}] });
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(document.getElementById('toast-root').innerHTML.includes('หัวคอลัมน์ซ้ำ') && !document.getElementById('page-content').innerHTML.includes('TEST_ชื่อสำรอง'),'System 09 rejects duplicate headers after normalization');
  const unknownColumnCsv = `${examHeaders},เลขประจำตัวประชาชน\nTEST_ผู้สมัคร000,TEST_บรรพชิต,TEST_นักธรรมตรี,TEST_สำนักเรียน,TEST_SESSION_001,TEST_ข้อมูลจำลอง`;
  dispatch('change', { id:'excel-file', files:[{name:'TEST_exam_unknown_column.csv',size:unknownColumnCsv.length,text:async()=>unknownColumnCsv}] });
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(document.getElementById('toast-root').innerHTML.includes('หัวคอลัมน์นอกแม่แบบ') && !document.getElementById('page-content').innerHTML.includes('TEST_ข้อมูลจำลอง'),'System 09 rejects an unrecognized personal-data column before preview');
  const overflowCsv = `${examHeaders}\nTEST_ผู้สมัคร000,TEST_บรรพชิต,TEST_นักธรรมตรี,TEST_สำนักเรียน,TEST_SESSION_001,TEST_ข้อมูลไม่มีหัว`;
  dispatch('change', { id:'excel-file', files:[{name:'TEST_exam_unmapped_value.csv',size:overflowCsv.length,text:async()=>overflowCsv}] });
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(document.getElementById('toast-root').innerHTML.includes('ค่าข้อมูลที่ไม่มีหัวคอลัมน์') && !document.getElementById('page-content').innerHTML.includes('TEST_ข้อมูลไม่มีหัว'),'System 09 rejects unmapped cell values without exposing them');

  nav('exam-import');
  const bulkExamRows = Array.from({length:276}, (_,index) => `TEST_ผู้สมัคร${String(index+1).padStart(3,'0')},TEST_บรรพชิต,TEST_นักธรรมตรี,TEST_สำนักเรียน,TEST_SESSION_001`);
  const bulkExamCsv = `${examHeaders}\n${bulkExamRows.join('\n')}`;
  dispatch('change', { id:'excel-file', files:[{name:'TEST_exam_bulk.csv',size:bulkExamCsv.length,text:async()=>bulkExamCsv}] });
  await new Promise(resolve=>setTimeout(resolve,40));
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('หน้า 1 จาก 12') && content.includes('data-pagination="exam-import-preview"'), 'System 9 preview paginates 276 rows into 12 pages');
  let previewBody = content.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] || '';
  assert.equal((previewBody.match(/<tr>/g)||[]).length,25,'System 9 preview shows at most 25 rows per page');
  action('page-next',{pageKey:'exam-import-preview'});
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('หน้า 2 จาก 12') && content.includes('TEST_ผู้สมัคร026') && !content.includes('TEST_ผู้สมัคร001,'), 'next moves to the next 25 preview rows');
  dispatch('change',{dataset:{pageInput:'exam-import-preview'},value:'7'});
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('หน้า 7 จาก 12') && content.includes('TEST_ผู้สมัคร151'), 'typing a page number jumps directly to that preview page');
  action('page-last',{pageKey:'exam-import-preview'});
  content = document.getElementById('page-content').innerHTML;
  assert.ok(content.includes('หน้า 12 จาก 12') && content.includes('TEST_ผู้สมัคร276'), 'last-page control reaches the final preview row');
  action('page-prev',{pageKey:'exam-import-preview'});
  assert.ok(document.getElementById('page-content').innerHTML.includes('หน้า 11 จาก 12'), 'previous control moves one page back');
  dispatch('change',{dataset:{pageInput:'exam-import-preview'},value:'1'});
  assert.ok(document.getElementById('page-content').innerHTML.includes('หน้า 1 จาก 12'), 'typing page 1 returns to the first preview page');

  const examFormExamples = [
    ['TEST_FORM_NAKTHAM_TRI','TEST_บรรพชิต','TEST_นักธรรมตรี','นักธรรมชั้นตรี · ศ.1'],
    ['TEST_FORM_NAKTHAM_UPPER','TEST_บรรพชิต','TEST_นักธรรมชั้นโท','นักธรรมชั้นโท–เอก · ศ.2'],
    ['TEST_FORM_DHAMMA_TRI','TEST_คฤหัสถ์','TEST_ธรรมศึกษาตรี','ธรรมศึกษาชั้นตรี · ศ.5'],
    ['TEST_FORM_DHAMMA_UPPER','TEST_นักเรียน','TEST_ธรรมศึกษาชั้นเอก','ธรรมศึกษาชั้นโท–เอก · ศ.6']
  ];
  for (const [formKey,applicantType,level,profileLabel] of examFormExamples) {
    dispatch('change',{id:'exam-form-type',value:formKey});
    const csv='ชื่อผู้สมัคร,ประเภทผู้สมัคร,ชั้น,หน่วยงาน,รหัสรอบสอบ\nTEST_ผู้สมัครตรวจแบบ,PLACEHOLDER,PLACEHOLDER,TEST_สำนักเรียน,TEST_SESSION_001'.replace('PLACEHOLDER',applicantType).replace('PLACEHOLDER',level);
    dispatch('change',{id:'excel-file',files:[{name:`${formKey}.csv`,size:csv.length,text:async()=>csv}]});
    await new Promise(resolve=>setTimeout(resolve,25));
    content=document.getElementById('page-content').innerHTML;
    const importButton=content.match(/<button[^>]*data-action="commit-import"[^>]*>/)?.[0] || '';
    assert.ok(content.includes(profileLabel) && content.includes('0 ข้อผิดพลาด') && !importButton.includes('disabled'),`System 09 accepts matching form profile ${formKey}`);
  }

  nav('access-control');
  let access = document.getElementById('page-content').innerHTML;
  for (const item of ['TEST_ผู้ดูแลระบบสูงสุด','จัดการสิทธิ์','TEST_ภาค','TEST_จังหวัด','TEST_สนามสอบ','maker-checker']) assert.ok(access.includes(item), `admin page includes ${item}`);
  dispatch('change', { id:'access-user', value:'TEST_USER_001' });
  dispatch('change', { id:'access-role', value:'TEST_ผู้ตรวจสอบ' });
  dispatch('change', { id:'access-scope', value:'TEST_ภาค' });
  dispatch('change', { id:'access-scope-value', value:'TEST_ภาค_1' });
  dispatch('change', { dataset:{accessPermission:'export'}, checked:true });
  action('save-access');
  access = document.getElementById('page-content').innerHTML;
  assert.ok(access.includes('TEST_ภาค_1') && access.includes('TEST_ผู้ตรวจสอบ') && access.includes('ส่งออก'), 'admin can assign a TEST_ role, scope, and action permission');

  nav('data-tools');
  dispatch('change',{id:'data-module-select',value:'people'});
  action('export-xlsx', {module:'people'});
  const exported = capturedBlobs.at(-1);
  const exportedBytes = await exported.arrayBuffer();
  assert.equal(new Uint8Array(exportedBytes)[0], 0x50, 'Excel export is an XLSX ZIP workbook');
  assert.equal(new Uint8Array(exportedBytes)[1], 0x4b, 'Excel export contains ZIP signature');
  const exportedXml = await exported.text();
  assert.ok(exportedXml.includes('ภาค') && exportedXml.includes('ตำแหน่งทางการปกครอง') && exportedXml.includes('ตำแหน่ง จศป. ฝ่ายการศึกษา (หลายตำแหน่งคั่นด้วย |)') && exportedXml.includes('TEST_ครูบาลี | TEST_อาจารย์ใหญ่สำนักเรียน') && !exportedXml.includes('TEST_PHONE_001') && !exportedXml.includes('TEST_EMAIL_001'), 'XLSX exports distinct position columns and multi-role values without restricted personal contacts');
  const exportedXlsx = { name:'TEST_people_export.xlsx', size:exported.size, arrayBuffer:async()=>exportedBytes };
  dispatch('change', { id:'data-excel-file', files:[exportedXlsx] });
  await new Promise(resolve=>setTimeout(resolve,40));
  let dataTools = document.getElementById('page-content').innerHTML;
  assert.ok(dataTools.includes('เขียนทับ 4') && dataTools.includes('Preview') && dataTools.includes('ตำแหน่งทางการปกครอง') && dataTools.includes('ตำแหน่ง จศป. ฝ่ายการศึกษา') && dataTools.includes('TEST_ครูบาลี | TEST_อาจารย์ใหญ่สำนักเรียน') && dataTools.includes('ตรวจสอบตำแหน่ง'), 'XLSX round-trip preserves separate governance and multi-role education fields and shows warnings');
  action('commit-data-import');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ต้องการเขียนทับ'), 'overwriting an existing row asks for confirmation');
  action('close-modal');
  assert.equal((nav('people').match(/<tr data-row=/g) || []).length,4, 'cancel keeps existing rows unchanged');

  for (const moduleId of ['organizations','pali','requests','admissions','budget','assets','correspondence']) {
    nav('data-tools');
    dispatch('change',{id:'data-module-select',value:moduleId});
    action('export-xlsx',{module:moduleId});
    const workbook = capturedBlobs.at(-1);
    const workbookBytes = await workbook.arrayBuffer();
    dispatch('change',{id:'data-excel-file',files:[{name:`TEST_${moduleId}.xlsx`,size:workbook.size,arrayBuffer:async()=>workbookBytes}]});
    await waitFor(() => document.getElementById('page-content').innerHTML.includes(`Preview · TEST_${moduleId}.xlsx`), `${moduleId} XLSX preview`);
    const importPreview = document.getElementById('page-content').innerHTML;
    assert.ok(importPreview.includes('0 ข้อผิดพลาด'), `${moduleId} XLSX export can be imported and validated`);
    if (moduleId === 'organizations') {
      for (const field of ['ตำแหน่งประธานสนามสอบ','ที่อยู่ประธานสนามสอบ','โทรศัพท์ประธานสนามสอบ','อีเมลประธานสนามสอบ','LINE ID ประธานสนามสอบ','ตำแหน่งผู้รับข้อสอบ','ที่อยู่ผู้รับข้อสอบ','โทรศัพท์ผู้รับข้อสอบ','อีเมลผู้รับข้อสอบ','LINE ID ผู้รับข้อสอบ','TEST_สนามสอบนักธรรมชั้นตรี','TEST_สนามสอบนักธรรมชั้นโท-เอก','TEST_ที่อยู่ประธาน_007','TEST_ที่อยู่ผู้รับข้อสอบ_007','TEST_PHONE_CHAIR_007']) assert.ok(importPreview.includes(field), `System 2 Excel preview includes ${field}`);
    }
  }

  nav('data-tools');
  dispatch('change',{id:'data-module-select',value:'pali'});
  const courseHeaders = ['รหัสชุด','ประเภทหลักสูตร','สายหลักสูตร','ชั้น/ระดับ','วิชา','บทเรียน','คลังข้อสอบ','rubric'];
  const invalidCourseRow = ['TEST_COURSE_BAD_PAIR','TEST_บาลี','pali','นักธรรมชั้นตรี','บาลีไวยากรณ์','TO VERIFY','ยังไม่มีชุดที่รับรอง','รอยืนยัน'];
  const invalidCourseCsv = `${courseHeaders.join(',')}\n${invalidCourseRow.join(',')}`;
  dispatch('change',{id:'data-excel-file',files:[{name:'TEST_course_invalid_pair.csv',size:invalidCourseCsv.length,text:async()=>invalidCourseCsv}]});
  await new Promise(resolve=>setTimeout(resolve,25));
  const invalidCoursePreview = document.getElementById('page-content').innerHTML;
  assert.ok(invalidCoursePreview.includes('ประเภทคลัง สายหลักสูตร ชั้น/ระดับ และวิชาไม่ตรงกับรายการที่กำหนด') && invalidCoursePreview.includes('disabled'), 'System 3 course import blocks mismatched domain/track/level/subject combinations');

  nav('data-tools');
  dispatch('change',{id:'data-module-select',value:'organizations'});
  const orgHeaders = ['รหัสระเบียน','ชื่อหน่วยงาน/สนามสอบ','ประเภทหน่วยงาน','พื้นที่/สังกัด','ที่อยู่','ตำบล','อำเภอ','จังหวัด','รหัสไปรษณีย์','ประเภทสอบ','รหัสรอบสอบ','ชื่อรอบสอบ','ชื่อประธานสนามสอบ','ตำแหน่งประธานสนามสอบ','ที่อยู่ประธานสนามสอบ','โทรศัพท์ประธานสนามสอบ','อีเมลประธานสนามสอบ','LINE ID ประธานสนามสอบ','ชื่อผู้รับข้อสอบ','ตำแหน่งผู้รับข้อสอบ','ที่อยู่ผู้รับข้อสอบ','โทรศัพท์ผู้รับข้อสอบ','อีเมลผู้รับข้อสอบ','LINE ID ผู้รับข้อสอบ','สถานะจำลอง'];
  const incompleteExamSite = {'รหัสระเบียน':'TEST_EXAM_SITE_INCOMPLETE_001','ชื่อหน่วยงาน/สนามสอบ':'TEST_สนามสอบที่ข้อมูลยังไม่ครบ','ประเภทหน่วยงาน':'TEST_สนามสอบบาลี','พื้นที่/สังกัด':'TEST_จังหวัดตัวอย่าง','ที่อยู่':'TEST_ที่อยู่สนามสอบ','ตำบล':'TEST_ตำบล','อำเภอ':'TEST_อำเภอ','จังหวัด':'TEST_จังหวัด','รหัสไปรษณีย์':'TEST_รหัสไปรษณีย์','ประเภทสอบ':'TEST_บาลี','สถานะจำลอง':'TEST_รอตรวจ'};
  const incompleteOrgCsv = `${orgHeaders.join(',')}\n${orgHeaders.map(header=>incompleteExamSite[header] || '').join(',')}`;
  dispatch('change',{id:'data-excel-file',files:[{name:'TEST_exam_site_incomplete.csv',size:incompleteOrgCsv.length,text:async()=>incompleteOrgCsv}]});
  await new Promise(resolve=>setTimeout(resolve,25));
  const incompleteOrgPreview = document.getElementById('page-content').innerHTML;
  assert.ok(incompleteOrgPreview.includes('ขาดรหัสรอบสอบสำหรับสนามสอบ') && incompleteOrgPreview.includes('ขาดชื่อประธานสนามสอบสำหรับสนามสอบ') && incompleteOrgPreview.includes('disabled'), 'System 2 import blocks an exam-site row missing its session and responsible contacts');

  nav('data-tools');
  dispatch('change',{id:'data-module-select',value:'people'});
  const peopleHeaders = 'รหัสระเบียน,ชื่อบุคคล,ประเภทบุคคล,ตำแหน่งทางการปกครอง,ตำแหน่ง จศป. ฝ่ายการศึกษา (หลายตำแหน่งคั่นด้วย |),แท่ง/แผนก,หน่วยงาน,สังกัดวัด,ตำบล,อำเภอ,จังหวัด,ภาค,เขตหน/พื้นที่,สถานะจำลอง';
  const personRow = 'TEST_PERSON_999,TEST_บุคคลใหม่,TEST_บรรพชิต,,TEST_ครูบาลี | TEST_อาจารย์ใหญ่สำนักเรียน,TEST_บาลี,TEST_สำนักเรียนตัวอย่าง,TEST_วัดทดสอบ,TEST_ตำบลทดสอบ,TEST_อำเภอทดสอบ,TEST_จังหวัดทดสอบ,TEST_ภาค_1,TEST_พื้นที่,TEST_รอตรวจ';
  const addCsv = `${peopleHeaders}\n${personRow}`;
  dispatch('change', { id:'data-excel-file', files:[{name:'TEST_people_add.csv',size:addCsv.length,text:async()=>addCsv}] });
  await new Promise(resolve=>setTimeout(resolve,30));
  dataTools = document.getElementById('page-content').innerHTML;
  assert.ok(dataTools.includes('เพิ่ม 1') && dataTools.includes('เขียนทับ 0') && dataTools.includes('พบตำแหน่งฝ่ายการศึกษาหลายตำแหน่ง'), 'new rows are counted and multiple education roles display a review warning');
  action('commit-data-import');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ยืนยันเพิ่มข้อมูล'), 'adding new rows asks for confirmation');
  action('modal-confirm');
  const importedPeople = nav('people');
  assert.equal((importedPeople.match(/<tr data-row=/g) || []).length,5, 'confirmed import appends a new TEST_ row in memory');

  nav('data-tools');
  dispatch('change',{id:'data-module-select',value:'people'});
  const noPositionRow = 'TEST_PERSON_NO_POSITION,TEST_บุคคลไม่มีตำแหน่ง,TEST_บรรพชิต,,,TEST_บาลี,TEST_สำนักเรียนตัวอย่าง,TEST_วัดทดสอบ,TEST_ตำบลทดสอบ,TEST_อำเภอทดสอบ,TEST_จังหวัดทดสอบ,TEST_ภาค_1,TEST_พื้นที่,TEST_รอตรวจ';
  const noPositionCsv = `${peopleHeaders}\n${noPositionRow}`;
  dispatch('change',{id:'data-excel-file',files:[{name:'TEST_people_no_position.csv',size:noPositionCsv.length,text:async()=>noPositionCsv}]});
  await new Promise(resolve=>setTimeout(resolve,25));
  assert.ok(document.getElementById('page-content').innerHTML.includes('ต้องระบุตำแหน่งทางการปกครองหรือตำแหน่งฝ่ายการศึกษา') && document.getElementById('page-content').innerHTML.includes('disabled'), 'people import requires at least one position group');
  const repeatedPositionRow = 'TEST_PERSON_REPEATED_ROLE,TEST_บุคคลตำแหน่งซ้ำ,TEST_บรรพชิต,,TEST_ครูบาลี | TEST_ครูบาลี,TEST_บาลี,TEST_สำนักเรียนตัวอย่าง,TEST_วัดทดสอบ,TEST_ตำบลทดสอบ,TEST_อำเภอทดสอบ,TEST_จังหวัดทดสอบ,TEST_ภาค_1,TEST_พื้นที่,TEST_รอตรวจ';
  const repeatedPositionCsv = `${peopleHeaders}\n${repeatedPositionRow}`;
  dispatch('change',{id:'data-excel-file',files:[{name:'TEST_people_repeated_role.csv',size:repeatedPositionCsv.length,text:async()=>repeatedPositionCsv}]});
  await new Promise(resolve=>setTimeout(resolve,25));
  assert.ok(document.getElementById('page-content').innerHTML.includes('พบตำแหน่งฝ่ายการศึกษาซ้ำในแถวเดียวกัน') && document.getElementById('page-content').innerHTML.includes('disabled'), 'people import blocks repeated duplicate role values within one row');

  nav('data-tools');
  dispatch('change',{id:'data-module-select',value:'people'});
  const bulkPeopleRows = Array.from({length:276}, (_,index) => {
    const n = String(index+1).padStart(3,'0');
    return `TEST_PERSON_BULK_${n},TEST_บุคคลจำลอง_${n},TEST_บรรพชิต,,TEST_ครูบาลี,TEST_บาลี,TEST_สำนักเรียนตัวอย่าง,TEST_วัดทดสอบ,TEST_ตำบลทดสอบ,TEST_อำเภอทดสอบ,TEST_จังหวัดทดสอบ,TEST_ภาค_1,TEST_พื้นที่,TEST_รอตรวจ`;
  });
  const bulkPeopleCsv = `${peopleHeaders}\n${bulkPeopleRows.join('\n')}`;
  dispatch('change',{id:'data-excel-file',files:[{name:'TEST_people_bulk.csv',size:bulkPeopleCsv.length,text:async()=>bulkPeopleCsv}]});
  await new Promise(resolve=>setTimeout(resolve,40));
  dataTools = document.getElementById('page-content').innerHTML;
  assert.ok(dataTools.includes('หน้า 1 จาก 12') && dataTools.includes('data-pagination="data-import-preview"'), 'shared Excel preview paginates 276 rows into 12 pages');
  dispatch('change',{dataset:{pageInput:'data-import-preview'},value:'6'});
  dataTools = document.getElementById('page-content').innerHTML;
  assert.ok(dataTools.includes('หน้า 6 จาก 12') && dataTools.includes('TEST_PERSON_BULK_126'), 'shared Excel preview accepts a direct page jump');
  action('commit-data-import');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('ยืนยันเพิ่มข้อมูล'), 'bulk TEST_ rows require confirmation before append');
  action('modal-confirm');
  let largePeople = nav('people');
  assert.ok(largePeople.includes('หน้า 1 จาก 12') && largePeople.includes('data-pagination="people"'), 'System 1 list paginates after many records are added');
  let peopleBody = largePeople.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] || '';
  assert.equal((peopleBody.match(/<tr\b/g)||[]).length,25,'System 1 list renders no more than 25 records per page');
  action('page-next',{pageKey:'people'});
  largePeople = document.getElementById('page-content').innerHTML;
  assert.ok(largePeople.includes('หน้า 2 จาก 12') && largePeople.includes('TEST_PERSON_BULK_021'), 'System 1 next-page control advances across imported records');
  dispatch('change',{dataset:{pageInput:'people'},value:'7'});
  largePeople = document.getElementById('page-content').innerHTML;
  assert.ok(largePeople.includes('หน้า 7 จาก 12') && largePeople.includes('TEST_PERSON_BULK_146'), 'System 1 accepts a direct page jump');
  action('page-last',{pageKey:'people'});
  largePeople = document.getElementById('page-content').innerHTML;
  assert.ok(largePeople.includes('หน้า 12 จาก 12') && largePeople.includes('TEST_PERSON_BULK_276'), 'System 1 last-page control reaches final records');
  action('page-prev',{pageKey:'people'});
  assert.ok(document.getElementById('page-content').innerHTML.includes('หน้า 11 จาก 12'),'System 1 previous-page control works');
  dispatch('change',{dataset:{pageInput:'people'},value:'1'});
  largePeople = document.getElementById('page-content').innerHTML;
  assert.ok(largePeople.includes('หน้า 1 จาก 12'),'System 1 first-page jump works');
  dispatch('input',{id:'',value:'TEST_PERSON_BULK_150',selectionStart:18,classList:{contains:className=>className==='module-search'}});
  largePeople = document.getElementById('page-content').innerHTML;
  assert.ok(largePeople.includes('หน้า 1 จาก 1') && largePeople.includes('TEST_PERSON_BULK_150') && !largePeople.includes('TEST_PERSON_BULK_149'), 'list search filters all records and resets pagination');
  dispatch('input',{id:'',value:'',selectionStart:0,classList:{contains:className=>className==='module-search'}});

  action('logout');
  assert.ok(document.getElementById('modal-root').innerHTML.includes('เฉพาะข้อมูล TEST_'), 'closing the demo is distinct from platform sign-out');
  action('close-modal');
  assert.ok(document.getElementById('page-content').innerHTML.includes('TEST_PERSON_999'), 'canceling logout keeps the current demo session');
  action('logout');
  action('modal-confirm');
  assert.ok(document.getElementById('page-content').innerHTML.includes('ออกจากโหมดตัวอย่างแล้ว'), 'logout exits the TEST_ demo');
  action('enter-demo');
  assert.ok(document.getElementById('page-content').innerHTML.includes('ภาพรวมระบบงาน'), 'demo can be re-entered after logout');

  console.log('PASS: navigation/role flows; Systems 1–4; System 05 registration/results and downloads; System 06 budget lifecycle and exact-satang guards; System 07 movement-derived stock, purchasing, receipt/issue/return/transfer/loan/maintenance/count/disposal, Excel master-only import and Stock card export; System 08; System 09 form routing/import; CSV/XLSX roundtrip, overwrite confirmation and TEST_-only behavior');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

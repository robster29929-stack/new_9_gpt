/* Sangha Portal TEST workflows. Hosted persistence is provided by cloud.js and Supabase RLS. */
(() => {
  'use strict';

  const NAV = [
    { id: 'home', label: 'ภาพรวม', icon: '⌂', group: 'WORKSPACE' },
    { id: 'people', label: 'ทะเบียนบุคคล', icon: '♙', number: '01' },
    { id: 'organizations', label: 'หน่วยงานและสนามสอบ', icon: '⌖', number: '02' },
    { id: 'pali', label: 'คลังเรียนและข้อสอบ', icon: '▤', number: '03' },
    { id: 'requests', label: 'คำขอและสถานะ', icon: '◷', number: '04' },
    { id: 'admissions', label: 'ทะเบียนสมัครและผลสอบ', icon: '▧', number: '05' },
    { id: 'budget', label: 'งบประมาณ', icon: '◈', number: '06' },
    { id: 'assets', label: 'พัสดุและครุภัณฑ์', icon: '▣', number: '07' },
    { id: 'correspondence', label: 'สารบรรณออนไลน์', icon: '✉', number: '08' },
    { id: 'exam-import', label: 'สมัครนักธรรม/ธรรมศึกษา', icon: '⇧', number: '09' },
    { id: 'access-control', label: 'ผู้ใช้ บทบาท และสิทธิ์', icon: '♙', group: 'ADMINISTRATION', system: false },
    { id: 'data-tools', label: 'นำเข้า/ส่งออก Excel', icon: '⇅', system: false }
  ];

  const FORM_DOWNLOADS = {
    pali: [
      { label: 'บาลี · ศ.2 ส่วนกลาง', detail: 'แบบใหม่ · 1 ชีต · ศ.2_So_2_ส่วนกลาง · 32 × 26', asset: 'ฟอร์มบัญชี_ศ_2_ส่วนกลาง(แบบใหม่).xlsx', downloadName: 'ฟอร์มบัญชี ศ.2 ส่วนกลาง (แบบใหม่).xlsx' },
      { label: 'บาลี · ศ.2 และ ศ.3 ส่วนภูมิภาค', detail: 'แบบใหม่ · 2 ชีต · ศ.2 32 × 26 และ ศ.3 55 × 22', asset: 'ฟอร์มบัญชี_ศ_2_3_ส่วนภูมิภาค(แบบใหม่).xlsx', downloadName: 'ฟอร์มบัญชี ศ.2-3 ส่วนภูมิภาค (แบบใหม่).xlsx' }
    ],
    dhamma: [
      { label: 'นักธรรมชั้นตรี · ศ.1', detail: 'บรรพชิต · ปี 2568-v3 · .xls', sourceOnly: true, asset: 'สำหรับพระภิกษุ-สามเณร-ศ.๑-นักธรรมชั้นตรี_2568-v3.xls', downloadName: 'สำหรับพระภิกษุ-สามเณร-ศ.๑-นักธรรมชั้นตรี_2568-v3.xls' },
      { label: 'นักธรรมชั้นโท · ศ.2', detail: 'บรรพชิต · ปี 2568-v3 · .xls', sourceOnly: true, asset: 'สำหรับพระภิกษุ-สามเณร-ศ.๒-นักธรรมชั้นโท_2568-v3.xls', downloadName: 'สำหรับพระภิกษุ-สามเณร-ศ.๒-นักธรรมชั้นโท_2568-v3.xls' },
      { label: 'นักธรรมชั้นเอก · ศ.2', detail: 'บรรพชิต · ปี 2568-v3 · .xls', sourceOnly: true, asset: 'สำหรับพระภิกษุ-สามเณร-ศ.๒-นักธรรมชั้นเอก_2568-v3.xls', downloadName: 'สำหรับพระภิกษุ-สามเณร-ศ.๒-นักธรรมชั้นเอก_2568-v3.xls' },
      { label: 'ธรรมศึกษาชั้นตรี · ศ.5', detail: 'นักเรียน/นักศึกษา/ฆราวาส · ปี 2568-v3 · .xls', asset: 'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๕-ธรรมศึกษาชั้นตรี_2568-v3.xls', downloadName: 'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๕-ธรรมศึกษาชั้นตรี_2568-v3.xls' },
      { label: 'ธรรมศึกษาชั้นโท · ศ.6', detail: 'นักเรียน/นักศึกษา/ฆราวาส · ปี 2568-v3 · .xls', asset: 'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๖-ธรรมศึกษาชั้นโท_2568-v3.xls', downloadName: 'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๖-ธรรมศึกษาชั้นโท_2568-v3.xls' },
      { label: 'ธรรมศึกษาชั้นเอก · ศ.6', detail: 'นักเรียน/นักศึกษา/ฆราวาส · ปี 2568-v3 · .xls', asset: 'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๖-ธรรมศึกษาชั้นเอก_2568-v3.xls', downloadName: 'สำหรับนักเรียน-นักศึกษา-ฆราวาส-ศ.๖-ธรรมศึกษาชั้นเอก_2568-v3.xls' }
    ]
  };

  const PALI_COURSES = [
    ['ป.1–2', 'บาลีไวยากรณ์'], ['ป.1–2', 'แปลมคธเป็นไทย'],
    ['ป.ธ.3', 'บาลีไวยากรณ์'], ['ป.ธ.3', 'บุรพภาค'], ['ป.ธ.3', 'แปลมคธเป็นไทย'], ['ป.ธ.3', 'สัมพันธ์ไทย'],
    ['ป.ธ.4', 'แปลไทยเป็นมคธ'], ['ป.ธ.4', 'แปลมคธเป็นไทย'],
    ['ป.ธ.5', 'แปลไทยเป็นมคธ'], ['ป.ธ.5', 'แปลมคธเป็นไทย'],
    ['ป.ธ.6', 'แปลไทยเป็นมคธ'], ['ป.ธ.6', 'แปลมคธเป็นไทย'],
    ['ป.ธ.7', 'แปลไทยเป็นมคธ'], ['ป.ธ.7', 'แปลมคธเป็นไทย'],
    ['ป.ธ.8', 'แต่งฉันท์ภาษามคธ'], ['ป.ธ.8', 'แปลไทยเป็นมคธ'], ['ป.ธ.8', 'แปลมคธเป็นไทย'],
    ['ป.ธ.9', 'แต่งไทยเป็นมคธ'], ['ป.ธ.9', 'แปลไทยเป็นมคธ'], ['ป.ธ.9', 'แปลมคธเป็นไทย']
  ].map(([level, subject], i) => ({
    id: `TEST_COURSE_PALI_${String(i + 1).padStart(2, '0')}`,
    track: 'pali',
    domain: 'TEST_บาลี',
    level,
    subject,
    lessons: 'TO VERIFY',
    questionBank: 'ยังไม่มีชุดที่รับรอง',
    rubric: 'รอยืนยัน'
  }));

  const NAKTHAM_COURSES = ['นักธรรมชั้นตรี', 'นักธรรมชั้นโท', 'นักธรรมชั้นเอก']
    .flatMap((level, levelIndex) => ['เรียงความแก้กระทู้ธรรม', 'ธรรมวิภาค', 'พุทธประวัติ', 'วินัยมุข'].map((subject, subjectIndex) => ({
      id: `TEST_COURSE_NAKTHAM_${levelIndex + 1}_${subjectIndex + 1}`,
      track: 'naktham', domain: 'TEST_นักธรรม', level, subject,
      lessons: 'TO VERIFY', questionBank: 'ยังไม่มีชุดที่รับรอง', rubric: 'รอยืนยัน'
    })));
  const DHAMMA_STUDY_TIERS = [
    { key: 'tri', label: 'ชั้นตรี', subjects: ['เรียงความแก้กระทู้ธรรม', 'ธรรม', 'พุทธประวัติ', 'วินัย (เบญจศีล-เบญจธรรม)'] },
    { key: 'tho', label: 'ชั้นโท', subjects: ['เรียงความแก้กระทู้ธรรม', 'ธรรม', 'พุทธานุพุทธประวัติ', 'วินัย (อุโบสถศีล)'] },
    { key: 'ek', label: 'ชั้นเอก', subjects: ['เรียงความแก้กระทู้ธรรม', 'ธรรม', 'พุทธานุพุทธประวัติ', 'วินัย (กรรมบถ)'] }
  ];
  const DHAMMA_EDUCATION_BANDS = [
    { key: 'primary', label: 'ประถมศึกษา' }, { key: 'secondary', label: 'มัธยมศึกษา' }, { key: 'higher', label: 'อุดมศึกษา' }
  ];
  const DHAMMA_STUDY_LEVELS = DHAMMA_STUDY_TIERS.flatMap(tier => DHAMMA_EDUCATION_BANDS.map(band => ({
    key: `${tier.key}_${band.key}`,
    tier: tier.key,
    band: band.key,
    label: `ธรรมศึกษา${tier.label} · ระดับ${band.label}`,
    subjects: tier.subjects
  })));
  const DHAMMA_STUDIES_COURSES = DHAMMA_STUDY_LEVELS.flatMap((level, levelIndex) =>
    level.subjects.map((subject, subjectIndex) => ({
      id: `TEST_COURSE_DHAMMA_${levelIndex + 1}_${subjectIndex + 1}`,
      track: 'dhamma-studies', domain: 'TEST_ธรรมศึกษา', level: level.label,
      levelKey: level.key, tier: level.tier, educationBand: level.band, subject,
      lessons: 'TO VERIFY', questionBank: 'ยังไม่มีชุดที่รับรอง', rubric: 'รอยืนยัน'
    })));
  const DHAMMA_COURSES = [...NAKTHAM_COURSES, ...DHAMMA_STUDIES_COURSES];

  const COURSES = [...DHAMMA_COURSES, ...PALI_COURSES];
  const COURSE_TAXONOMY_KEYS = new Set(COURSES.map(item => [item.track, item.domain, item.level, item.subject].join('|')));
  const COURSE_TRACKS = {
    naktham: { label: 'นักธรรม', description: 'ชั้นตรี · โท · เอก', levels: ['นักธรรมชั้นตรี', 'นักธรรมชั้นโท', 'นักธรรมชั้นเอก'] },
    'dhamma-studies': { label: 'ธรรมศึกษา', description: 'ตรี · โท · เอก × ประถม · มัธยม · อุดม', levels: DHAMMA_STUDY_LEVELS.map(item => item.label) },
    pali: { label: 'บาลี', description: 'ประโยค 1–2 ถึง ป.ธ.9', levels: ['ป.1–2', 'ป.ธ.3', 'ป.ธ.4', 'ป.ธ.5', 'ป.ธ.6', 'ป.ธ.7', 'ป.ธ.8', 'ป.ธ.9'] }
  };

  const GOVERNANCE_POSITION_OPTIONS = [
    'TEST_เลขานุการเจ้าคณะตำบล', 'TEST_เจ้าคณะตำบล',
    'TEST_เลขานุการเจ้าคณะอำเภอ', 'TEST_เจ้าคณะอำเภอ',
    'TEST_เลขานุการรองเจ้าคณะจังหวัด', 'TEST_รองเจ้าคณะจังหวัด',
    'TEST_เลขานุการเจ้าคณะจังหวัด', 'TEST_เจ้าคณะจังหวัด',
    'TEST_เลขานุการรองเจ้าคณะภาค', 'TEST_รองเจ้าคณะภาค',
    'TEST_เลขานุการเจ้าคณะภาค', 'TEST_เจ้าคณะภาค'
  ];
  const EDUCATION_POSITION_OPTIONS = [
    'TEST_ครูธรรม', 'TEST_ครูบาลี', 'TEST_พระปริยัตินิเทศก์', 'TEST_ผู้อำนวยการโรงเรียนปริยัติสามัญ',
    'TEST_เลขานุการเจ้าสำนักเรียน', 'TEST_รองอาจารย์ใหญ่สำนักเรียน', 'TEST_อาจารย์ใหญ่สำนักเรียน', 'TEST_เจ้าสำนักเรียน',
    'TEST_เลขานุการเจ้าสำนักศาสนศึกษา', 'TEST_รองอาจารย์ใหญ่สำนักศาสนศึกษา', 'TEST_อาจารย์ใหญ่สำนักศาสนศึกษา', 'TEST_เจ้าสำนักศาสนศึกษา'
  ];

  const PEOPLE_SECTIONS = ['TEST_ธรรม', 'TEST_บาลี', 'TEST_สามัญ', 'TEST_ปริยัตินิเทศก์', 'TEST_ไม่ระบุ'];
  const PEOPLE_REGION_OPTIONS = ['TEST_กลาง', 'TEST_เหนือ', 'TEST_ตะวันออก', 'TEST_ใต้', 'TEST_ธรรมยุต', 'TEST_ภาคกลาง', 'TEST_ภาคเหนือ', 'TEST_ภาคตะวันออก', 'TEST_ภาคใต้'];
  const PEOPLE_SANGHA_REGIONS = Array.from({ length: 18 }, (_, index) => ({ value: `TEST_ภาค_${index + 1}`, label: `ภาค ${index + 1}` }));
  const PEOPLE_STATUS_TYPES = [
    { value: 'TEST_ขอย้าย', label: 'ขอย้าย' },
    { value: 'TEST_ลาออก', label: 'ลาออก' },
    { value: 'TEST_มรณภาพ-ตาย', label: 'มรณภาพ/ตาย' },
    { value: 'TEST_ลาสิกขา', label: 'ลาสิกขา' }
  ];
  const ORG_TYPE_OPTIONS = ['TEST_สำนักเรียน','TEST_สำนักศาสนศึกษา','TEST_สำนักเรียนบาลีประจำจังหวัด','TEST_วัด','TEST_องค์กร','TEST_สถานศึกษา','TEST_สนามสอบบาลี','TEST_สนามสอบนักธรรมชั้นตรี','TEST_สนามสอบนักธรรมชั้นโท-เอก','TEST_สนามสอบธรรมศึกษา'];
  const ORG_EXAM_TYPE_OPTIONS = ['TEST_บาลี','TEST_นักธรรมชั้นตรี','TEST_นักธรรมชั้นโท-เอก','TEST_ธรรมศึกษา'];
  const REQUEST_TYPE_OPTIONS = [
    'TEST_จัดตั้งสำนักเรียน','TEST_จัดตั้งสำนักศาสนศึกษา','TEST_ยุบสำนักเรียน','TEST_ยุบสำนักศาสนศึกษา',
    'TEST_เปิดสนามสอบนักธรรมชั้นตรี','TEST_เปิดสนามสอบนักธรรมชั้นโท-เอก','TEST_เปิดสนามสอบธรรมศึกษา',
    'TEST_ปิดสนามสอบนักธรรมชั้นตรี','TEST_ปิดสนามสอบนักธรรมชั้นโท-เอก','TEST_ปิดสนามสอบธรรมศึกษา',
    'TEST_ย้ายสนามสอบนักธรรมชั้นตรี','TEST_ย้ายสนามสอบนักธรรมชั้นโท-เอก','TEST_ย้ายสนามสอบธรรมศึกษา'
  ];
  const REQUEST_CATEGORY_OPTIONS = ['TEST_สำนักเรียน/สำนักศาสนศึกษา','TEST_สนามสอบ'];
  const REQUEST_PROVINCE_OPTIONS = ['TEST_จังหวัดตัวอย่าง_001','TEST_จังหวัดตัวอย่าง_002','TEST_จังหวัดตัวอย่าง_003'];
  const REQUEST_STATUS_OPTIONS = ['TEST_ร่างคำขอจำลอง','TEST_รับข้อมูลจำลอง','TEST_ตรวจความครบถ้วนจำลอง','TEST_รอข้อมูลเพิ่มเติมจำลอง','TEST_อยู่ระหว่างดำเนินการจำลอง'];
  const TEST_ORGANIZATION_ROWS = [
    { id:'TEST_ORG_001', name:'TEST_สำนักเรียนตัวอย่าง', type:'TEST_สำนักเรียน', unit:'TEST_พื้นที่ส่วนกลาง' },
    { id:'TEST_ORG_002', name:'TEST_สำนักศาสนศึกษาตัวอย่าง', type:'TEST_สำนักศาสนศึกษา', unit:'TEST_วัดตัวอย่าง' },
    { id:'TEST_ORG_003', name:'TEST_สำนักเรียนบาลีประจำจังหวัดตัวอย่าง', type:'TEST_สำนักเรียนบาลีประจำจังหวัด', unit:'TEST_จังหวัดตัวอย่าง' },
    { id:'TEST_ORG_004', name:'TEST_วัดตัวอย่าง', type:'TEST_วัด', unit:'TEST_อำเภอตัวอย่าง' },
    { id:'TEST_ORG_005', name:'TEST_องค์กรตัวอย่าง', type:'TEST_องค์กร', unit:'TEST_พื้นที่ตัวอย่าง' },
    { id:'TEST_ORG_006', name:'TEST_สถานศึกษาตัวอย่าง', type:'TEST_สถานศึกษา', unit:'TEST_เขตพื้นที่ตัวอย่าง' },
    { id:'TEST_EXAM_SITE_PALI_001', name:'TEST_สนามสอบบาลีตัวอย่าง', type:'TEST_สนามสอบบาลี', unit:'TEST_จังหวัดตัวอย่าง', examType:'TEST_บาลี', examSessionId:'TEST_SESSION_PALI_001' },
    { id:'TEST_EXAM_SITE_NAKTHAM_TRI_001', name:'TEST_สนามสอบนักธรรมชั้นตรีตัวอย่าง', type:'TEST_สนามสอบนักธรรมชั้นตรี', unit:'TEST_จังหวัดตัวอย่าง', examType:'TEST_นักธรรมชั้นตรี', examSessionId:'TEST_SESSION_NAKTHAM_TRI_001' },
    { id:'TEST_EXAM_SITE_NAKTHAM_UPPER_001', name:'TEST_สนามสอบนักธรรมชั้นโท-เอกตัวอย่าง', type:'TEST_สนามสอบนักธรรมชั้นโท-เอก', unit:'TEST_จังหวัดตัวอย่าง', examType:'TEST_นักธรรมชั้นโท-เอก', examSessionId:'TEST_SESSION_NAKTHAM_UPPER_001' },
    { id:'TEST_EXAM_SITE_DHAMMA_001', name:'TEST_สนามสอบธรรมศึกษาตัวอย่าง', type:'TEST_สนามสอบธรรมศึกษา', unit:'TEST_จังหวัดตัวอย่าง', examType:'TEST_ธรรมศึกษา', examSessionId:'TEST_SESSION_DHAMMA_001' }
  ].map((item,index) => {
    const suffix = String(index + 1).padStart(3,'0');
    const examSite = Boolean(item.examSessionId);
    return {
      ...item,
      sub:`${item.id} · ${item.examSessionId || 'TEST_ทำเนียบหน่วยงาน'}`,
      address:`TEST_เลขที่และถนน ${suffix}`,
      subdistrict:`TEST_ตำบล_${suffix}`,
      district:`TEST_อำเภอ_${suffix}`,
      province:`TEST_จังหวัด_${suffix}`,
      postalCode:`TEST_รหัสไปรษณีย์_${suffix}`,
      examSessionLabel:examSite ? `TEST_รอบสอบตัวอย่าง_${suffix}` : '',
      chairName:examSite ? `TEST_ประธานสนาม_${suffix}` : '',
      chairTitle:examSite ? 'TEST_ประธานสนามสอบ' : '',
      chairAddress:examSite ? `TEST_ที่อยู่ประธาน_${suffix}` : '',
      chairPhone:examSite ? `TEST_PHONE_CHAIR_${suffix}` : '',
      chairEmail:examSite ? `TEST_EMAIL_CHAIR_${suffix}@example.test` : '',
      chairLineId:examSite ? `TEST_LINE_CHAIR_${suffix}` : '',
      receiverName:examSite ? `TEST_ผู้รับข้อสอบ_${suffix}` : '',
      receiverTitle:examSite ? 'TEST_ผู้รับข้อสอบประจำสนาม' : '',
      receiverAddress:examSite ? `TEST_ที่อยู่ผู้รับข้อสอบ_${suffix}` : '',
      receiverPhone:examSite ? `TEST_PHONE_RECEIVER_${suffix}` : '',
      receiverEmail:examSite ? `TEST_EMAIL_RECEIVER_${suffix}@example.test` : '',
      receiverLineId:examSite ? `TEST_LINE_RECEIVER_${suffix}` : '',
      status:examSite ? 'TEST_รอยืนยันรายรอบ' : 'TEST_รอตรวจทำเนียบ',
      tone:examSite ? 'blue' : 'amber'
    };
  });

  const MODULES = {
    people: {
      code: 'ระบบ 01', title: 'ทะเบียนบุคคล', eyebrow: 'PEOPLE & APPOINTMENTS',
      description: 'ศูนย์กลางประวัติบุคคล ตำแหน่ง และสถานะตามช่วงเวลาที่มีผล โดยเชื่อมบุคคลกับหน่วยงานร่วมกัน',
      action: 'เพิ่มข้อมูล TEST_', actionLabel: 'บันทึกร่าง',
      stats: [['รายการตัวอย่าง', '04'], ['ประเภทสถานะที่ติดตาม', '04'], ['ข้อมูลยืนยันจริง', '0']],
      columns: ['บุคคล', 'ประเภทบุคคล', 'ตำแหน่งทางการปกครอง', 'ตำแหน่ง จศป. ฝ่ายการศึกษา', 'สำนัก วัด และพื้นที่', 'สถานะ/เหตุการณ์', ''],
      rows: [
        { id: 'TEST_PERSON_001', name: 'TEST_พระสมมติ 001', sub: 'TEST_PERSON_001 · ข้อมูลสาธิต', type: 'TEST_บรรพชิต', governancePosition: 'TEST_เลขานุการเจ้าคณะตำบล', educationPositions: [], section: 'TEST_ไม่ระบุ', office: 'TEST_สำนักงานเจ้าคณะตำบลตัวอย่าง', temple: 'TEST_วัดตัวอย่าง 001', subdistrict: 'TEST_ตำบลตัวอย่าง', district: 'TEST_อำเภอตัวอย่าง', province: 'TEST_จังหวัดตัวอย่าง', sanghaRegion: 'TEST_ภาค_1', region: 'TEST_ภาคกลาง', phone: 'TEST_PHONE_001', email: 'TEST_EMAIL_001@example.test', lineId: 'TEST_LINE_001', changeType: 'TEST_ขอย้าย', changeSummary: 'TEST_ระเบียนสถานะจำลอง · ไม่มีผลพิจารณาหรือคำสั่งจริง', effectiveDate: 'TO VERIFY', recordedDate: 'TO VERIFY', evidence: 'TEST_ไม่มีหลักฐานจริง', status: 'TEST_รอตรวจเอกสาร', tone: 'amber' },
        { id: 'TEST_PERSON_002', name: 'TEST_พระสมมติ 002', sub: 'TEST_PERSON_002 · ข้อมูลสาธิต', type: 'TEST_บรรพชิต', governancePosition: 'TEST_เจ้าคณะอำเภอ', educationPositions: [], section: 'TEST_ไม่ระบุ', office: 'TEST_สำนักงานเจ้าคณะอำเภอตัวอย่าง', temple: 'TEST_วัดตัวอย่าง 002', subdistrict: 'TEST_ตำบลตัวอย่าง 002', district: 'TEST_อำเภอตัวอย่าง 002', province: 'TEST_จังหวัดตัวอย่าง', sanghaRegion: 'TEST_ภาค_2', region: 'TEST_ภาคเหนือ', phone: 'TEST_PHONE_002', email: 'TEST_EMAIL_002@example.test', lineId: 'TEST_LINE_002', changeType: 'TEST_ลาออก', changeSummary: 'TEST_ระเบียนสถานะจำลอง · ไม่มีผลพิจารณาหรือคำสั่งจริง', effectiveDate: 'TO VERIFY', recordedDate: 'TO VERIFY', evidence: 'TEST_ไม่มีหลักฐานจริง', status: 'TEST_รอยืนยันช่วงเวลามีผล', tone: 'blue' },
        { id: 'TEST_PERSON_003', name: 'TEST_คฤหัสถ์สมมติ 003', sub: 'TEST_PERSON_003 · ข้อมูลสาธิต', type: 'TEST_คฤหัสถ์', governancePosition: '', educationPositions: ['TEST_ครูบาลี','TEST_อาจารย์ใหญ่สำนักเรียน'], section: 'TEST_บาลี', office: 'TEST_สำนักเรียนตัวอย่าง', temple: 'TEST_วัดตัวอย่าง 003', subdistrict: 'TEST_ตำบลตัวอย่าง 003', district: 'TEST_อำเภอตัวอย่าง 003', province: 'TEST_จังหวัดตัวอย่าง', sanghaRegion: 'TEST_ภาค_3', region: 'TEST_ภาคตะวันออก', phone: 'TEST_PHONE_003', email: 'TEST_EMAIL_003@example.test', lineId: 'TEST_LINE_003', changeType: 'TEST_มรณภาพ-ตาย', changeSummary: 'TEST_ระเบียนสถานะจำลอง · ไม่มีผลพิจารณาหรือคำสั่งจริง', effectiveDate: 'TO VERIFY', recordedDate: 'TO VERIFY', evidence: 'TEST_ไม่มีหลักฐานจริง', status: 'TEST_ข้อมูลจำลอง', tone: '' },
        { id: 'TEST_PERSON_004', name: 'TEST_พระสมมติ 004', sub: 'TEST_PERSON_004 · ข้อมูลสาธิต', type: 'TEST_บรรพชิต', governancePosition: '', educationPositions: ['TEST_เจ้าสำนักศาสนศึกษา','TEST_เลขานุการเจ้าสำนักศาสนศึกษา'], section: 'TEST_ธรรม', office: 'TEST_สำนักศาสนศึกษาตัวอย่าง', temple: 'TEST_วัดตัวอย่าง 004', subdistrict: 'TEST_ตำบลตัวอย่าง 004', district: 'TEST_อำเภอตัวอย่าง 004', province: 'TEST_จังหวัดตัวอย่าง', sanghaRegion: 'TEST_ภาค_4', region: 'TEST_ธรรมยุต', phone: 'TEST_PHONE_004', email: 'TEST_EMAIL_004@example.test', lineId: 'TEST_LINE_004', changeType: 'TEST_ลาสิกขา', changeSummary: 'TEST_ระเบียนสถานะจำลอง · ไม่มีผลพิจารณาหรือคำสั่งจริง', effectiveDate: 'TO VERIFY', recordedDate: 'TO VERIFY', evidence: 'TEST_ไม่มีหลักฐานจริง', status: 'TEST_รอยืนยันสถานะ', tone: 'amber' }
      ],
      callout: 'ตัวอย่าง TEST_ ครอบคลุมประเภทขอย้าย ลาออก มรณภาพ/ตาย และลาสิกขา โดยไม่มีคำสั่ง ผลพิจารณา วันที่มีผล หรือหลักฐานจริง ต้องตรวจสอบแหล่งข้อมูลและนโยบายการบันทึกสถานะกับเจ้าของงานก่อนใช้งานจริง.'
    },
    organizations: {
      code: 'ระบบ 02', title: 'หน่วยงานและสนามสอบ', eyebrow: 'ORGANIZATION DIRECTORY',
      description: 'ทำเนียบสำนักเรียน สำนักศาสนศึกษา สำนักเรียนบาลีประจำจังหวัด วัด องค์กร สถานศึกษา และสนามสอบพร้อมผู้รับผิดชอบแยกตามรอบสอบ',
      action: 'เพิ่มหน่วยงาน TEST_', actionLabel: 'บันทึกร่าง',
      stats: [['ประเภทข้อมูล', '10'], ['ประเภทสนามสอบ', '04'], ['ข้อมูลจริงที่ยืนยัน', '0']],
      columns: ['หน่วยงาน / สนามสอบ', 'ประเภท', 'ที่ตั้ง', 'ประเภทสนาม / รอบสอบ', 'ประธานสนามสอบ', 'ผู้รับข้อสอบ', 'สถานะ', ''],
      rows: TEST_ORGANIZATION_ROWS,
      callout: 'ชื่อและที่อยู่แสดงตัวอย่าง TEST_ เท่านั้น ช่องทางติดต่อและที่อยู่ของประธาน/ผู้รับข้อสอบเป็นข้อมูลจำกัดสิทธิ์ ส่วนผู้รับข้อสอบต้องผูกกับรอบสอบ (ExamSession); ระเบียนจริงและสิทธิ์เผยแพร่ยังรอยืนยันจากเจ้าของข้อมูล.'
    },
    requests: {
      code: 'ระบบ 04', title: 'คำขอและสถานะ', eyebrow: 'REQUEST TRACKING',
      description: 'ค้นหาและติดตามคำขอจัดตั้ง/ยุบสำนักเรียนหรือสำนักศาสนศึกษา และคำขอเปิด/ปิด/ย้ายสนามสอบนักธรรม–ธรรมศึกษาตามพื้นที่',
      action: 'สร้างคำขอ TEST_', actionLabel: 'บันทึกร่าง',
      stats: [['คำขอตัวอย่าง', '09'], ['หมวดคำขอ', '02'], ['ผลพิจารณาจริง', '0']],
      columns: ['เลขอ้างอิง', 'ประเภทคำขอ', 'หมวด', 'หน่วยงาน/สนามที่เกี่ยวข้อง', 'จังหวัด', 'สถานะจำลอง', ''],
      rows: [
        { id:'TEST_REQ_001', name:'TEST_REQ_001', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_จัดตั้งสำนักเรียน', category:'TEST_สำนักเรียน/สำนักศาสนศึกษา', target:'TEST_สำนักเรียนตัวอย่าง 001', unit:'TEST_หน่วยงานผู้ยื่น 001', province:'TEST_จังหวัดตัวอย่าง_001', status:'TEST_ตรวจความครบถ้วนจำลอง', currentStep:'TEST_ขั้นจำลอง 2', timeline:['TEST_รับข้อมูลจำลอง','TEST_ตรวจความครบถ้วนจำลอง'], relatedOrgId:'TEST_ORG_001', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'amber' },
        { id:'TEST_REQ_002', name:'TEST_REQ_002', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_จัดตั้งสำนักศาสนศึกษา', category:'TEST_สำนักเรียน/สำนักศาสนศึกษา', target:'TEST_สำนักศาสนศึกษาตัวอย่าง 002', unit:'TEST_หน่วยงานผู้ยื่น 002', province:'TEST_จังหวัดตัวอย่าง_002', status:'TEST_รับข้อมูลจำลอง', currentStep:'TEST_ขั้นจำลอง 1', timeline:['TEST_รับข้อมูลจำลอง'], relatedOrgId:'TEST_ORG_002', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'blue' },
        { id:'TEST_REQ_003', name:'TEST_REQ_003', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_ยุบสำนักเรียน', category:'TEST_สำนักเรียน/สำนักศาสนศึกษา', target:'TEST_สำนักเรียนตัวอย่าง 003', unit:'TEST_หน่วยงานผู้ยื่น 003', province:'TEST_จังหวัดตัวอย่าง_003', status:'TEST_รอข้อมูลเพิ่มเติมจำลอง', currentStep:'TEST_ขั้นจำลอง 2', timeline:['TEST_รับข้อมูลจำลอง','TEST_รอข้อมูลเพิ่มเติมจำลอง'], relatedOrgId:'TEST_ORG_003', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'blue' },
        { id:'TEST_REQ_004', name:'TEST_REQ_004', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_ยุบสำนักศาสนศึกษา', category:'TEST_สำนักเรียน/สำนักศาสนศึกษา', target:'TEST_สำนักศาสนศึกษาตัวอย่าง 004', unit:'TEST_หน่วยงานผู้ยื่น 004', province:'TEST_จังหวัดตัวอย่าง_001', status:'TEST_รับข้อมูลจำลอง', currentStep:'TEST_ขั้นจำลอง 1', timeline:['TEST_รับข้อมูลจำลอง'], relatedOrgId:'TEST_ORG_002', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'blue' },
        { id:'TEST_REQ_005', name:'TEST_REQ_005', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_เปิดสนามสอบนักธรรมชั้นตรี', category:'TEST_สนามสอบ', target:'TEST_สนามสอบนักธรรมชั้นตรี 005', unit:'TEST_หน่วยงานผู้ยื่น 005', province:'TEST_จังหวัดตัวอย่าง_002', status:'TEST_อยู่ระหว่างดำเนินการจำลอง', currentStep:'TEST_ขั้นจำลอง 3', timeline:['TEST_รับข้อมูลจำลอง','TEST_ตรวจความครบถ้วนจำลอง','TEST_อยู่ระหว่างดำเนินการจำลอง'], relatedOrgId:'TEST_EXAM_SITE_NAKTHAM_TRI_001', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'amber' },
        { id:'TEST_REQ_006', name:'TEST_REQ_006', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_ปิดสนามสอบนักธรรมชั้นโท-เอก', category:'TEST_สนามสอบ', target:'TEST_สนามสอบนักธรรมชั้นโท-เอก 006', unit:'TEST_หน่วยงานผู้ยื่น 006', province:'TEST_จังหวัดตัวอย่าง_003', status:'TEST_ตรวจความครบถ้วนจำลอง', currentStep:'TEST_ขั้นจำลอง 2', timeline:['TEST_รับข้อมูลจำลอง','TEST_ตรวจความครบถ้วนจำลอง'], relatedOrgId:'TEST_EXAM_SITE_NAKTHAM_UPPER_001', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'amber' },
        { id:'TEST_REQ_007', name:'TEST_REQ_007', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_ย้ายสนามสอบธรรมศึกษา', category:'TEST_สนามสอบ', target:'TEST_สนามสอบธรรมศึกษาต้นทาง 007 → TEST_ปลายทาง 007', unit:'TEST_หน่วยงานผู้ยื่น 007', province:'TEST_จังหวัดตัวอย่าง_001', status:'TEST_รอข้อมูลเพิ่มเติมจำลอง', currentStep:'TEST_ขั้นจำลอง 2', timeline:['TEST_รับข้อมูลจำลอง','TEST_รอข้อมูลเพิ่มเติมจำลอง'], relatedOrgId:'TEST_EXAM_SITE_DHAMMA_001', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'blue' },
        { id:'TEST_REQ_008', name:'TEST_REQ_008', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_ย้ายสนามสอบนักธรรมชั้นตรี', category:'TEST_สนามสอบ', target:'TEST_สนามสอบนักธรรมต้นทาง 008 → TEST_ปลายทาง 008', unit:'TEST_หน่วยงานผู้ยื่น 008', province:'TEST_จังหวัดตัวอย่าง_003', status:'TEST_รับข้อมูลจำลอง', currentStep:'TEST_ขั้นจำลอง 1', timeline:['TEST_รับข้อมูลจำลอง'], relatedOrgId:'TEST_EXAM_SITE_NAKTHAM_TRI_001', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'blue' },
        { id:'TEST_REQ_009', name:'TEST_REQ_009', sub:'TEST_อ้างอิงสาธิต · ไม่ใช่เลขรับจริง', type:'TEST_เปิดสนามสอบธรรมศึกษา', category:'TEST_สนามสอบ', target:'TEST_สนามสอบธรรมศึกษาตัวอย่าง 009', unit:'TEST_หน่วยงานผู้ยื่น 009', province:'TEST_จังหวัดตัวอย่าง_002', status:'TEST_อยู่ระหว่างดำเนินการจำลอง', currentStep:'TEST_ขั้นจำลอง 3', timeline:['TEST_รับข้อมูลจำลอง','TEST_ตรวจความครบถ้วนจำลอง','TEST_อยู่ระหว่างดำเนินการจำลอง'], relatedOrgId:'TEST_EXAM_SITE_DHAMMA_001', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'amber' }
      ],
      callout: 'ทุกแถวและเหตุการณ์เป็น TEST_ ไม่มีคำสั่งหรือผลอนุมัติจริง ลำดับสถานะในหน้าจอเป็นเพียงโครงร่าง ต้องยืนยันเจ้าของขั้นตอน ผู้พิจารณา เอกสาร หลักฐาน วันมีผล ช่องทางแจ้งผล การเปิดเผยต่อสาธารณะ และ SLA ก่อนใช้จริง; ผู้ใช้สาธารณะต้องเห็นเฉพาะฟิลด์ที่อนุมัติให้เผยแพร่'
    },
    admissions: {
      code: 'ระบบ 05', title: 'ทะเบียนสมัครและผลสอบ', eyebrow: 'PALI REGISTRATION & RESULTS',
      description: 'จัดการบัญชีสมัครบาลี/บาลีศึกษาตาม ศ.2 ส่วนกลาง หรือ ศ.2 และบัญชีเรียกชื่อ ศ.3 ส่วนภูมิภาค พร้อมค้นผลสอบจากชุดข้อมูลที่เผยแพร่แล้ว',
      action: 'สร้างรายการสมัคร TEST_', actionLabel: 'บันทึกร่าง',
      stats: [['รายการทดสอบ', '03'], ['เอกสารจริง', '0'], ['ชุดผลสอบเผยแพร่', '0']],
      columns: ['ผู้สมัคร', 'ประเภทผู้สมัคร', 'สายสอบ', 'ชั้น/ประโยค', 'แบบบัญชี', 'สำนักเรียน', 'รอบสอบ', 'สถานะข้อมูล', ''],
      rows: [
        { id: 'TEST_APPLICANT_001', name: 'TEST_ผู้สมัคร 001', sub: 'TEST_APPLICANT_001 · ข้อมูลสาธิต', applicantKind: 'TEST_บรรพชิต', paliTrack: 'TEST_บาลีสนามหลวง', level: 'TEST_ป.ธ.3', formType: 'TEST_ส่วนภูมิภาค · ศ.2', unit: 'TEST_สำนักเรียนส่วนภูมิภาค', examSessionId: 'TEST_SESSION_001', status: 'TEST_รอตรวจบัญชี', tone: 'amber' },
        { id: 'TEST_APPLICANT_002', name: 'TEST_ผู้สมัคร 002', sub: 'TEST_APPLICANT_002 · ข้อมูลสาธิต', applicantKind: 'TEST_คฤหัสถ์', paliTrack: 'TEST_บาลีศึกษา', level: 'TEST_บ.ศ.1–2', formType: 'TEST_ส่วนกลาง · ศ.2', unit: 'TEST_สำนักเรียนส่วนกลาง', examSessionId: 'TEST_SESSION_001', status: 'TEST_ข้อมูลจำลอง', tone: '' },
        { id: 'TEST_APPLICANT_003', name: 'TEST_ผู้สมัคร 003', sub: 'TEST_APPLICANT_003 · ข้อมูลสาธิต', applicantKind: 'TEST_บรรพชิต', paliTrack: 'TEST_บาลีสนามหลวง', level: 'TEST_ป.ธ.5', formType: 'TEST_ส่วนภูมิภาค · ศ.2 / ศ.3', unit: 'TEST_สำนักเรียนจังหวัดตัวอย่าง', examSessionId: 'TEST_SESSION_002', status: 'TEST_รอยืนยันข้อมูล', tone: 'blue' }
      ],
      callout: 'ศ.2 ใช้เป็นบัญชีสมัครสอบ; แหล่งอ้างอิงระบุ ศ.3 เป็นบัญชีเรียกชื่อ/เอกสารดำเนินการสอบในส่วนภูมิภาคตามกรณี ต้นแบบไม่มีผลสอบทางการ และไม่อนุมานว่าสอบตกเมื่อค้นไม่พบ'
    },
    budget: {
      code: 'ระบบ 06', title: 'งบประมาณ', eyebrow: 'BUDGET CONTROL',
      description: 'บริหารวงจรงบประมาณตั้งแต่แผนและจัดสรร ไปจนถึงโอน ผูกพัน เบิกจ่าย คืนเงิน กระทบยอด และปิดงวด',
      action: 'สร้างแผน TEST_', actionLabel: 'บันทึกร่าง',
      stats: [['วงเงินจัดสรร TEST_', '฿ 1,600,000'], ['ยอดผูกพัน TEST_', '฿ 540,000'], ['จ่ายจริงในยอดผูกพัน', '฿ 270,000'], ['ยังไม่ผูกพัน', '฿ 1,060,000']],
      columns: ['แผน / หน่วยงาน', 'จัดสรร', 'ผูกพัน', 'จ่ายจริงในผูกพัน', 'ยังไม่ผูกพัน', 'ค้างจ่ายตามผูกพัน'],
      rows: [
        { id: 'TEST_BUDGET_001', name: 'TEST_แผนการศึกษา 001', sub: 'TEST_BUDGET_001 · TEST_FY_001', type: 'TEST_หน่วยงาน A', allocatedSatang: 80000000, committedSatang: 30000000, paidSatang: 15000000, status: 'TEST_กำลังดำเนินงาน', tone: 'blue' },
        { id: 'TEST_BUDGET_002', name: 'TEST_แผนสนามสอบ 002', sub: 'TEST_BUDGET_002 · TEST_FY_001', type: 'TEST_หน่วยงาน B', allocatedSatang: 42000000, committedSatang: 12000000, paidSatang: 7000000, status: 'TEST_กำลังดำเนินงาน', tone: 'blue' },
        { id: 'TEST_BUDGET_003', name: 'TEST_แผนครุภัณฑ์ 003', sub: 'TEST_BUDGET_003 · TEST_FY_001', type: 'TEST_หน่วยงาน C', allocatedSatang: 38000000, committedSatang: 12000000, paidSatang: 5000000, status: 'TEST_กำลังดำเนินงาน', tone: 'blue' }
      ],
      callout: 'ตัวเลขและขั้นตอนทั้งหมดเป็น TEST_ สำหรับตรวจแนวคิดเท่านั้น; จ่ายจริงเป็นส่วนหนึ่งของยอดผูกพัน ไม่หักซ้ำจากวงเงินคงเหลือ และปีงบประมาณแยกจากปีการศึกษา.'
    },
    assets: {
      code: 'ระบบ 07', title: 'พัสดุและครุภัณฑ์', eyebrow: 'ASSET & STOCK CONTROL',
      description: 'ทะเบียนวัสดุและครุภัณฑ์ พร้อมคลัง/หน่วยงานย่อย ประวัติ stock card รับเข้า เบิก คืน โอน ยืม ซ่อม ตรวจนับ และคำขอจำหน่าย',
      action: 'บันทึกรายการ TEST_', actionLabel: 'บันทึก movement',
      stats: [['รายการ TEST_', '03'], ['ยอดในคลังจาก movement', '31'], ['ยืมคงค้าง TEST_', '01'], ['ซ่อม/ตรวจสภาพ TEST_', '01']],
      columns: ['รายการ / รหัส', 'ประเภท', 'คงเหลือ¹', 'สถานที่', 'สถานะข้อมูล', ''],
      rows: [
        { id: 'TEST_ASSET_001', name: 'TEST_คอมพิวเตอร์ตั้งโต๊ะ', sub: 'TEST_ASSET_001', type: 'TEST_ครุภัณฑ์', unit: 'TEST_สำนักงานตัวอย่าง', status: 'TEST_พร้อมใช้งาน', tone: '' },
        { id: 'TEST_ASSET_002', name: 'TEST_กระดาษ A4', sub: 'TEST_STOCK_002', type: 'TEST_วัสดุสิ้นเปลือง', unit: 'TEST_คลังตัวอย่าง', status: 'TEST_ยอดจำลอง', tone: 'blue' },
        { id: 'TEST_ASSET_003', name: 'TEST_เครื่องพิมพ์เอกสาร', sub: 'TEST_ASSET_003', type: 'TEST_ครุภัณฑ์', unit: 'TEST_สำนักเรียนตัวอย่าง', status: 'TEST_รอตรวจสภาพ', tone: 'amber' }
      ],
      callout: '¹ จำนวนคงเหลือคำนวณจาก movement แบบ append-only รวมการยืมและคู่ movement โอน; ตรวจนับและคำขอจำหน่ายไม่เปลี่ยนยอดเอง ต้นแบบนี้ใช้ TEST_ ในพื้นที่ข้อมูล TEST_ และไม่มีการรับ เบิก อนุมัติ หรือจำหน่ายจริง.'
    },
    correspondence: {
      code: 'ระบบ 08', title: 'สารบรรณออนไลน์', eyebrow: 'CORRESPONDENCE',
      description: 'ร่างและติดตามหนังสือ/แจ้งงาน เชื่อมหน่วยงานกับทะเบียนกลาง พร้อมกล่องรับ–ส่งและประวัติจำลอง',
      action: 'ร่างหนังสือ TEST_', actionLabel: 'เปิดร่างใหม่',
      stats: [['เอกสาร TEST_', '04'], ['รอรับทราบ TEST_', '01'], ['เลขทะเบียน/ลายเซ็นจริง', '0']],
      columns: ['รหัสเอกสาร TEST_', 'เรื่อง', 'ประเภท', 'ชั้นข้อมูล', 'จาก → ถึง', 'สถานะ TEST_', ''],
      rows: [
        { id:'TEST_DOC_001', name:'TEST_แจ้งกำหนดการประชุมตัวอย่าง', sub:'TEST_ร่างในหน่วยความจำ · ไม่มีผลบังคับ', type:'TEST_หนังสือแจ้งงาน', unit:'TEST_ทั่วไป', contact:'TEST_สำนักศาสนศึกษาตัวอย่าง', status:'TEST_ร่าง', tone:'amber', direction:'outgoing', classification:'TEST_ทั่วไป', senderOrganizationId:'TEST_ORG_001', recipientOrganizationId:'TEST_ORG_002', summary:'TEST_ข้อความตัวอย่างสำหรับตรวจ flow การจัดทำหนังสือ', attachmentLabel:'TEST_ไม่มีไฟล์แนบ', urgency:'TEST_ปกติ' },
        { id:'TEST_DOC_002', name:'TEST_เอกสารจำกัดสิทธิ์ตัวอย่าง', sub:'TEST_หัวเรื่องตัวอย่าง · ซ่อนเนื้อหา', type:'TEST_หนังสือภายใน', unit:'TEST_จำกัดผู้รับ', contact:'TEST_สำนักเรียนบาลีประจำจังหวัดตัวอย่าง', status:'TEST_รอรับจำลอง', tone:'amber', direction:'incoming', classification:'TEST_จำกัดผู้รับ', senderOrganizationId:'TEST_ORG_004', recipientOrganizationId:'TEST_ORG_003', summary:'TEST_เนื้อหาลับ_ไม่ควรแสดง', attachmentLabel:'TEST_ไฟล์จำลองถูกซ่อน', urgency:'TEST_เร่งด่วน' },
        { id:'TEST_DOC_003', name:'TEST_ขอข้อมูลประกอบการวางแผนตัวอย่าง', sub:'TEST_ส่งในกล่องตัวอย่าง · ไม่มีเลขทะเบียนจริง', type:'TEST_หนังสือภายใน', unit:'TEST_ทั่วไป', contact:'TEST_วัดตัวอย่าง', status:'TEST_ส่งจำลอง', tone:'blue', direction:'outgoing', classification:'TEST_ทั่วไป', senderOrganizationId:'TEST_ORG_001', recipientOrganizationId:'TEST_ORG_004', summary:'TEST_ข้อความขอข้อมูลเพื่อทดสอบการค้นย้อนหลัง', attachmentLabel:'TEST_เอกสารแนบจำลอง.pdf', urgency:'TEST_ปกติ' },
        { id:'TEST_DOC_004', name:'TEST_แจ้งเตือนกำหนดส่งรายงานตัวอย่าง', sub:'TEST_แจ้งงานออนไลน์ · รับทราบจำลอง', type:'TEST_แจ้งงานออนไลน์', unit:'TEST_ทั่วไป', contact:'TEST_องค์กรตัวอย่าง', status:'TEST_รับทราบจำลอง', tone:'', direction:'notice', classification:'TEST_ทั่วไป', senderOrganizationId:'TEST_ORG_001', recipientOrganizationId:'TEST_ORG_005', summary:'TEST_ข้อความแจ้งงานตัวอย่าง', attachmentLabel:'TEST_ไม่มีไฟล์แนบ', urgency:'TEST_ปกติ' }
      ],
      callout: 'ทุกระเบียนเป็น TEST_ ในพื้นที่ข้อมูล TEST_; ยังไม่มีการส่งหนังสือจริง อีเมล/LINE/แจ้งเตือน การรับไฟล์ ลายเซ็น เลขทะเบียน หรือการอนุมัติจริง'
    }
  };

  const CORRESPONDENCE_TEST_FIXTURE = MODULES.correspondence.rows.map(row=>({...row}));

  const DATA_IMPORT_CONFIG = {
    people: { label: 'ทะเบียนบุคคล', optionalFields: ['governancePosition','educationPositions'], previewFields: ['id','name','governancePosition','educationPositions','section','office','province','sanghaRegion','status'], fields: [['รหัสระเบียน','id'],['ชื่อบุคคล','name'],['ประเภทบุคคล','type'],['ตำแหน่งทางการปกครอง','governancePosition'],['ตำแหน่ง จศป. ฝ่ายการศึกษา (หลายตำแหน่งคั่นด้วย |)','educationPositions'],['แท่ง/แผนก','section'],['หน่วยงาน','office'],['สังกัดวัด','temple'],['ตำบล','subdistrict'],['อำเภอ','district'],['จังหวัด','province'],['ภาค','sanghaRegion'],['เขตหน/พื้นที่','region'],['สถานะจำลอง','status']] },
    organizations: {
      label: 'หน่วยงานและสนามสอบ',
      optionalFields: ['examType','examSessionId','examSessionLabel','chairName','chairTitle','chairAddress','chairPhone','chairEmail','chairLineId','receiverName','receiverTitle','receiverAddress','receiverPhone','receiverEmail','receiverLineId'],
      previewFields: ['id','name','type','address','province','examType','examSessionId','chairName','chairTitle','chairAddress','chairPhone','chairEmail','chairLineId','receiverName','receiverTitle','receiverAddress','receiverPhone','receiverEmail','receiverLineId','status'],
      fields: [['รหัสระเบียน','id'],['ชื่อหน่วยงาน/สนามสอบ','name'],['ประเภทหน่วยงาน','type'],['พื้นที่/สังกัด','unit'],['ที่อยู่','address'],['ตำบล','subdistrict'],['อำเภอ','district'],['จังหวัด','province'],['รหัสไปรษณีย์','postalCode'],['ประเภทสอบ','examType'],['รหัสรอบสอบ','examSessionId'],['ชื่อรอบสอบ','examSessionLabel'],['ชื่อประธานสนามสอบ','chairName'],['ตำแหน่งประธานสนามสอบ','chairTitle'],['ที่อยู่ประธานสนามสอบ','chairAddress'],['โทรศัพท์ประธานสนามสอบ','chairPhone'],['อีเมลประธานสนามสอบ','chairEmail'],['LINE ID ประธานสนามสอบ','chairLineId'],['ชื่อผู้รับข้อสอบ','receiverName'],['ตำแหน่งผู้รับข้อสอบ','receiverTitle'],['ที่อยู่ผู้รับข้อสอบ','receiverAddress'],['โทรศัพท์ผู้รับข้อสอบ','receiverPhone'],['อีเมลผู้รับข้อสอบ','receiverEmail'],['LINE ID ผู้รับข้อสอบ','receiverLineId'],['สถานะจำลอง','status']]
    },
    pali: { label: 'คลังเรียนและข้อสอบ', fields: [['รหัสชุด','id'],['ประเภทหลักสูตร','domain'],['สายหลักสูตร','track'],['ชั้น/ระดับ','level'],['วิชา','subject'],['บทเรียน','lessons'],['คลังข้อสอบ','questionBank'],['rubric','rubric']] },
    requests: { label: 'คำขอและสถานะ', optionalFields:['summary'], previewFields:['id','type','category','target','unit','province','status','currentStep'], fields: [['รหัสระเบียน','id'],['รายการคำขอ','name'],['ประเภทคำขอ','type'],['หมวดคำขอ','category'],['สำนัก/สนามสอบ','target'],['หน่วยงานผู้ยื่น','unit'],['จังหวัด','province'],['สถานะจำลอง','status'],['ขั้นตอนจำลอง','currentStep'],['รหัสหน่วยงานเชื่อม','relatedOrgId'],['รายละเอียด TEST_','summary'],['เอกสารแนบ TEST_','attachmentSummary']] },
    admissions: { label: 'ทะเบียนสมัครบาลี/บาลีศึกษา', fields: [['รหัสระเบียน','id'],['ผู้สมัครจำลอง','name'],['ประเภทผู้สมัคร','applicantKind'],['สายสอบ','paliTrack'],['ชั้น/ประโยค','level'],['ประเภทบัญชี','formType'],['สำนักเรียน','unit'],['รหัสรอบสอบ','examSessionId'],['สถานะจำลอง','status']] },
    budget: { label: 'งบประมาณ', numeric: ['allocatedSatang','committedSatang','paidSatang'], fields: [['รหัสระเบียน','id'],['ชื่อแผน','name'],['หน่วยงาน','type'],['จัดสรร (สตางค์)','allocatedSatang'],['ผูกพัน (สตางค์)','committedSatang'],['จ่ายจริง (สตางค์)','paidSatang']] },
    assets: { label: 'ทะเบียนพัสดุและครุภัณฑ์', fields: [['รหัสระเบียน','id'],['รายการ','name'],['ประเภท','type'],['คลัง/หน่วยงานเริ่มต้น','unit'],['สถานะจำลอง','status']] },
    correspondence: { label: 'สารบรรณออนไลน์ · metadata TEST_ เท่านั้น', previewFields: ['id','name','type','classification','senderOrganizationId','recipientOrganizationId','status'], fields: [['รหัสเอกสาร TEST_','id'],['เรื่อง TEST_','name'],['ประเภทเอกสาร TEST_','type'],['ชั้นข้อมูล TEST_','classification'],['หน่วยงานต้นทาง ID TEST_','senderOrganizationId'],['หน่วยงานปลายทาง ID TEST_','recipientOrganizationId'],['สถานะ TEST_','status']] }
  };
  const EXAM_FORM_PROFILES = [
    { key:'TEST_FORM_NAKTHAM_TRI', label:'นักธรรมชั้นตรี · ศ.1', program:'นักธรรม', grade:'ตรี', audience:'บรรพชิต/สามเณร', note:'หน้าแบบฟอร์มที่ตรวจพบแสดง ศ.1; คำขอระบุ ศ.1–2 จึงต้องยืนยันฉบับที่ใช้อยู่กับเจ้าของแบบฟอร์ม' },
    { key:'TEST_FORM_NAKTHAM_UPPER', label:'นักธรรมชั้นโท–เอก · ศ.2', program:'นักธรรม', grade:'upper', audience:'บรรพชิต/สามเณร', note:'แยกระดับชั้นโทและเอกในข้อมูลผู้สมัคร แม้ใช้เลขแบบ ศ.2 เหมือนกัน' },
    { key:'TEST_FORM_DHAMMA_TRI', label:'ธรรมศึกษาชั้นตรี · ศ.5', program:'ธรรมศึกษา', grade:'ตรี', audience:'นักเรียน/นักศึกษา/คฤหัสถ์ทั่วไป', note:'ประเภทตามรายการแบบฟอร์มที่ตรวจพบ' },
    { key:'TEST_FORM_DHAMMA_UPPER', label:'ธรรมศึกษาชั้นโท–เอก · ศ.6', program:'ธรรมศึกษา', grade:'upper', audience:'นักเรียน/นักศึกษา/คฤหัสถ์ทั่วไป', note:'แยกระดับชั้นโทและเอกในข้อมูลผู้สมัคร แม้ใช้เลขแบบ ศ.6 เหมือนกัน' }
  ];
  const PALI_RESULT_LEVELS = ['TEST_ประโยค 1–2','TEST_ป.ธ.3','TEST_ป.ธ.4','TEST_ป.ธ.5','TEST_ป.ธ.6','TEST_ป.ธ.7','TEST_ป.ธ.8','TEST_ป.ธ.9','TEST_บ.ศ.1–2','TEST_บ.ศ.3','TEST_บ.ศ.4','TEST_บ.ศ.5'];
  const TEST_USERS = [
    { id: 'TEST_ADMIN_001', label: 'TEST_ผู้ดูแลระบบสูงสุด' },
    { id: 'TEST_USER_001', label: 'TEST_เจ้าหน้าที่ตัวอย่าง' },
    { id: 'TEST_USER_002', label: 'TEST_ผู้เรียนตัวอย่าง' }
  ];
  const PERMISSIONS = [
    ['read','อ่าน'], ['edit','แก้ไข'], ['export','ส่งออก'], ['import','นำเข้า'],
    ['approve','เสนอ/พิจารณา*'], ['publish','เผยแพร่*'], ['manage_roles','จัดการสิทธิ์']
  ];
  const TEST_ROLES = ['TEST_ผู้ดูแลระบบสูงสุด','TEST_ผู้บริหาร','TEST_ผู้ปฏิบัติงาน','TEST_ผู้เรียน','TEST_ผู้ตรวจสอบ'];
  const TEST_SCOPES = ['TEST_ส่วนกลาง','TEST_ภาค','TEST_จังหวัด','TEST_องค์กร/สำนักเรียน','TEST_สนามสอบ'];
  const INITIAL_PERMISSION_ASSIGNMENTS = [
    { id: 'TEST_ASSIGN_001', userId: 'TEST_ADMIN_001', role: 'TEST_ผู้ดูแลระบบสูงสุด', module: 'all', scopeType: 'TEST_ส่วนกลาง', scopeValue: 'TEST_ทุกขอบเขต', permissions: PERMISSIONS.map(([key]) => key) },
    { id: 'TEST_ASSIGN_002', userId: 'TEST_USER_001', role: 'TEST_ผู้ปฏิบัติงาน', module: 'people', scopeType: 'TEST_จังหวัด', scopeValue: 'TEST_จังหวัดตัวอย่าง', permissions: ['read','edit'] },
    { id: 'TEST_ASSIGN_003', userId: 'TEST_USER_002', role: 'TEST_ผู้เรียน', module: 'pali', scopeType: 'TEST_องค์กร/สำนักเรียน', scopeValue: 'TEST_สำนักเรียนตัวอย่าง', permissions: ['read'] }
  ];
  const ASSET_LOCATIONS = ['TEST_สำนักงานตัวอย่าง','TEST_คลังตัวอย่าง','TEST_สำนักเรียนตัวอย่าง','TEST_คลังย่อยตัวอย่าง'];
  const ASSET_STAGES = [
    { id:'inventory', label:'ทะเบียน/คงเหลือ' }, { id:'movement', label:'Stock card' }, { id:'purchase', label:'ขอจัดซื้อ' }, { id:'receive', label:'รับเข้า' },
    { id:'issue', label:'เบิก' }, { id:'return', label:'คืน' }, { id:'transfer', label:'โอน' },
    { id:'loans', label:'ยืม/คืนยืม' }, { id:'maintenance', label:'ซ่อมบำรุง' }, { id:'count', label:'ตรวจนับ' }, { id:'disposal', label:'จำหน่าย' }
  ];
  const CORRESPONDENCE_TABS = [
    { id:'all', label:'เอกสารทั้งหมด' }, { id:'inbox', label:'กล่องรับ' },
    { id:'sent', label:'กล่องส่ง' }, { id:'drafts', label:'ร่าง' }, { id:'notices', label:'แจ้งงานออนไลน์' }
  ];
  const ASSET_MOVEMENT_LABELS = {
    opening:'TEST_ยอดยกมา', receive:'TEST_รับเข้า', issue:'TEST_เบิก', return:'TEST_คืน',
    transfer_out:'TEST_โอนออก', transfer_in:'TEST_รับโอน', loan:'TEST_ยืมออก', loan_return:'TEST_คืนยืม'
  };
  const ASSET_SAMPLE_MOVEMENTS = [
    { id:'TEST_ASSET_MOVEMENT_001', reference:'TEST_OPENING_PC_001', assetId:'TEST_ASSET_001', type:'opening', quantityDelta:5, location:'TEST_สำนักงานตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_ยอดตั้งต้นสำหรับสาธิต' },
    { id:'TEST_ASSET_MOVEMENT_002', reference:'TEST_ISSUE_PC_001', assetId:'TEST_ASSET_001', type:'issue', quantityDelta:-1, location:'TEST_สำนักงานตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_ตัวอย่างการเบิก' },
    { id:'TEST_ASSET_MOVEMENT_003', reference:'TEST_OPENING_PAPER_001', assetId:'TEST_ASSET_002', type:'opening', quantityDelta:20, location:'TEST_คลังตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_ยอดตั้งต้นสำหรับสาธิต' },
    { id:'TEST_ASSET_MOVEMENT_004', reference:'TEST_RECEIVE_PAPER_001', assetId:'TEST_ASSET_002', type:'receive', quantityDelta:8, location:'TEST_คลังตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_ตัวอย่างการรับเข้า' },
    { id:'TEST_ASSET_MOVEMENT_005', reference:'TEST_ISSUE_PAPER_001', assetId:'TEST_ASSET_002', type:'issue', quantityDelta:-4, location:'TEST_คลังตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_ตัวอย่างการเบิก' },
    { id:'TEST_ASSET_MOVEMENT_006', reference:'TEST_RETURN_PAPER_001', assetId:'TEST_ASSET_002', type:'return', quantityDelta:1, location:'TEST_คลังตัวอย่าง', sourceReference:'TEST_ISSUE_PAPER_001', status:'TEST_บันทึกจำลอง', note:'TEST_ตัวอย่างการคืนจากการเบิก' },
    { id:'TEST_ASSET_MOVEMENT_007', reference:'TEST_TRANSFER_PAPER_001', assetId:'TEST_ASSET_002', type:'transfer_out', quantityDelta:-2, location:'TEST_คลังตัวอย่าง', counterpartLocation:'TEST_สำนักงานตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_คู่โอนตัวอย่าง' },
    { id:'TEST_ASSET_MOVEMENT_008', reference:'TEST_TRANSFER_PAPER_001', assetId:'TEST_ASSET_002', type:'transfer_in', quantityDelta:2, location:'TEST_สำนักงานตัวอย่าง', counterpartLocation:'TEST_คลังตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_คู่โอนตัวอย่าง' },
    { id:'TEST_ASSET_MOVEMENT_009', reference:'TEST_OPENING_PRINTER_001', assetId:'TEST_ASSET_003', type:'opening', quantityDelta:3, location:'TEST_สำนักเรียนตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_ยอดตั้งต้นสำหรับสาธิต' },
    { id:'TEST_ASSET_MOVEMENT_010', reference:'TEST_LOAN_001', assetId:'TEST_ASSET_003', type:'loan', quantityDelta:-1, location:'TEST_สำนักเรียนตัวอย่าง', status:'TEST_บันทึกจำลอง', note:'TEST_รายการยืมคงค้าง' }
  ];
  const ASSET_SAMPLE_LOANS = [{ id:'TEST_LOAN_001', reference:'TEST_LOAN_001', assetId:'TEST_ASSET_003', quantity:1, borrower:'TEST_ผู้ยืมตัวอย่าง', location:'TEST_สำนักเรียนตัวอย่าง', status:'TEST_ยืมคงค้าง', note:'TEST_รายการยืมเพื่อสาธิต' }];
  const ASSET_SAMPLE_MAINTENANCE = [{ id:'TEST_MAINTENANCE_001', reference:'TEST_MAINTENANCE_001', assetId:'TEST_ASSET_003', location:'TEST_สำนักเรียนตัวอย่าง', status:'TEST_รอตรวจสภาพ', note:'TEST_ตัวอย่างบันทึกตรวจสภาพ ไม่กระทบยอดคงเหลือ' }];
  const ASSET_SAMPLE_COUNTS = [{ id:'TEST_COUNT_001', reference:'TEST_COUNT_001', assetId:'TEST_ASSET_001', location:'TEST_สำนักงานตัวอย่าง', expected:4, counted:4, variance:0, status:'TEST_รอตรวจทานจำลอง', note:'TEST_ตัวอย่างตรวจนับ ไม่ปรับยอดสต็อก' }];
  const ASSET_SAMPLE_DISPOSALS = [{ id:'TEST_DISPOSAL_001', reference:'TEST_DISPOSAL_001', assetId:'TEST_ASSET_003', quantity:1, location:'TEST_สำนักเรียนตัวอย่าง', status:'TEST_รอข้อมูลหลักเกณฑ์', note:'TEST_คำขอจำหน่ายตัวอย่าง ไม่ตัดยอด' }];
  const ASSET_SAMPLE_PURCHASES = [{ id:'TEST_PURCHASE_001', reference:'TEST_PURCHASE_001', assetId:'TEST_ASSET_002', quantity:5, budgetReference:'TEST_BUDGET_001', status:'TEST_ร่างขอซื้อจำลอง', note:'TEST_คำขอซื้อเพื่อแสดงความเชื่อมโยงงบประมาณ ไม่ใช่คำสั่งซื้อ' }];
  const state = {
    page: 'home', pageHistory: [], currentRows: [], import: null, dataImport: null, selectedDataModule: 'people',
    drafts: 0, courseTrack: 'pali', courseLevel: 'ทั้งหมด', courseTab: 'subjects', admissionsTab:'applications', admissionsScope:'all', resultSearch:null, examFormType:'', peopleStatus: 'all', organizationType: 'all', organizationProvince:'all', requestsCategory:'all', requestsType:'all', requestsProvince:'all', requestsStatus:'all', budgetTab:'plan', budgetPeriod:'all', budgetDrafts:[], assetTab:'inventory', assetMovements:ASSET_SAMPLE_MOVEMENTS.map(item=>({...item})), assetLoans:ASSET_SAMPLE_LOANS.map(item=>({...item})), assetMaintenance:ASSET_SAMPLE_MAINTENANCE.map(item=>({...item})), assetCounts:ASSET_SAMPLE_COUNTS.map(item=>({...item})), assetDisposals:ASSET_SAMPLE_DISPOSALS.map(item=>({...item})), assetPurchases:ASSET_SAMPLE_PURCHASES.map(item=>({...item})), draftPersonName: '', draftEducationPositions: [], demoLoggedIn: true,
    pageNumbers: {}, listSearch: {},
    permissionDraft: { userId: 'TEST_USER_001', role: 'TEST_ผู้ปฏิบัติงาน', module: 'people', scopeType: 'TEST_จังหวัด', scopeValue: 'TEST_จังหวัดตัวอย่าง', permissions: ['read','edit'] },
    permissionAssignments: INITIAL_PERMISSION_ASSIGNMENTS.map(item => ({ ...item, permissions: [...item.permissions] })), modalConfirm: null,
    correspondenceTab: 'all', correspondenceAudit: [], correspondenceMailMergePrefill: null
  };
  const BUDGET_STAGES = [
    { id:'overview', label:'ภาพรวม' }, { id:'plan', label:'แผนและจัดสรร' }, { id:'transfer', label:'โอนงบ' },
    { id:'commitment', label:'ผูกพัน' }, { id:'disbursement', label:'เบิกจ่าย/จ่ายจริง' },
    { id:'refund', label:'คืนเงิน' }, { id:'reconcile', label:'กระทบยอด' }, { id:'close', label:'ปิดงวด' }
  ];
  const BUDGET_SAMPLE_EVENTS = {
    transfer: [
      { id:'TEST_TRANSFER_001', period:'TEST_PERIOD_01', amountSatang:4500000, source:'TEST_หน่วยงาน A', destination:'TEST_หน่วยงาน B', status:'TEST_ร่างจำลอง', note:'TEST_ตัวอย่างร่างโอนเพื่อทดสอบหน้าจอ' },
      { id:'TEST_TRANSFER_002', period:'TEST_PERIOD_02', amountSatang:2500000, source:'TEST_หน่วยงาน C', destination:'TEST_หน่วยงาน A', status:'TEST_รอตรวจข้อมูลจำลอง', note:'TEST_ตัวอย่างรายการรอตรวจ ไม่ใช่การอนุมัติ' }
    ],
    commitment: [
      { id:'TEST_COMMITMENT_001', period:'TEST_PERIOD_01', amountSatang:30000000, unit:'TEST_แผนการศึกษา 001 · TEST_หน่วยงาน A', status:'TEST_รายการผูกพันตัวอย่าง', note:'TEST_ยอดรวมตัวอย่างที่แสดงในแผน' },
      { id:'TEST_COMMITMENT_002', period:'TEST_PERIOD_01', amountSatang:12000000, unit:'TEST_แผนสนามสอบ 002 · TEST_หน่วยงาน B', status:'TEST_รายการผูกพันตัวอย่าง', note:'TEST_ยอดรวมตัวอย่างที่แสดงในแผน' },
      { id:'TEST_COMMITMENT_003', period:'TEST_PERIOD_02', amountSatang:12000000, unit:'TEST_แผนครุภัณฑ์ 003 · TEST_หน่วยงาน C', status:'TEST_รายการผูกพันตัวอย่าง', note:'TEST_ยอดรวมตัวอย่างที่แสดงในแผน' }
    ],
    disbursement: [
      { id:'TEST_PAYMENT_001', period:'TEST_PERIOD_01', amountSatang:15000000, unit:'TEST_แผนการศึกษา 001 · TEST_หน่วยงาน A', status:'TEST_จ่ายจริงตัวอย่าง', note:'TEST_เป็นส่วนหนึ่งของยอดผูกพัน' },
      { id:'TEST_PAYMENT_002', period:'TEST_PERIOD_01', amountSatang:7000000, unit:'TEST_แผนสนามสอบ 002 · TEST_หน่วยงาน B', status:'TEST_จ่ายจริงตัวอย่าง', note:'TEST_เป็นส่วนหนึ่งของยอดผูกพัน' },
      { id:'TEST_PAYMENT_003', period:'TEST_PERIOD_02', amountSatang:5000000, unit:'TEST_แผนครุภัณฑ์ 003 · TEST_หน่วยงาน C', status:'TEST_จ่ายจริงตัวอย่าง', note:'TEST_เป็นส่วนหนึ่งของยอดผูกพัน' }
    ],
    refund: [
      { id:'TEST_REFUND_001', period:'TEST_PERIOD_01', amountSatang:150000, unit:'TEST_หน่วยงาน A · TEST_อ้างอิงการจ่าย 001', status:'TEST_รอตรวจหลักฐานจำลอง', note:'TEST_ยอดรอตรวจไม่รวมคืนเงินจริง' },
      { id:'TEST_REFUND_002', period:'TEST_PERIOD_02', amountSatang:50000, unit:'TEST_หน่วยงาน C · TEST_อ้างอิงการจ่าย 003', status:'TEST_ร่างจำลอง', note:'TEST_ยอดร่างไม่รวมคืนเงินจริง' }
    ],
    reconcile: [
      { id:'TEST_RECON_001', period:'TEST_PERIOD_01', amountSatang:15000000, ledgerSatang:15000000, unit:'TEST_บัญชีแผนการศึกษา 001', status:'TEST_รอเทียบหลักฐานจำลอง', note:'TEST_ยอดตัวอย่างเพื่อแสดงการเทียบยอด' },
      { id:'TEST_RECON_002', period:'TEST_PERIOD_02', amountSatang:5000000, ledgerSatang:4800000, unit:'TEST_บัญชีแผนครุภัณฑ์ 003', status:'TEST_พบส่วนต่างจำลอง', note:'TEST_ส่วนต่าง 200000 satang ใช้ทดสอบการติดตาม' }
    ],
    close: [
      { id:'TEST_CLOSE_001', period:'TEST_PERIOD_01', amountSatang:null, unit:'TEST_งวดตัวอย่าง 01', status:'TEST_รอหลักฐานก่อนปิดงวด', note:'TEST_ยังไม่มีการปิดงวดหรือรับรองยอดจริง' },
      { id:'TEST_CLOSE_002', period:'TEST_PERIOD_02', amountSatang:null, unit:'TEST_งวดตัวอย่าง 02', status:'TEST_เปิดงวดจำลอง', note:'TEST_ยังไม่มีการปิดงวดหรือรับรองยอดจริง' }
    ]
  };
  const pageContent = document.getElementById('page-content');
  const modalRoot = document.getElementById('modal-root');
  const toastRoot = document.getElementById('toast-root');
  const navRoot = document.getElementById('primary-nav');

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const money = (satang) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(satang / 100);
  const educationPositionsOf = value => (Array.isArray(value) ? value : String(value ?? '').split('|')).map(item => String(item).trim()).filter(Boolean);
  const serializeEducationPositions = value => educationPositionsOf(value).join(' | ');

  function educationPositionWarnings(name, positions, excludedIds = []) {
    const selected = educationPositionsOf(positions);
    const warnings = [];
    if (selected.length > 1) warnings.push(`พบตำแหน่งฝ่ายการศึกษาหลายตำแหน่งในบุคคลเดียว (${selected.length}): ${selected.join(' / ')} · กรุณาตรวจสอบการซ้ำ/ทับซ้อน`);
    const normalizedName = String(name ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('th-TH');
    if (normalizedName) {
      const excluded = new Set(excludedIds);
      const possibleMatches = MODULES.people.rows.filter(row => !excluded.has(row.id)
        && String(row.name ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('th-TH') === normalizedName
        && educationPositionsOf(row.educationPositions).length);
      possibleMatches.forEach(row => warnings.push(`ชื่อซ้ำกับระเบียน ${row.id} ที่มีตำแหน่งฝ่ายการศึกษา ${educationPositionsOf(row.educationPositions).join(' / ')} · โปรดตรวจสอบว่าเป็นบุคคลเดียวกันและมีตำแหน่งซ้ำหรือไม่`));
    }
    return warnings;
  }

  function updateEducationPositionWarning() {
    const target = document.getElementById('education-role-warning');
    if (!target) return;
    const warnings = educationPositionWarnings(state.draftPersonName, state.draftEducationPositions);
    target.innerHTML = warnings.length
      ? `<div class="callout warn role-overlap-warning" role="status" aria-live="polite"><span>ⓘ</span><div>${warnings.map(esc).join('<br />')}</div></div>`
      : '';
  }

  function drawNav() {
    if (!state.demoLoggedIn) { navRoot.innerHTML = ''; return; }
    navRoot.innerHTML = NAV.map(item => {
      const group = item.group ? `<div class="nav-label">${item.group}</div>` : '';
      return `${group}<button class="nav-link ${state.page === item.id ? 'active' : ''}" data-page="${item.id}" ${state.page === item.id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${esc(item.label)}</span>${item.number ? `<span class="nav-number">${item.number}</span>` : ''}</button>`;
    }).join('');
  }

  function heading(eyebrow, title, description, action = '') {
    return `<div class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p>${esc(description)}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ''}</div>`;
  }

  function button(label, action, style = 'primary', extra = '') {
    return `<button class="btn btn-${style}" data-action="${esc(action)}" ${extra}>${label}</button>`;
  }

  function formDownloadsPanel(kind) {
    const items = FORM_DOWNLOADS[kind] || [];
    if (!items.length) return '';
    const isPali = kind === 'pali';
    const title = isPali ? 'ดาวน์โหลดแบบบัญชีบาลี' : 'ดาวน์โหลดแบบบัญชีนักธรรมและธรรมศึกษา';
    const cards = items.map(item => {
      const href = item.sourceOnly ? 'https://dhammastudy.org/' : `/assets/forms/${item.asset}`.split('/').map((part, index) => index ? encodeURIComponent(part) : part).join('/');
      return `<article class="form-download-card"><div class="form-download-copy"><span class="file-tag">.${esc(item.asset.split('.').pop().toUpperCase())}</span><h3>${esc(item.label)}</h3><p>${esc(item.detail)}</p><small>${esc(item.downloadName)}</small></div><a class="btn btn-secondary" href="${esc(href)}" ${item.sourceOnly ? 'target="_blank" rel="noopener noreferrer"' : `download="${esc(item.downloadName)}"`} aria-label="${item.sourceOnly ? 'เปิดเว็บไซต์เจ้าของแบบ' : 'ดาวน์โหลด'} ${esc(item.label)}">${item.sourceOnly ? 'เปิดเว็บไซต์เจ้าของแบบ' : '⇩ ดาวน์โหลด'}</a></article>`;
    }).join('');
    return `<section class="panel form-download-panel" aria-labelledby="form-download-title-${kind}"><div class="form-download-heading"><div><p class="eyebrow">FORM LIBRARY · ${isPali ? 'PALI' : 'DHAMMA'}</p><h2 id="form-download-title-${kind}">${title}</h2><p>สำเนาแม่แบบที่ลบชื่อผู้บันทึกออก และลิงก์เว็บไซต์เจ้าของแบบ · ${items.length} รายการ</p></div></div><div class="form-download-grid">${cards}</div><div class="callout warn form-download-warning"><span>ⓘ</span><div><b>ตรวจข้อมูลก่อนส่งต่อ</b> — ไฟล์ดาวน์โหลดเป็นสำเนาที่ลบ metadata ผู้จัดทำแล้ว แบบนักธรรมสามรายการให้เปิดเว็บไซต์เจ้าของแบบแทน เนื่องจากไฟล์เดิมยังไม่ผ่านการอนุญาตเผยแพร่สาธารณะ กรุณาตรวจรุ่นแบบฟอร์มและข้อมูลก่อนใช้งานจริง</div></div></section>`;
  }

  const PAGE_SIZE = 25;

  function pageSlice(key, rows) {
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const page = Math.min(totalPages, Math.max(1, Number(state.pageNumbers[key]) || 1));
    state.pageNumbers[key] = page;
    const start = (page - 1) * PAGE_SIZE;
    return { page, totalPages, start, rows: rows.slice(start, start + PAGE_SIZE) };
  }

  function paginationControls(key, total) {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(totalPages, Math.max(1, Number(state.pageNumbers[key]) || 1));
    state.pageNumbers[key] = page;
    const disabled = (condition) => condition ? 'disabled aria-disabled="true"' : '';
    return `<nav class="pagination-controls" aria-label="เปลี่ยนหน้ารายการ" data-pagination="${esc(key)}"><span class="pagination-summary">หน้า ${page} จาก ${totalPages} · ${total.toLocaleString('th-TH')} รายการ</span><button class="page-button" data-action="page-first" data-page-key="${esc(key)}" aria-label="หน้าแรก" ${disabled(page === 1)}>หน้าแรก</button><button class="page-button page-arrow" data-action="page-prev" data-page-key="${esc(key)}" aria-label="หน้าก่อนหน้า" ${disabled(page === 1)}>‹</button><label class="page-jump">ไปหน้า<input id="page-input-${esc(key)}" data-page-input="${esc(key)}" type="number" inputmode="numeric" min="1" max="${totalPages}" value="${page}" aria-label="พิมพ์เลขหน้าที่ต้องการ" /><span>/ ${totalPages}</span></label><button class="page-button page-arrow" data-action="page-next" data-page-key="${esc(key)}" aria-label="หน้าถัดไป" ${disabled(page === totalPages)}>›</button><button class="page-button" data-action="page-last" data-page-key="${esc(key)}" aria-label="หน้าสุดท้าย" ${disabled(page === totalPages)}>หน้าสุดท้าย</button></nav>`;
  }

  function searchableText(row, moduleId) {
    const restrictedPeopleFields = ['phone', 'email', 'lineId'];
    const restrictedOrganizationFields = ['chairAddress','chairPhone','chairEmail','chairLineId','receiverAddress','receiverPhone','receiverEmail','receiverLineId'];
    if (moduleId === 'correspondence') return [row.id,row.name,row.type,row.classification,row.status,row.contact].join(' ').toLocaleLowerCase('th-TH');
    return Object.entries(row).filter(([key]) => moduleId === 'people' ? !restrictedPeopleFields.includes(key) : moduleId === 'organizations' ? !restrictedOrganizationFields.includes(key) : true).map(([, value]) => value).join(' ').toLocaleLowerCase('th-TH');
  }

  function organizationName(id) {
    return MODULES.organizations.rows.find(item => item.id === id)?.name || 'TEST_หน่วยงานไม่พบในทะเบียน';
  }

  function assetBalance(assetId, location) {
    return state.assetMovements.filter(item => item.assetId === assetId && item.location === location).reduce((sum,item)=>sum + item.quantityDelta,0);
  }

  function assetOutstanding(reference) {
    const issued = state.assetMovements.filter(item => item.reference === reference && ['issue','loan'].includes(item.type)).reduce((sum,item)=>sum + Math.abs(item.quantityDelta),0);
    const returned = state.assetMovements.filter(item => item.sourceReference === reference && ['return','loan_return'].includes(item.type)).reduce((sum,item)=>sum + item.quantityDelta,0);
    return Math.max(0,issued - returned);
  }

  function assetInventoryRows() {
    const rows = [];
    MODULES.assets.rows.forEach(asset => {
      const locations = new Set([asset.unit, ...state.assetMovements.filter(item=>item.assetId===asset.id).map(item=>item.location)].filter(Boolean));
      locations.forEach(location => {
        const quantity = assetBalance(asset.id,location);
        if (quantity <= 0 && location !== asset.unit) return;
        const activeCheck = state.assetMaintenance.some(item=>item.assetId===asset.id && item.status==='TEST_รอตรวจสภาพ');
        rows.push({...asset, quantity, unit:location, status:activeCheck ? 'TEST_มีรายการรอตรวจสภาพ' : asset.status, tone:activeCheck ? 'amber' : asset.tone});
      });
    });
    const query = String(state.listSearch.assets || '').trim().toLocaleLowerCase('th-TH');
    return rows.filter(row=>!query || searchableText(row,'assets').includes(query));
  }

  function assetStageRows(stage) {
    if (stage === 'movement') return [...state.assetMovements].slice().reverse();
    if (stage === 'purchase') return [...state.assetPurchases].slice().reverse();
    if (stage === 'receive') return state.assetMovements.filter(item=>['opening','receive'].includes(item.type)).slice().reverse();
    if (stage === 'issue') return state.assetMovements.filter(item=>item.type==='issue').slice().reverse();
    if (stage === 'return') return state.assetMovements.filter(item=>['return','loan_return'].includes(item.type)).slice().reverse();
    if (stage === 'transfer') {
      const grouped = new Map();
      state.assetMovements.filter(item=>['transfer_out','transfer_in'].includes(item.type)).forEach(item=>{
        const group=grouped.get(item.reference)||{id:item.reference,reference:item.reference,assetId:item.assetId,quantity:Math.abs(item.quantityDelta),status:'TEST_บันทึกคู่โอนจำลอง'};
        if(item.type==='transfer_out') group.fromLocation=item.location;
        if(item.type==='transfer_in') group.toLocation=item.location;
        grouped.set(item.reference,group);
      });
      return [...grouped.values()].reverse();
    }
    if (stage === 'loans') return state.assetLoans.map(item=>{const quantity=assetOutstanding(item.reference);return {...item,quantity,status:quantity?'TEST_ยืมคงค้าง':'TEST_คืนครบแล้ว'};}).reverse();
    if (stage === 'maintenance') return [...state.assetMaintenance].slice().reverse();
    if (stage === 'count') return [...state.assetCounts].slice().reverse();
    if (stage === 'disposal') return [...state.assetDisposals].slice().reverse();
    return [];
  }

  function rowsForPage(key) {
    if (key === 'pali') return COURSES.filter(item => item.track === state.courseTrack && (state.courseLevel === 'ทั้งหมด' || item.level === state.courseLevel));
    if (key === 'correspondence') {
      const query = String(state.listSearch.correspondence || '').trim().toLocaleLowerCase('th-TH');
      return MODULES.correspondence.rows.filter(row => {
        const tab = state.correspondenceTab;
        const inTab = tab === 'all'
          || (tab === 'inbox' && row.direction === 'incoming')
          || (tab === 'sent' && row.direction === 'outgoing' && row.status !== 'TEST_ร่าง')
          || (tab === 'drafts' && row.status === 'TEST_ร่าง')
          || (tab === 'notices' && row.direction === 'notice');
        return inTab && (!query || searchableText(row, 'correspondence').includes(query));
      });
    }
    if (key === 'access-assignments') return state.permissionAssignments;
    if (key === 'data-import-preview') return state.dataImport?.rows || [];
    if (key === 'exam-import-preview') return state.import?.rows || [];
    if (key.startsWith('budget-events-')) {
      const stage = key.slice('budget-events-'.length);
      return budgetEventsFor(stage).filter(row => state.budgetPeriod === 'all' || row.period === state.budgetPeriod);
    }
    if (key.startsWith('asset-events-')) {
      const stage = key.slice('asset-events-'.length);
      const query=String(state.listSearch.assets||'').trim().toLocaleLowerCase('th-TH');
      return assetStageRows(stage).filter(row=>!query || searchableText({...row,...(MODULES.assets.rows.find(item=>item.id===row.assetId)||{})},'assets').includes(query));
    }
    if (key === 'assets') return assetInventoryRows();
    const module = MODULES[key];
    if (!module) return [];
    const baseRows = key === 'budget' ? [...module.rows, ...state.budgetDrafts.filter(row => row.stage === 'plan').map(row => ({ id:row.id, name:row.label, type:row.unit, allocatedSatang:row.amountSatang, committedSatang:0, paidSatang:0, status:row.status }))] : module.rows;
    const query = String(state.listSearch[key] || '').trim().toLocaleLowerCase('th-TH');
    return baseRows.filter(row => (key !== 'people' || state.peopleStatus === 'all' || row.changeType === state.peopleStatus)
      && (key !== 'admissions' || state.admissionsScope === 'all' || row.formType.includes(state.admissionsScope))
      && (key !== 'organizations' || state.organizationType === 'all' || row.type === state.organizationType)
      && (key !== 'organizations' || state.organizationProvince === 'all' || row.province === state.organizationProvince)
      && (key !== 'requests' || state.requestsCategory === 'all' || row.category === state.requestsCategory)
      && (key !== 'requests' || state.requestsType === 'all' || row.type === state.requestsType)
      && (key !== 'requests' || state.requestsProvince === 'all' || row.province === state.requestsProvince)
      && (key !== 'requests' || state.requestsStatus === 'all' || row.status === state.requestsStatus)
      && (!query || searchableText(row, key).includes(query)));
  }

  function setPage(key, page) {
    const value = Number.parseInt(page, 10);
    if (!Number.isFinite(value)) return;
    const total = rowsForPage(key).length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    state.pageNumbers[key] = Math.max(1, Math.min(totalPages, value));
    render();
  }

  function homePage() {
    const cards = NAV.filter(item => item.id !== 'home' && item.system !== false).map(item => {
      const module = MODULES[item.id];
      const text = module ? module.description : 'นำเข้ารายชื่อ ตรวจข้อผิดพลาด ดูตัวอย่าง แล้ว commit ในโหมด TEST_';
      return `<article class="system-card panel" role="button" tabindex="0" data-page="${item.id}" aria-label="เปิด ${esc(item.label)}"><div class="system-card-top"><span class="system-card-icon">${item.icon}</span><span class="system-card-number">${item.number}</span></div><h3>${esc(item.label)}</h3><p>${esc(text)}</p><div class="system-card-foot"><span>ข้อมูล TEST_ เท่านั้น</span><b>เปิดระบบ <span aria-hidden="true">→</span></b></div></article>`;
    }).join('');
    pageContent.innerHTML = `${heading('WORKSPACE OVERVIEW', 'ภาพรวมระบบงาน', 'ศูนย์กลางเดียวสำหรับทะเบียน หน่วยงาน การศึกษา การสอบ และงานบริหาร')}<div class="hero"><div class="hero-copy"><span class="hero-tag"><span>✦</span> ONE PORTAL · NINE WORKFLOWS</span><h1>สังฆะพอร์ทัล</h1><p>เชื่อมข้อมูลร่วมกันเป็นแนวทางเดียว ตั้งแต่บุคคลและหน่วยงาน ไปจนถึงการสอบ งบประมาณ พัสดุ และสารบรรณ</p></div><div class="hero-watermark" aria-hidden="true"><span>☸</span></div></div><div class="metric-grid"><div class="panel metric-card"><div class="metric-icon">▦</div><div><div class="metric-value">09</div><div class="metric-label">ระบบงานในพอร์ทัลเดียว</div></div></div><div class="panel metric-card"><div class="metric-icon gold">♙</div><div><div class="metric-value">TEST_</div><div class="metric-label">ระเบียนจำลองเพื่อทดสอบ UI</div></div></div><div class="panel metric-card"><div class="metric-icon blue">◉</div><div><div class="metric-value">00</div><div class="metric-label">ข้อมูลจริงที่เชื่อมต่อ</div></div></div><div class="panel metric-card"><div class="metric-icon sand">⌑</div><div><div class="metric-value">DEMO</div><div class="metric-label">ยังระบบงานยังเป็นแบบจำลอง TEST_งานจริง</div></div></div></div><div class="section-title"><div><h2>ระบบงานของคุณ</h2><p>เลือกเมนูเพื่อดู flow และหน้าจอต้นแบบ</p></div><span class="result-count">9 MODULES</span></div><div class="system-grid">${cards}</div><div class="dashboard-bottom"><section class="panel note-panel"><h3>ขอบเขตต้นแบบ</h3><div class="note-row"><span class="note-bullet">◌</span><div><b>บัญชีและ master data ชุดเดียวในแบบจำลอง</b><p>ยังไม่ได้เชื่อมตัวตน, role/scope, RLS, Storage, audit หรือบริการประมวลผลฝั่ง server</p></div></div><div class="note-row"><span class="note-bullet">◇</span><div><b>รายการอนุมัติ/ผลสอบ/งบ/ลายเซ็นจริง = 0</b><p>workflow ยังเป็นแบบจำลอง ไม่มีผลสอบ อำนาจอนุมัติ หรือลายเซ็นจริง</p></div></div><div class="note-row"><span class="note-bullet">⇧</span><div><b>นำเข้าไฟล์ตัวอย่างได้ในเบราว์เซอร์</b><p>รองรับ preview และ validation ของ TEST_ เท่านั้น; ไม่ส่งไฟล์ขึ้น server</p></div></div></section><aside class="notice-box"><span class="notice-icon">!</span><div><b>ข้อมูลสำหรับตรวจแนวคิดเท่านั้น</b><p>อย่าใส่ข้อมูลบุคคลจริง เอกสารจริง หรือผลสอบจริงในต้นแบบนี้ ก่อนใช้งานต้องให้เจ้าของข้อมูล/ผู้มีอำนาจยืนยันข้อกำหนดและทดสอบสิทธิ์ใน backend</p></div></aside></div>`;
    updateHeader('home');
  }

  function educationPositionCell(row) {
    const roles = educationPositionsOf(row.educationPositions);
    const content = roles.length ? roles.map(esc).join('<br />') : 'TEST_ไม่ระบุ';
    const warning = roles.length > 1 ? `<div><span class="status-pill amber">ตรวจสอบตำแหน่งซ้ำ (${roles.length})</span></div>` : '';
    return `<div class="primary-cell">${content}</div>${warning}`;
  }

  function budgetTotals() {
    const rows = MODULES.budget.rows;
    const total = key => rows.reduce((sum, row) => sum + row[key], 0);
    const allocatedSatang = total('allocatedSatang');
    const committedSatang = total('committedSatang');
    const paidSatang = total('paidSatang');
    return { allocatedSatang, committedSatang, paidSatang, availableSatang: allocatedSatang - committedSatang, unpaidSatang: committedSatang - paidSatang };
  }

  function budgetPlanRows() {
    return rowsForPage('budget').map(row => ({...row, isDraft:row.status === 'TEST_ร่างใน memory · ยังไม่ผ่านการตรวจสอบ'}));
  }

  function budgetEventsFor(stage) {
    return [...(BUDGET_SAMPLE_EVENTS[stage] || []), ...state.budgetDrafts.filter(row => row.stage === stage)];
  }

  function budgetEventRow(row, stage) {
    const amount = Number.isSafeInteger(row.amountSatang) ? `฿ ${money(row.amountSatang)}` : '—';
    const detailAmount = Number.isSafeInteger(row.ledgerSatang) ? `<div class="secondary-cell">ยอดบัญชี TEST_: ฿ ${money(row.ledgerSatang)}</div>` : '';
    const context = row.source && row.destination ? `${row.source} → ${row.destination}` : (row.unit || row.note || 'TEST_ไม่มีรายละเอียด');
    return `<tr><td><div class="primary-cell">${esc(row.id)}</div><div class="secondary-cell">${esc(row.period || 'TEST_ไม่ระบุงวด')}</div></td><td>${esc(context)}${detailAmount}</td><td>${amount}</td><td><span class="status-pill ${String(row.status).includes('ส่วนต่าง') ? 'amber' : 'blue'}">${esc(row.status || 'TEST_ร่างจำลอง')}</span></td><td><button class="row-action" data-action="budget-detail" data-stage="${esc(stage)}" data-row-id="${esc(row.id)}">ดูรายละเอียด</button></td></tr>`;
  }

  function budgetPage() {
    const module = MODULES.budget;
    const totals = budgetTotals();
    updateHeader('budget');
    const stage = BUDGET_STAGES.find(item => item.id === state.budgetTab) || BUDGET_STAGES[0];
    const headingActions = `${button('นำเข้าแผน Excel', 'open-data-import', 'secondary', 'data-module="budget"')}${button('ส่งออกแผน Excel', 'export-xlsx', 'secondary', 'data-module="budget"')}${stage.id === 'overview' ? '' : button(stage.id === 'plan' ? '＋ สร้างแผน TEST_' : '＋ สร้างร่าง TEST_', 'budget-new', 'primary', `data-stage="${esc(stage.id)}"`)}`;
    const stats = [
      ['วงเงินจัดสรร TEST_', totals.allocatedSatang], ['ยอดผูกพัน TEST_', totals.committedSatang],
      ['จ่ายจริง · เป็นส่วนหนึ่งของยอดผูกพัน', totals.paidSatang], ['วงเงินยังไม่ผูกพัน', totals.availableSatang]
    ].map(([label, value]) => `<div class="panel small-stat"><span>${esc(label)}</span><b>฿ ${money(value)}</b></div>`).join('');
    const tabs = BUDGET_STAGES.map(item => `<button class="budget-tab ${state.budgetTab === item.id ? 'active' : ''}" data-action="budget-tab" data-tab="${item.id}" role="tab" aria-selected="${state.budgetTab === item.id}">${esc(item.label)}</button>`).join('');
    const periodSelect = `<label class="budget-filter"><span>ปีงบประมาณ</span><select id="budget-fy" class="select-control" aria-label="ปีงบประมาณ"><option value="TEST_FY_001">TEST_FY_001 · ปีงบประมาณจำลอง</option></select></label>`;
    let content = '';
    if (stage.id === 'overview') {
      const tiles = BUDGET_STAGES.filter(item => item.id !== 'overview').map(item => {
        const count = item.id === 'plan' ? budgetPlanRows().length : budgetEventsFor(item.id).length;
        return `<button class="budget-flow-card" data-action="budget-tab" data-tab="${item.id}"><span class="budget-flow-step">${esc(item.label)}</span><b>${count.toLocaleString('th-TH')} <small>รายการ TEST_</small></b><span class="budget-flow-open">เปิดรายการ →</span></button>`;
      }).join('');
      content = `<section class="panel budget-formula"><div><b>วิธีอ่านยอดรวม</b><p>จัดสรร − ผูกพัน = วงเงินยังไม่ผูกพัน · ผูกพัน − จ่ายจริง = ยอดผูกพันค้างจ่าย</p></div><div class="budget-formula-values"><span>ยังไม่ผูกพัน <b>฿ ${money(totals.availableSatang)}</b></span><span>ค้างจ่ายในยอดผูกพัน <b>฿ ${money(totals.unpaidSatang)}</b></span></div></section><div class="section-title budget-section-title"><div><h2>วงจรบริหารงบประมาณ</h2><p>เลือกขั้นตอนเพื่อดูรายการจำลองและสร้างร่างใน memory</p></div><span class="result-count">8 ขั้นตอน · TEST_</span></div><div class="budget-flow-grid">${tiles}</div>`;
    } else if (stage.id === 'plan') {
      const allPlans = budgetPlanRows();
      const page = pageSlice('budget', allPlans);
      const rows = page.rows.map(row => {
        const available = row.allocatedSatang - row.committedSatang;
        const unpaid = row.committedSatang - row.paidSatang;
        return `<tr><td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.id)} · ${esc(row.sub || 'TEST_ร่างใน memory')}</div></td><td>${esc(row.type)}</td><td>฿ ${money(row.allocatedSatang)}</td><td>฿ ${money(row.committedSatang)}</td><td>฿ ${money(row.paidSatang)}</td><td>฿ ${money(available)}</td><td>฿ ${money(unpaid)}</td><td><span class="status-pill ${row.isDraft ? 'amber' : 'blue'}">${esc(row.status || 'TEST_รายการจำลอง')}</span></td></tr>`;
      }).join('');
      content = `<section class="panel table-panel"><div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">แผนและการจัดสรร · TEST_</span><span class="result-count">${allPlans.length} รายการจำลอง</span></div><div class="table-tools-right">${periodSelect}</div></div><div class="table-wrap"><table class="budget-table"><thead><tr><th>แผน / รหัส</th><th>หน่วยงาน</th><th>จัดสรร</th><th>ผูกพันรวม</th><th>จ่ายจริง¹</th><th>ยังไม่ผูกพัน</th><th>ค้างจ่ายตามผูกพัน</th><th>สถานะตัวอย่าง</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-footer"><span>¹ ยอดจ่ายเป็นส่วนหนึ่งของยอดผูกพัน</span><span>TEST_FIXTURE · ไม่ใช่งบประมาณจริง</span>${paginationControls('budget', allPlans.length)}</div></section><div class="callout warn"><span>ⓘ</span><div>ยอดเงินในตารางเป็นสตางค์จำนวนเต็มในแบบจำลอง; ห้ามนำยอดจ่ายจริงไปหักจากวงเงินซ้ำกับยอดผูกพัน</div></div>`;
    } else {
      const allRows = budgetEventsFor(stage.id);
      const filteredRows = allRows.filter(row => state.budgetPeriod === 'all' || row.period === state.budgetPeriod);
      const pageKey = `budget-events-${stage.id}`;
      const page = pageSlice(pageKey, filteredRows);
      const rows = page.rows;
      const periodOptions = [...new Set(allRows.map(row => row.period).filter(Boolean))];
      const periodFilter = `<label class="budget-filter"><span>งวด</span><select id="budget-period-filter" class="select-control" aria-label="กรองงวด"><option value="all" ${state.budgetPeriod === 'all' ? 'selected' : ''}>ทุกงวด TEST_</option>${periodOptions.map(period => `<option value="${esc(period)}" ${state.budgetPeriod === period ? 'selected' : ''}>${esc(period)}</option>`).join('')}</select></label>`;
      const body = rows.map(row => budgetEventRow(row, stage.id)).join('') || `<tr><td colspan="5"><div class="no-results">ไม่มีรายการในงวดที่เลือก</div></td></tr>`;
      const stageGuidance = {
        transfer:'แสดงต้นทางและปลายทางเพื่อทดสอบการโอนแบบสมดุล; ไม่มีการเปลี่ยนวงเงินจริง',
        commitment:'ยอดผูกพันใช้ติดตามภาระผูกพัน; การกันวงเงินจริงและผู้ตรวจยัง TO VERIFY',
        disbursement:'รายการจ่ายทดสอบต้องเชื่อมยอดผูกพัน; ไม่ถือเป็นหลักฐานการจ่ายจริง',
        refund:'รายการคืนเงินรอตรวจไม่ลดค่าใช้จ่ายหรือเพิ่มวงเงินจนกว่าจะมีกติกาและหลักฐานจริง',
        reconcile:'แสดงยอดสองฝั่งเพื่อทดสอบส่วนต่าง; ไม่ใช่การกระทบยอดบัญชีจริง',
        close:'หน้าปิดงวดเป็นเพียงรายการตรวจความพร้อม; ไม่มีการ lock หรือปิดงวดจริง'
      }[stage.id];
      content = `<section class="panel table-panel"><div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">${esc(stage.label)} · TEST_</span><span class="result-count">${filteredRows.length} รายการจำลอง</span></div><div class="table-tools-right">${periodFilter}</div></div><div class="table-wrap"><table class="budget-table"><thead><tr><th>เลขอ้างอิง / งวด</th><th>รายการ / หน่วยงาน</th><th>ยอด TEST_</th><th>สถานะจำลอง</th><th>รายละเอียด</th></tr></thead><tbody>${body}</tbody></table></div><div class="table-footer"><span>ทุกสถานะเป็น TEST_ เพื่อทดสอบหน้าจอ</span><span>ไม่มีรายการอนุมัติหรือปิดงวดจริง</span>${paginationControls(pageKey, filteredRows.length)}</div></section><div class="callout warn"><span>ⓘ</span><div>${esc(stageGuidance)}</div></div>`;
    }
    pageContent.innerHTML = `${heading(module.eyebrow, module.title, module.description, headingActions)}<div class="budget-period-banner">${periodSelect}<span class="status-pill amber">ข้อมูลทั้งหมด TEST_ · ไม่มีการเชื่อมต่อระบบการเงินจริง</span></div><div class="module-stats budget-stats">${stats}</div><div class="budget-tabs" role="tablist" aria-label="ขั้นตอนบริหารงบประมาณ">${tabs}</div>${content}<div class="muted-panel"><div class="callout warn"><span aria-hidden="true">ⓘ</span><div>ต้นแบบนี้ไม่บันทึกเงินหรือคำอนุมัติจริง; ก่อนใช้งานต้องยืนยันแหล่งเงิน ผังบัญชี ผู้มีอำนาจและ maker-checker ขอบเขต role/scope วันมีผล การตรวจเอกสาร การเชื่อมระบบบัญชี การกระทบยอด และวิธีแก้ไข/เปิดงวดจากเจ้าของนโยบาย</div></div></div>`;
  }

  function assetTotals() {
    const inventory=assetInventoryRows();
    return {
      masterCount:MODULES.assets.rows.length,
      onHand:inventory.reduce((sum,row)=>sum+row.quantity,0),
      outstandingLoans:state.assetLoans.reduce((sum,item)=>sum+assetOutstanding(item.reference),0),
      maintenanceCount:state.assetMaintenance.filter(item=>item.status==='TEST_รอตรวจสภาพ').length
    };
  }

  function assetLocationRows() {
    return ASSET_LOCATIONS.map(location=>`<option value="${esc(location)}">${esc(location)}</option>`).join('');
  }

  function assetRecordDetail(stage,rowId) {
    let row;
    if(stage==='inventory') row=assetInventoryRows().find(item=>`${item.id}@${item.unit}`===rowId);
    else row=assetStageRows(stage).find(item=>String(item.id)===String(rowId)||String(item.reference)===String(rowId));
    if(!row) return;
    const asset=MODULES.assets.rows.find(item=>item.id===row.assetId)||row;
    const details=stage==='movement'
      ? [['รายการ movement',ASSET_MOVEMENT_LABELS[row.type]||'TEST_ไม่ทราบประเภท'],['จำนวนเปลี่ยนแปลง',`${row.quantityDelta>0?'+':''}${row.quantityDelta} หน่วย`],['คลัง/หน่วยงาน',row.location],['อ้างอิงคู่/ต้นทาง',row.counterpartLocation||row.sourceReference||'TEST_ไม่มี'],['หมายเหตุ',row.note]]
      : stage==='inventory'
        ? [['ยอดคงเหลือ',`${row.quantity} หน่วย`],['คลัง/หน่วยงาน',row.unit],['movement ล่าสุด',state.assetMovements.filter(item=>item.assetId===row.id&&item.location===row.unit).slice(-5).reverse().map(item=>`${ASSET_MOVEMENT_LABELS[item.type]} ${item.quantityDelta>0?'+':''}${item.quantityDelta} · ${item.reference}`).join(' | ')||'TEST_ไม่มี movement'],['สถานะ',row.status]]
      : stage==='transfer'
        ? [['จำนวน',`${row.quantity} หน่วย`],['ต้นทาง',row.fromLocation],['ปลายทาง',row.toLocation],['สถานะ',row.status]]
        : stage==='count'
          ? [['ยอดตาม movement',`${row.expected} หน่วย`],['ยอดตรวจนับ',`${row.counted} หน่วย`],['ส่วนต่าง',`${row.variance} หน่วย`],['สถานะ',row.status],['ผลต่อยอดคงเหลือ','TEST_ไม่มีการปรับยอด']]
          : stage==='maintenance'
            ? [['คลัง/หน่วยงาน',row.location],['สถานะ',row.status],['ผลต่อยอดคงเหลือ','TEST_ไม่เปลี่ยนยอดสต็อก'],['หมายเหตุ',row.note]]
              : stage==='purchase'
                ? [['รหัสแผนงบ System 06',row.budgetReference],['จำนวนที่เสนอ',`${row.quantity} หน่วย`],['สถานะ',row.status],['ผลต่อยอดคงเหลือ','TEST_ไม่มีผลต่อ stock และไม่ใช่การผูกพันงบ'],['หมายเหตุ',row.note]]
            : stage==='disposal'
              ? [['จำนวนที่เสนอ',`${row.quantity} หน่วย`],['คลัง/หน่วยงาน',row.location],['สถานะ',row.status],['ผลต่อยอดคงเหลือ','TEST_ไม่ตัดยอดจนกว่าจะมีหลักเกณฑ์และผลอนุมัติจริง'],['หมายเหตุ',row.note]]
              : [['จำนวน',`${row.quantity??Math.abs(row.quantityDelta||0)} หน่วย`],['คลัง/หน่วยงาน',row.location||`${row.fromLocation||''} → ${row.toLocation||''}`],['สถานะ',row.status||'TEST_บันทึกจำลอง'],['อ้างอิง',row.reference||row.id],['หมายเหตุ',row.note]];
    const content=`<div class="profile-section"><h3>ข้อมูลรายการ TEST_</h3>${[['รหัสพัสดุ',asset.id],['รายการ',asset.name],['ประเภท',asset.type],...details].map(([label,value])=>`<div class="note-row"><div><b>${esc(label)}</b><p>${esc(value??'TO VERIFY')}</p></div></div>`).join('')}</div><div class="callout warn"><span>ⓘ</span><div>ข้อมูลนี้เป็น TEST_ ในพื้นที่ข้อมูล TEST_ เท่านั้น รายละเอียดหรือการบันทึกในต้นแบบไม่ใช่หลักฐานรับพัสดุ อนุมัติ ซ่อม หรือจำหน่าย</div></div>`;
    openModal({title:`รายละเอียดพัสดุ · ${asset.name}`,subtitle:`ระบบ 07 · ${stage.toUpperCase()} · ${row.reference||row.id}`,body:content,confirmText:'ปิด'});
  }

  function assetEventRow(row,stage) {
    const asset=MODULES.assets.rows.find(item=>item.id===row.assetId)||{};
    let kind=ASSET_MOVEMENT_LABELS[row.type]||'TEST_รายการจำลอง';
    let amount=Number.isSafeInteger(row.quantityDelta)?`${row.quantityDelta>0?'+':''}${row.quantityDelta} หน่วย`:Number.isSafeInteger(row.quantity)?`${row.quantity} หน่วย`:'';
    let location=row.location||'';
    if(stage==='transfer') { kind='TEST_โอนภายใน'; amount=`${row.quantity} หน่วย`; location=`${row.fromLocation||'TO VERIFY'} → ${row.toLocation||'TO VERIFY'}`; }
    if(stage==='count') { kind='TEST_ตรวจนับ'; amount=`ตาม movement ${row.expected} · นับได้ ${row.counted} · ต่าง ${row.variance}`; }
    if(stage==='maintenance') kind='TEST_บันทึกซ่อม/ตรวจสภาพ';
    if(stage==='disposal') kind='TEST_คำขอจำหน่าย';
    if(stage==='purchase') { kind='TEST_คำขอจัดซื้อ'; amount=`${row.quantity} หน่วย`; location=row.budgetReference; }
    if(stage==='loans') kind=row.status==='TEST_ยืมคงค้าง'?'TEST_ยืมคงค้าง':'TEST_คืนยืม';
    const context=stage==='movement'&&row.counterpartLocation?`${location} · ${row.counterpartLocation}`:location;
    const reference=row.reference||row.id;
    return `<tr data-row="${esc([reference,asset.name,kind,context,row.status,row.note].join(' '))}"><td><div class="primary-cell">${esc(reference)}</div><div class="secondary-cell">${esc(kind)}</div></td><td><div class="primary-cell">${esc(asset.name||'TEST_ไม่พบทะเบียน')}</div><div class="secondary-cell">${esc(row.assetId||'')}</div></td><td>${esc(amount||'—')}</td><td>${esc(context||'TO VERIFY')}</td><td><span class="status-pill ${String(row.status||'').includes('รอ')?'amber':'blue'}">${esc(row.status||'TEST_บันทึกจำลอง')}</span></td><td><button class="row-action" data-action="asset-detail" data-stage="${esc(stage)}" data-row-id="${esc(row.id||reference)}">ดูรายละเอียด</button></td></tr>`;
  }

  function assetPage() {
    const module=MODULES.assets;
    updateHeader('assets');
    const totals=assetTotals();
    const stage=ASSET_STAGES.find(item=>item.id===state.assetTab)||ASSET_STAGES[0];
    const stageCanCreate=!['inventory','movement'].includes(stage.id);
    const headingActions=`${button('นำเข้าทะเบียน Excel','open-data-import','secondary','data-module="assets"')}${button('ส่งออกทะเบียน Excel','export-xlsx','secondary','data-module="assets"')}${button('ส่งออก Stock card CSV','asset-export-movements','secondary')}${stageCanCreate?button(`＋ บันทึก${stage.label} TEST_`,'asset-new','primary',`data-stage="${esc(stage.id)}"`):''}`;
    const stats=[['ทะเบียนรายการ TEST_',totals.masterCount],['คงเหลือรวมจาก movement',`${totals.onHand} หน่วย`],['ยืมคงค้าง TEST_',`${totals.outstandingLoans} หน่วย`],['ซ่อม/ตรวจสภาพ TEST_',totals.maintenanceCount]].map(([label,value])=>`<div class="panel small-stat"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('');
    const tabs=ASSET_STAGES.map(item=>`<button class="budget-tab ${state.assetTab===item.id?'active':''}" data-action="asset-tab" data-tab="${item.id}" role="tab" aria-selected="${state.assetTab===item.id}">${esc(item.label)}</button>`).join('');
    let body='',footer='',tableTitle='';
    if(stage.id==='inventory'){
      const allRows=assetInventoryRows();
      const page=pageSlice('assets',allRows);
      const rows=page.rows.map(row=>`<tr data-row="${esc(searchableText(row,'assets'))}"><td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.id)}</div></td><td>${esc(row.type)}</td><td><b class="asset-quantity">${esc(row.quantity)} หน่วย</b></td><td>${esc(row.unit)}</td><td><span class="status-pill ${esc(row.tone||'')} ">${esc(row.status)}</span></td><td><button class="row-action" data-action="asset-detail" data-stage="inventory" data-row-id="${esc(`${row.id}@${row.unit}`)}">ดู Stock card</button></td></tr>`).join('')||'<tr><td colspan="6" class="no-results">ไม่พบรายการตามคำค้น</td></tr>';
      tableTitle='ทะเบียนและยอดคงเหลือ TEST_';
      body=`<div class="table-wrap"><table class="asset-table"><thead><tr><th>รายการ / รหัส</th><th>ประเภท</th><th>ยอดคงเหลือ</th><th>คลัง / หน่วยงาน</th><th>สถานะ</th><th>ประวัติ</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      footer=`<div class="table-footer"><span>ยอดแสดงจาก movement เท่านั้น · TEST_FIXTURE</span>${paginationControls('assets',allRows.length)}</div>`;
    }else{
      const pageKey=`asset-events-${stage.id}`;
      const allRows=rowsForPage(pageKey);
      const page=pageSlice(pageKey,allRows);
      const rows=page.rows.map(row=>assetEventRow(row,stage.id)).join('')||'<tr><td colspan="6" class="no-results">ไม่มีรายการจำลองในขั้นตอนนี้</td></tr>';
      tableTitle=`${stage.label} · TEST_`;
      body=`<div class="table-wrap"><table class="asset-table"><thead><tr><th>อ้างอิง / ประเภท</th><th>รายการพัสดุ</th><th>จำนวน/ผล</th><th>คลัง/ปลายทาง</th><th>สถานะจำลอง</th><th>รายละเอียด</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      footer=`<div class="table-footer"><span>บันทึกแบบจำลองเท่านั้น · ไม่มีการอนุมัติหรือออกเอกสารจริง</span>${paginationControls(pageKey,allRows.length)}</div>`;
    }
    const newNote=stageCanCreate?`<p class="asset-stage-note">บันทึกข้อมูลทดสอบสำหรับขั้นตอน “${esc(stage.label)}” ใน memory เท่านั้น</p>`:'';
    pageContent.innerHTML=`${heading(module.eyebrow,module.title,module.description,headingActions)}<div class="budget-period-banner"><span class="status-pill amber">TEST_ เท่านั้น · stock จาก movement · workflow TEST_</span><span class="result-count">คลังกลาง/คลังย่อย · ${totals.masterCount} ทะเบียน</span></div><div class="module-stats budget-stats asset-stats">${stats}</div><div class="budget-tabs asset-tabs" role="tablist" aria-label="งานบริหารพัสดุและครุภัณฑ์">${tabs}</div><section class="panel table-panel"><div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">${esc(tableTitle)}</span><span class="result-count">${rowsForPage(stage.id==='inventory'?'assets':`asset-events-${stage.id}`).length.toLocaleString('th-TH')} รายการ</span></div><div class="table-tools-right"><label class="field-search"><span>⌕</span><input type="search" class="module-search" placeholder="ค้นรหัส/รายการ TEST_" aria-label="ค้นหาพัสดุ TEST_" value="${esc(state.listSearch.assets||'')}" /></label></div></div>${body}${footer}</section>${newNote}<div class="callout warn"><span>ⓘ</span><div>${esc(module.callout)}<br/>การยืนยันในหน้าต้นแบบเป็นเพียงการทดลองบันทึก ไม่ใช่ maker-checker หรือผลอนุมัติจริง; ก่อนใช้งานต้องยืนยันเจ้าของข้อมูล บทบาท/ขอบเขต ผู้มีอำนาจ เอกสาร หลักเกณฑ์บัญชี/พัสดุ และการเชื่อม System 06/08</div></div>`;
  }

  function tableMarkup(rows, columns, moduleId) {
    const body = rows.map(row => {
      const cells = moduleId === 'budget'
        ? `<td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.sub)} · ${esc(row.type)}</div></td><td>฿ ${money(row.allocatedSatang)}</td><td>฿ ${money(row.committedSatang)}</td><td>฿ ${money(row.paidSatang)}</td><td><span class="primary-cell">฿ ${money(row.allocatedSatang - row.committedSatang)}</span></td>`
        : moduleId === 'assets'
          ? `<td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.id)}</div></td><td>${esc(row.type)}</td><td><span class="primary-cell">${esc(row.quantity)} หน่วย</span></td><td>${esc(row.unit)}</td><td><span class="status-pill ${esc(row.tone || '')}">${esc(row.status)}</span></td>`
          : moduleId === 'people'
            ? `<td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.id)}</div></td><td>${esc(row.type)}</td><td><div class="primary-cell">${esc(row.governancePosition || 'TEST_ไม่ระบุตำแหน่ง')}</div></td><td>${educationPositionCell(row)}<div class="secondary-cell">${esc(row.section || 'TEST_ไม่ระบุแท่ง/แผนก')}</div></td><td><div class="primary-cell">${esc(row.office)}</div><div class="secondary-cell">${esc([row.temple, row.subdistrict, row.district, row.province, row.sanghaRegion].join(' · '))}</div></td><td><span class="status-pill ${esc(row.tone || '')}">${esc(row.changeType)}</span><div class="secondary-cell">${esc(row.status)}</div></td>`
            : moduleId === 'organizations'
              ? `<td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.id)}</div></td><td>${esc(row.type)}</td><td><div class="primary-cell">${esc(row.address || 'TO VERIFY')}</div><div class="secondary-cell">${esc([row.subdistrict,row.district,row.province,row.postalCode].filter(Boolean).join(' · ') || row.unit)}</div></td><td>${row.examType ? `<span class="primary-cell">${esc(row.examType)}</span><div class="secondary-cell">${esc(row.examSessionLabel || row.examSessionId)}</div>` : '<span class="secondary-cell">ไม่ใช่สนามสอบ</span>'}</td><td>${row.chairName ? `<div class="primary-cell">${esc(row.chairName)}</div><div class="secondary-cell">${esc(row.chairTitle || 'TEST_ประธานสนามสอบ')}</div>` : '<span class="secondary-cell">TO VERIFY</span>'}</td><td>${row.receiverName ? `<div class="primary-cell">${esc(row.receiverName)}</div><div class="secondary-cell">${esc(row.receiverTitle || 'TEST_ผู้รับข้อสอบ')}</div>` : '<span class="secondary-cell">TO VERIFY</span>'}</td><td><span class="status-pill ${esc(row.tone || '')}">${esc(row.status)}</span></td>`
              : moduleId === 'requests'
                ? `<td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.sub)}</div></td><td>${esc(row.type)}</td><td>${esc(row.category)}</td><td><div class="primary-cell">${esc(row.target)}</div><div class="secondary-cell">${esc(row.unit)}</div></td><td>${esc(row.province)}</td><td><span class="status-pill ${esc(row.tone || '')}">${esc(row.status)}</span><div class="secondary-cell">${esc(row.currentStep || 'TO VERIFY')}</div></td>`
                : moduleId === 'admissions'
                  ? `<td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.id)}</div></td><td>${esc(row.applicantKind)}</td><td>${esc(row.paliTrack)}</td><td>${esc(row.level)}</td><td>${esc(row.formType)}</td><td>${esc(row.unit)}</td><td>${esc(row.examSessionId)}</td><td><span class="status-pill ${esc(row.tone || '')}">${esc(row.status)}</span></td>`
                  : `<td><div class="primary-cell">${esc(row.name)}</div><div class="secondary-cell">${esc(row.sub)}</div></td><td>${esc(row.type)}</td><td>${esc(row.unit)}</td><td>${esc(row.contact)}</td><td><span class="status-pill ${esc(row.tone || '')}">${esc(row.status)}</span></td>`;
      const searchText = searchableText(row, moduleId);
      return `<tr data-row="${esc(searchText)}">${cells}<td><div class="row-actions"><button class="row-action" data-action="view-row" data-row-id="${esc(row.id)}" data-module="${esc(moduleId)}">ดูรายละเอียด</button></div></td></tr>`;
    }).join('');
    return `<div class="table-wrap"><table><thead><tr>${columns.map(col => `<th>${esc(col)}</th>`).join('')}</tr></thead><tbody>${body || `<tr><td colspan="${columns.length}" class="no-results">ไม่พบรายการตามคำค้น</td></tr>`}</tbody></table></div>`;
  }

  function correspondenceAudit(documentId, actionName) {
    const sequence = state.correspondenceAudit.length + 1;
    state.correspondenceAudit.push({
      id:`TEST_CORR_AUDIT_${String(sequence).padStart(3,'0')}`,
      documentId, actorId:'TEST_USER_001', action:`TEST_${actionName}`, sequence
    });
  }

  function resetCorrespondenceDemo() {
    MODULES.correspondence.rows.splice(0, MODULES.correspondence.rows.length, ...CORRESPONDENCE_TEST_FIXTURE.map(row=>({...row})));
    state.correspondenceAudit = [];
    state.correspondenceTab = 'all';
    state.listSearch.correspondence = '';
    state.pageNumbers.correspondence = 1;
  }

  function correspondencePage() {
    const module = MODULES.correspondence;
    const allRows = rowsForPage('correspondence');
    state.currentRows = allRows;
    const page = pageSlice('correspondence', allRows);
    const waiting = MODULES.correspondence.rows.filter(row => row.direction === 'incoming' && row.status === 'TEST_รอรับจำลอง').length;
    const drafts = MODULES.correspondence.rows.filter(row => row.status === 'TEST_ร่าง').length;
    const stats = [
      ['เอกสารในชุด TEST_', MODULES.correspondence.rows.length],
      ['รอรับทราบ TEST_', waiting],
      ['ร่างใน memory', drafts],
      ['เลขทะเบียน/ลายเซ็นจริง', '0']
    ].map(([label,value]) => `<div class="panel small-stat"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('');
    const tabs = CORRESPONDENCE_TABS.map(tab => {
      const count = rowsForPageCountForCorrespondenceTab(tab.id);
      return `<button class="budget-tab ${state.correspondenceTab === tab.id ? 'active' : ''}" role="tab" aria-selected="${state.correspondenceTab === tab.id}" data-action="correspondence-tab" data-tab="${tab.id}">${esc(tab.label)} <small>${count}</small></button>`;
    }).join('');
    const bodyRows = page.rows.map(row => {
      const restricted = row.classification !== 'TEST_ทั่วไป';
      const subject = restricted ? 'TEST_เอกสารจำกัดสิทธิ์' : row.name;
      const scopeClass = row.classification === 'TEST_ลับจำลอง' ? 'red' : restricted ? 'amber' : '';
      const sender = organizationName(row.senderOrganizationId);
      const recipient = organizationName(row.recipientOrganizationId);
      const actions = [button('รายละเอียด','correspondence-detail','quiet',`data-document-id="${esc(row.id)}"`),
        row.status === 'TEST_ร่าง' && row.direction === 'outgoing' ? button('ส่งเข้ากล่องตัวอย่าง','correspondence-send','secondary',`data-document-id="${esc(row.id)}"`) : '',
        row.direction === 'incoming' && row.status === 'TEST_รอรับจำลอง' ? button('รับทราบ TEST_','correspondence-ack','secondary',`data-document-id="${esc(row.id)}"`) : ''
      ].join('');
      const searchable = esc(searchableText(row,'correspondence'));
      return `<tr data-row="${searchable}"><td><div class="primary-cell">${esc(row.id)}</div><div class="secondary-cell">${row.direction === 'incoming' ? 'กล่องรับ' : row.direction === 'notice' ? 'แจ้งงาน' : 'กล่องส่ง'}</div></td><td><div class="primary-cell">${esc(subject)}</div><div class="secondary-cell">${restricted ? 'ซ่อนรายละเอียดตามชั้นข้อมูลตัวอย่าง' : esc(row.sub)}</div></td><td>${esc(row.type)}</td><td><span class="status-pill ${scopeClass}">${esc(row.classification)}</span></td><td><div class="primary-cell">${esc(sender)}</div><div class="secondary-cell">ถึง ${esc(recipient)}</div></td><td><span class="status-pill ${esc(row.tone || '')}">${esc(row.status)}</span></td><td><div class="row-actions">${actions}</div></td></tr>`;
    }).join('');
    const firstRow = allRows.length ? page.start + 1 : 0;
    const lastRow = Math.min(page.start + PAGE_SIZE, allRows.length);
    const search = `<label class="field-search"><span>⌕</span><input type="search" class="module-search" placeholder="ค้นรหัส/เรื่อง TEST_" aria-label="ค้นเอกสาร TEST_" value="${esc(state.listSearch.correspondence || '')}" /></label>`;
    const rows = bodyRows || `<tr><td colspan="7" class="no-results">ไม่พบรายการในกล่องนี้</td></tr>`;
    const workflow = [
      ['01','ร่างและจัดทำ','ผู้จัดทำ · บันทึกร่าง TEST_'],
      ['02','ตรวจทานและเสนอ','ลำดับ/บทบาทรอยืนยัน'],
      ['03','ลงนาม','ผู้มีอำนาจและบริการลงนามรอยืนยัน'],
      ['04','ออกเลขทะเบียน','เลขรับ/ส่งและช่วงเลขรอยืนยัน'],
      ['05','ส่งและรับ','ใน prototype เป็นสถานะจำลองเท่านั้น'],
      ['06','เก็บและค้นย้อนหลัง','สิทธิ์/อายุเก็บรักษารอยืนยัน']
    ].map(([step,title,detail]) => `<div class="corr-process-step"><span>${step}</span><b>${esc(title)}</b><small>${esc(detail)}</small></div>`).join('');
    pageContent.innerHTML = `${heading(module.eyebrow,module.title,module.description,button('จดหมายเวียนออนไลน์ TEST_','correspondence-mail-merge','secondary') + button('<span>＋</span>ร่างหนังสือ TEST_','new-correspondence','primary'))}
      <div class="corr-boundary"><b>ต้นแบบ TEST_ เท่านั้น</b><span>ยังไม่ส่งหนังสือจริง · ยังไม่มีสิทธิ์รายงานฝั่ง server · ไม่รับไฟล์จริง · ไม่มีเลขทะเบียนหรือการลงนามจริง</span></div>
      <div class="module-stats corr-stats">${stats}</div>
      <section class="panel corr-workflow"><div class="corr-section-head"><div><p class="eyebrow">DOCUMENT LIFECYCLE · DRAFT</p><h2>เส้นทางเอกสารที่ต้องยืนยันกับหน่วยงาน</h2></div><span class="status-pill amber">TO VERIFY</span></div><div class="corr-process-grid">${workflow}</div></section>
      <div class="budget-tabs corr-tabs" role="tablist" aria-label="กล่องงานสารบรรณ">${tabs}</div>
      <section class="panel table-panel"><div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">${esc(CORRESPONDENCE_TABS.find(tab=>tab.id===state.correspondenceTab)?.label || 'เอกสารทั้งหมด')}</span><span class="result-count">${allRows.length.toLocaleString('th-TH')} รายการ TEST_</span></div><div class="table-tools-right">${search}</div></div><div class="table-wrap"><table class="corr-table"><thead><tr>${module.columns.map(col=>`<th>${esc(col)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="table-footer"><span>แสดง ${firstRow}–${lastRow} จาก ${allRows.length.toLocaleString('th-TH')} รายการ · ข้อมูลอยู่ใน memory จน reload</span>${paginationControls('correspondence',allRows.length)}</div></section>
      <div class="corr-bottom-grid"><section class="panel corr-note"><h3>ไฟล์และความลับ</h3><p>ช่องแนบในแบบร่างรับเฉพาะชื่อไฟล์ TEST_ เพื่อสาธิต metadata; ไม่มีการอ่านหรือส่งไฟล์จริง การเปิด/ดาวน์โหลดเอกสารลับต้องตรวจสิทธิ์ role + scope ที่ server, Storage และก่อนส่งมอบไฟล์ทุกครั้ง</p></section><section class="panel corr-note"><h3>การรับทราบและหลักฐาน</h3><p>ปุ่มส่ง/รับทราบเปลี่ยนสถานะ TEST_ ใน browser เท่านั้น ไม่แจ้งอีเมล/LINE และไม่เท่ากับการรับหนังสือ การอนุมัติ หรือลงนาม ระบบจริงต้องมี audit, revision, idempotency, transaction และการถอนสิทธิ์/ไฟล์ตามนโยบาย</p></section></div>`;
  }

  function rowsForPageCountForCorrespondenceTab(tabId) {
    return MODULES.correspondence.rows.filter(row => tabId === 'all'
      || (tabId === 'inbox' && row.direction === 'incoming')
      || (tabId === 'sent' && row.direction === 'outgoing' && row.status !== 'TEST_ร่าง')
      || (tabId === 'drafts' && row.status === 'TEST_ร่าง')
      || (tabId === 'notices' && row.direction === 'notice')).length;
  }

  function correspondenceDraftForm() {
    const orgs = MODULES.organizations.rows.filter(item => item.id.startsWith('TEST_ORG_'));
    const orgOptions = orgs.map(item=>`<option value="${esc(item.id)}">${esc(item.name)} · ${esc(item.id)}</option>`).join('');
    const body = `<form class="demo-form" id="correspondence-draft-form">
      <div class="form-field full"><label for="corr-subject">เรื่องเอกสาร TEST_ *</label><input id="corr-subject" name="subject" required placeholder="TEST_เรื่อง" autocomplete="off" /></div>
      <div class="form-field"><label for="corr-type">ประเภทเอกสาร *</label><select id="corr-type" name="type" required><option value="TEST_หนังสือภายใน">หนังสือภายใน</option><option value="TEST_หนังสือส่งออก">หนังสือส่งออก</option><option value="TEST_แจ้งงานออนไลน์">แจ้งงานออนไลน์</option></select></div>
      <div class="form-field"><label for="corr-classification">ชั้นข้อมูลตัวอย่าง *</label><select id="corr-classification" name="classification" required><option value="TEST_ทั่วไป">ทั่วไป (TEST_)</option><option value="TEST_จำกัดผู้รับ">จำกัดผู้รับ (TEST_)</option><option value="TEST_ลับจำลอง">ลับจำลอง (TEST_)</option></select></div>
      <div class="form-field"><label for="corr-sender">หน่วยงานต้นทางจากทะเบียนร่วม *</label><select id="corr-sender" name="senderOrganizationId" required>${orgOptions}</select></div>
      <div class="form-field"><label for="corr-recipient">หน่วยงานผู้รับจากทะเบียนร่วม *</label><select id="corr-recipient" name="recipientOrganizationId" required>${orgOptions}</select></div>
      <div class="form-field"><label for="corr-urgency">ความเร่งด่วนตัวอย่าง</label><select id="corr-urgency" name="urgency"><option value="TEST_ปกติ">ปกติ (TEST_)</option><option value="TEST_เร่งด่วน">เร่งด่วน (TEST_)</option></select></div>
      <div class="form-field"><label for="corr-attachment">รหัส/ชื่อไฟล์ TEST_ (ไม่อัปโหลด)</label><input id="corr-attachment" name="attachmentLabel" placeholder="TEST_FILE_001.pdf" /></div>
      <div class="form-field full"><label for="corr-summary">ข้อความสรุป TEST_ *</label><textarea id="corr-summary" name="summary" required placeholder="TEST_ข้อความตัวอย่าง"></textarea></div>
    </form><div class="modal-hint">ข้อมูลต้องเป็น TEST_ และร่างนี้อยู่ใน memory ของ browser เท่านั้น รายชื่อหน่วยงานเลือกจาก System 02; ไม่แนบ/เปิดไฟล์จริง และยังไม่มีการจัดเลข ลงนาม หรือส่งออกนอกตัวอย่าง</div>`;
    openModal({ title:'สร้างร่างสารบรรณ TEST_', subtitle:'ระบบ 08 · TEST_FIXTURE', body, confirmText:'บันทึกร่าง TEST_', cancelText:'ยกเลิก', onConfirm:() => {
      const form = modalRoot.querySelector('#correspondence-draft-form');
      if (!form) return false;
      const values = Object.fromEntries([...form.querySelectorAll('input,select,textarea')].map(control => [control.name, String(control.value || '').trim()]));
      const required = ['subject','type','classification','senderOrganizationId','recipientOrganizationId','summary'];
      if (required.some(key=>!values[key]) || required.some(key=>!values[key].startsWith('TEST_')) || (values.attachmentLabel && !values.attachmentLabel.startsWith('TEST_'))) {
        showToast('ช่องบังคับและข้อมูลแนบต้องใช้ TEST_ เท่านั้น', true); return false;
      }
      const sender = orgs.find(item=>item.id===values.senderOrganizationId);
      const recipient = orgs.find(item=>item.id===values.recipientOrganizationId);
      if (!sender || !recipient) { showToast('เลือกหน่วยงานจากทะเบียน TEST_ ที่มีอยู่เท่านั้น', true); return false; }
      const sequence = MODULES.correspondence.rows.filter(row=>row.id.startsWith('TEST_DOC_')).length + 1;
      const id = `TEST_DOC_${String(sequence).padStart(3,'0')}`;
      const row = { id, name:values.subject, sub:'TEST_ร่างในพื้นที่ข้อมูล TEST_ · ไม่มีผลบังคับ', type:values.type,
        unit:values.classification, contact:recipient.name, status:'TEST_ร่าง', tone:'amber', direction:'outgoing',
        classification:values.classification, senderOrganizationId:sender.id, recipientOrganizationId:recipient.id,
        summary:values.summary, attachmentLabel:values.attachmentLabel || 'TEST_ไม่มีไฟล์แนบ', urgency:values.urgency || 'TEST_ปกติ' };
      MODULES.correspondence.rows.unshift(row);
      state.correspondenceTab='drafts'; state.listSearch.correspondence=''; state.pageNumbers.correspondence=1;
      correspondenceAudit(id,'สร้างร่าง');
      render(); showToast('บันทึกร่างสารบรรณ TEST_ และรอบันทึกขึ้น Supabase แล้ว'); return true;
    }});
  }

  function correspondenceMailMergeOrganizations() {
    return MODULES.organizations.rows.filter(item => typeof item.id === 'string' && item.id.startsWith('TEST_')
      && typeof item.name === 'string' && item.name.startsWith('TEST_')
      && (!item.type || (typeof item.type === 'string' && item.type.startsWith('TEST_'))));
  }

  function correspondenceMailMergeForm(prefill = null) {
    const orgs = correspondenceMailMergeOrganizations();
    if (!orgs.length) { showToast('ไม่พบหน่วยงาน TEST_ สำหรับสาธิตจดหมายเวียน', true); return; }
    const selectedIds = Array.isArray(prefill?.recipientIds) ? prefill.recipientIds : [orgs[0].id];
    const senderOptions = orgs.map(item=>`<option value="${esc(item.id)}" ${item.id === prefill?.senderOrganizationId ? 'selected' : ''}>${esc(item.name)} · ${esc(item.id)}</option>`).join('');
    const recipientOptions = orgs.map(item=>`<label class="corr-merge-recipient"><input type="checkbox" name="recipientIds" value="${esc(item.id)}" ${selectedIds.includes(item.id) ? 'checked' : ''} /><span><b>${esc(item.name)}</b><small>${esc(item.type || 'TEST_หน่วยงาน')} · ${esc(item.id)}</small></span></label>`).join('');
    const body = `<form class="demo-form corr-merge-form" id="correspondence-mail-merge-form">
      <div class="form-field full"><label for="corr-merge-sender">หน่วยงานต้นทาง TEST_</label><select id="corr-merge-sender" name="senderOrganizationId" required>${senderOptions}</select></div>
      <fieldset class="form-field full corr-merge-fieldset"><legend>เลือกผู้รับจากทะเบียน System 02 · TEST_ เท่านั้น</legend><div class="corr-merge-orgs">${recipientOptions}</div></fieldset>
      <div class="form-field full"><label for="corr-merge-subject">แม่แบบเรื่อง TEST_</label><input id="corr-merge-subject" name="subject" required value="${esc(prefill?.subject || 'TEST_แจ้งกำหนดการ {{examSession}} · {{organizationName}}')}" /></div>
      <div class="form-field full"><label for="corr-merge-body">แม่แบบเนื้อหา TEST_</label><textarea id="corr-merge-body" name="body" required>${esc(prefill?.body || 'TEST_เรียน {{organizationName}}\nขอแจ้งกำหนดการ {{examType}} รอบ {{examSession}} ณ {{province}}\nTEST_ข้อความสำหรับทดสอบจดหมายเวียนเท่านั้น')}</textarea></div>
    </form><div class="modal-hint">ตัวแปรที่ใช้ได้: {{organizationName}}, {{organizationId}}, {{province}}, {{examType}}, {{examSession}} · ตรวจดูตัวอย่างแยกผู้รับก่อนสร้างร่าง · ไม่มีการส่ง/แจ้งเตือนหรือออกเลขจริง และข้อมูลอยู่ในพื้นที่ข้อมูล TEST_</div>`;
    openModal({ title:'สร้างจดหมายเวียนออนไลน์ TEST_', subtitle:'ระบบ 08 · TEST_FIXTURE', body, confirmText:'แสดงตัวอย่างรายผู้รับ', cancelText:'ยกเลิก', onConfirm:() => {
      const form = modalRoot.querySelector('#correspondence-mail-merge-form');
      if (!form) return false;
      const controls = [...form.querySelectorAll('input,select,textarea')];
      const values = Object.fromEntries(controls.filter(control=>control.name !== 'recipientIds').map(control=>[control.name,String(control.value || '').trim()]));
      const recipientIds = [...new Set(controls.filter(control=>control.name === 'recipientIds' && control.checked).map(control=>String(control.value || '')))];
      const sender = orgs.find(item=>item.id === values.senderOrganizationId);
      const recipients = recipientIds.map(id=>orgs.find(item=>item.id === id)).filter(Boolean);
      if (!values.subject.startsWith('TEST_') || !values.body.startsWith('TEST_')) {
        showToast('แม่แบบเรื่องและเนื้อหาต้องขึ้นต้นด้วย TEST_ เท่านั้น', true); return false;
      }
      if (!sender || !recipientIds.length || recipients.length !== recipientIds.length) {
        showToast('เลือกหน่วยงานต้นทางและผู้รับจากทะเบียน TEST_ อย่างน้อยหนึ่งแห่ง', true); return false;
      }
      const allowedFields = ['organizationName','organizationId','province','examType','examSession'];
      const placeholders = [...`${values.subject}\n${values.body}`.matchAll(/\{\{\s*([A-Za-z][A-Za-z0-9]*)\s*\}\}/g)].map(match=>match[1]);
      const strippedTemplate = `${values.subject}\n${values.body}`.replace(/\{\{\s*[A-Za-z][A-Za-z0-9]*\s*\}\}/g,'');
      if (placeholders.some(name=>!allowedFields.includes(name)) || /\{\{|\}\}/.test(strippedTemplate)) {
        showToast('พบตัวแปรไม่ถูกต้อง ใช้เฉพาะตัวแปรที่แสดงในคำแนะนำ', true); return false;
      }
      const merge = (template, recipient) => {
        const variables = {
          organizationName:recipient.name,
          organizationId:recipient.id,
          province:typeof recipient.province === 'string' && recipient.province.startsWith('TEST_') ? recipient.province : 'TEST_ไม่ระบุจังหวัด',
          examType:typeof recipient.examType === 'string' && recipient.examType.startsWith('TEST_') ? recipient.examType : 'TEST_ไม่ระบุประเภทสอบ',
          examSession:typeof recipient.examSessionLabel === 'string' && recipient.examSessionLabel.startsWith('TEST_') ? recipient.examSessionLabel
            : typeof recipient.examSessionId === 'string' && recipient.examSessionId.startsWith('TEST_') ? recipient.examSessionId : 'TEST_ไม่ระบุรอบสอบ'
        };
        if (Object.values(variables).some(value=>typeof value !== 'string' || !value.startsWith('TEST_'))) return null;
        return template.replace(/\{\{\s*([A-Za-z][A-Za-z0-9]*)\s*\}\}/g,(_match,name)=>variables[name] || '');
      };
      const previewDrafts = recipients.map(recipient=>({
        recipient,
        name:merge(values.subject,recipient),
        summary:merge(values.body,recipient)
      }));
      if (previewDrafts.some(item=>!item.name || !item.summary || !item.name.startsWith('TEST_') || !item.summary.startsWith('TEST_'))) {
        showToast('ข้อมูลที่นำมาแทนตัวแปรต้องเป็น TEST_ เท่านั้น', true); return false;
      }
      const previewRows = previewDrafts.map((item,index)=>`<article class="corr-merge-preview"><header><b>ผู้รับ ${index + 1}: ${esc(item.recipient.name)}</b><small>${esc(item.recipient.id)}</small></header><h3>${esc(item.name)}</h3><p>${esc(item.summary.slice(0,420)).replaceAll('\n','<br>')}</p></article>`).join('');
      const prefill = { subject:values.subject, body:values.body, senderOrganizationId:sender.id, recipientIds };
      state.correspondenceMailMergePrefill = prefill;
      openModal({ title:'ตรวจตัวอย่างจดหมายเวียน TEST_', subtitle:`${previewDrafts.length} ฉบับ · ยังไม่ส่ง`, body:`<p>แต่ละผู้รับจะได้ร่างแยกในกล่องร่างของผู้ส่ง</p><div class="corr-merge-preview-list">${previewRows}</div><div class="modal-hint">ยืนยันแล้วจะสร้างร่าง TEST_ ใน memory เท่านั้น ไม่มีการส่งออก แจ้งผู้รับ ลงนาม หรือออกเลขทะเบียน</div><button class="btn btn-secondary" data-action="correspondence-mail-merge-edit">กลับไปแก้ไขแม่แบบ</button>`, confirmText:`สร้าง ${previewDrafts.length} ร่าง TEST_`, cancelText:'ปิดตัวอย่าง', onConfirm:()=>{
        let sequence = MODULES.correspondence.rows.reduce((max,row)=>Math.max(max,Number(row.id.match(/^TEST_DOC_(\d+)$/)?.[1] || 0)),0) + 1;
        const drafts = previewDrafts.map(item=>{
          const id = `TEST_DOC_${String(sequence++).padStart(3,'0')}`;
          return { id, name:item.name, sub:'TEST_จดหมายเวียน · ร่างแยกผู้รับ', type:'TEST_หนังสือส่งออก', unit:'TEST_ทั่วไป', contact:item.recipient.name,
            status:'TEST_ร่าง', tone:'amber', direction:'outgoing', classification:'TEST_ทั่วไป', senderOrganizationId:sender.id, recipientOrganizationId:item.recipient.id,
            summary:item.summary, attachmentLabel:'TEST_ไม่มีไฟล์แนบ', urgency:'TEST_ปกติ' };
        });
        MODULES.correspondence.rows.unshift(...drafts);
        drafts.forEach(row=>correspondenceAudit(row.id,'สร้างร่างจดหมายเวียน'));
        state.correspondenceTab='drafts'; state.listSearch.correspondence=''; state.pageNumbers.correspondence=1;
        render(); showToast(`สร้าง ${drafts.length} ร่างจดหมายเวียน TEST_ แยกผู้รับแล้ว · ไม่มีการส่งจริง`); return true;
      }});
      return false;
    }});
  }

  function openCorrespondenceDetail(documentId) {
    const row = MODULES.correspondence.rows.find(item=>item.id===documentId);
    if (!row) return;
    const restricted = row.classification !== 'TEST_ทั่วไป';
    const audit = state.correspondenceAudit.filter(item=>item.documentId===row.id);
    const auditMarkup = audit.length ? audit.map(item=>`<li><b>${esc(item.action)}</b><small>${esc(item.id)} · ${esc(item.actorId)}</small></li>`).join('') : '<li><b>TEST_ยังไม่มีเหตุการณ์ใน session</b></li>';
    const body = `<div class="corr-detail-grid"><div><span>รหัสระเบียน</span><b>${esc(row.id)}</b></div><div><span>ประเภท</span><b>${esc(row.type)}</b></div><div><span>ชั้นข้อมูลตัวอย่าง</span><b>${esc(row.classification)}</b></div><div><span>สถานะ</span><b>${esc(row.status)}</b></div><div><span>จาก</span><b>${esc(organizationName(row.senderOrganizationId))}</b></div><div><span>ถึง</span><b>${esc(organizationName(row.recipientOrganizationId))}</b></div></div>
      <section class="corr-detail-content"><h3>เรื่อง</h3><p>${restricted ? 'TEST_เอกสารจำกัดสิทธิ์ · ซ่อนเนื้อหาในหน้าตัวอย่าง' : esc(row.name)}</p>${restricted ? '<div class="callout warn"><span>ⓘ</span><div>ปกปิดทั้งข้อความและข้อมูลไฟล์; ระบบจริงต้องตรวจสิทธิ์อ่าน/ดาวน์โหลดที่ server และ Storage ก่อนส่งข้อมูลถึง browser</div></div>' : `<h3>ข้อความสรุป TEST_</h3><p>${esc(row.summary || 'TEST_ไม่มีข้อความสรุป')}</p><h3>ไฟล์แนบ</h3><p>${esc(row.attachmentLabel || 'TEST_ไม่มีไฟล์แนบ')} · ไม่มีไฟล์จริง</p>`}</section>
      <section class="corr-detail-content"><h3>Audit ใน session</h3><ul class="corr-audit-list">${auditMarkup}</ul><p class="secondary-cell">ไม่มี recorded/effective timestamp จริงใน prototype</p></section>`;
    openModal({ title:restricted ? 'รายละเอียดเอกสาร TEST_ · จำกัดสิทธิ์' : 'รายละเอียดเอกสาร TEST_', subtitle:'SYSTEM 08 · TEST_FIXTURE', body, confirmText:'ปิด' });
  }

  function sendCorrespondenceDraft(documentId) {
    const row = MODULES.correspondence.rows.find(item=>item.id===documentId);
    if (!row || row.direction!=='outgoing' || row.status!=='TEST_ร่าง') { showToast('ส่งได้เฉพาะร่าง TEST_ ที่ยังไม่ส่ง', true); return; }
    openModal({ title:'ส่งเข้ากล่องตัวอย่าง?', subtitle:'TEST_ เท่านั้น · ไม่มีการส่งจริง', body:`<p><b>${esc(row.id)}</b> จะเปลี่ยนเป็น TEST_ส่งจำลอง และยังไม่แจ้งผู้รับภายนอก</p><p>การทำรายการนี้ไม่ใช่การอนุมัติ ลงนาม หรือออกเลขทะเบียน</p>`, confirmText:'ยืนยันส่ง TEST_', cancelText:'ยกเลิก', onConfirm:()=>{
      if (row.status!=='TEST_ร่าง') { showToast('สถานะเอกสารถูกเปลี่ยนแล้ว', true); return false; }
      row.status='TEST_ส่งจำลอง'; row.tone='blue'; row.sub='TEST_ส่งในกล่องตัวอย่าง · ไม่มีการส่งออก';
      correspondenceAudit(row.id,'ส่งเข้ากล่องตัวอย่าง'); state.correspondenceTab='sent'; render(); showToast('เปลี่ยนเป็น TEST_ส่งจำลองแล้ว · ไม่มีการส่งออกจริง'); return true;
    }});
  }

  function acknowledgeCorrespondence(documentId) {
    const row = MODULES.correspondence.rows.find(item=>item.id===documentId);
    if (!row || row.direction!=='incoming' || row.status!=='TEST_รอรับจำลอง') { showToast('รายการนี้ไม่อยู่ในสถานะรอรับทราบ TEST_', true); return; }
    openModal({ title:'ทำเครื่องหมายรับทราบตัวอย่าง?', subtitle:'TEST_ เท่านั้น · ไม่ใช่การรับหนังสือจริง', body:`<p><b>${esc(row.id)}</b> จะเปลี่ยนสถานะใน memory ของ browser</p><p>ไม่มีการลงนามหรือยืนยันการรับหนังสือทางการ</p>`, confirmText:'รับทราบ TEST_', cancelText:'ยกเลิก', onConfirm:()=>{
      if (row.status!=='TEST_รอรับจำลอง') { showToast('สถานะเอกสารถูกเปลี่ยนแล้ว', true); return false; }
      row.status='TEST_รับทราบจำลอง'; row.tone=''; row.sub='TEST_ทำเครื่องหมายใน memory';
      correspondenceAudit(row.id,'รับทราบจำลอง'); state.correspondenceTab='inbox'; render(); showToast('ทำเครื่องหมาย TEST_รับทราบจำลองแล้ว'); return true;
    }});
  }

  function modulePage(id) {
    if (id === 'budget') { budgetPage(); return; }
    if (id === 'assets') { assetPage(); return; }
    if (id === 'correspondence') { correspondencePage(); return; }
    const module = MODULES[id];
    if (!module) return;
    updateHeader(id);
    const action = button(`<span>＋</span>${esc(module.action)}`, `new-${id}`, 'primary');
    const stats = module.stats.map(([label, value], i) => `<div class="panel small-stat"><span>${esc(label)}</span><b>${esc(value)}${i === 0 && id === 'assets' ? '<em>รายการ</em>' : ''}</b></div>`).join('');
    const allRows = rowsForPage(id);
    state.currentRows = allRows;
    const page = pageSlice(id, allRows);
    const rows = page.rows;
    const tableTitle = id === 'budget' ? 'รายการแผน TEST_' : id === 'assets' ? 'ทะเบียนรายการ TEST_' : id === 'correspondence' ? 'รายการเอกสาร TEST_' : id === 'requests' ? 'คำขอ TEST_' : id === 'admissions' ? 'บัญชีสมัคร TEST_' : id === 'organizations' ? 'ทะเบียนหน่วยงาน TEST_' : 'รายการบุคคล TEST_';
    const search = `<label class="field-search"><span>⌕</span><input type="search" class="module-search" placeholder="ค้นหาในรายการ TEST_" aria-label="ค้นหาในรายการ" value="${esc(state.listSearch[id] || '')}" /></label>`;
    const statusFilter = id === 'people' ? `<label class="field-search" style="width:auto"><span>สถานะ</span><select class="select-control" id="people-status-filter" aria-label="กรองประเภทสถานะ"><option value="all" ${state.peopleStatus === 'all' ? 'selected' : ''}>ทั้งหมด</option>${PEOPLE_STATUS_TYPES.map(item => `<option value="${esc(item.value)}" ${state.peopleStatus === item.value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></label>` : id === 'organizations' ? `<label class="field-search" style="width:auto"><span>ประเภท</span><select class="select-control" id="organization-type-filter" aria-label="กรองประเภทหน่วยงานและสนามสอบ"><option value="all" ${state.organizationType === 'all' ? 'selected' : ''}>ทั้งหมด</option>${ORG_TYPE_OPTIONS.map(type => `<option value="${esc(type)}" ${state.organizationType === type ? 'selected' : ''}>${esc(type)}</option>`).join('')}</select></label>` : '';
    const provinceOptions = ['organizations','requests'].includes(id) ? [...new Set(module.rows.map(row => row.province).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'th')) : [];
    const provinceFilter = id === 'organizations' ? `<label class="field-search" style="width:auto"><span>จังหวัด</span><select class="select-control" id="organization-province-filter" aria-label="กรองจังหวัด"><option value="all" ${state.organizationProvince === 'all' ? 'selected' : ''}>ทุกจังหวัด</option>${provinceOptions.map(province => `<option value="${esc(province)}" ${state.organizationProvince === province ? 'selected' : ''}>${esc(province)}</option>`).join('')}</select></label>` : id === 'requests' ? `<label class="field-search" style="width:auto"><span>จังหวัด</span><select class="select-control" id="requests-province-filter" aria-label="กรองคำขอตามจังหวัด"><option value="all" ${state.requestsProvince === 'all' ? 'selected' : ''}>ทุกจังหวัดในทะเบียน TEST_</option>${provinceOptions.map(province => `<option value="${esc(province)}" ${state.requestsProvince === province ? 'selected' : ''}>${esc(province)}</option>`).join('')}</select></label>` : '';
    const requestStatuses = [...new Set([...REQUEST_STATUS_OPTIONS, ...module.rows.map(row => row.status).filter(Boolean)])];
    const requestFilters = id === 'requests' ? `<label class="field-search" style="width:auto"><span>หมวดคำขอ</span><select class="select-control" id="requests-category-filter" aria-label="กรองหมวดคำขอ"><option value="all" ${state.requestsCategory === 'all' ? 'selected' : ''}>ทุกหมวด</option>${REQUEST_CATEGORY_OPTIONS.map(category => `<option value="${esc(category)}" ${state.requestsCategory === category ? 'selected' : ''}>${esc(category)}</option>`).join('')}</select></label><label class="field-search" style="width:auto"><span>รายการ</span><select class="select-control" id="requests-type-filter" aria-label="กรองประเภทคำขอ"><option value="all" ${state.requestsType === 'all' ? 'selected' : ''}>ทุกประเภท</option>${REQUEST_TYPE_OPTIONS.map(type => `<option value="${esc(type)}" ${state.requestsType === type ? 'selected' : ''}>${esc(type)}</option>`).join('')}</select></label><label class="field-search" style="width:auto"><span>สถานะ</span><select class="select-control" id="requests-status-filter" aria-label="กรองสถานะคำขอ"><option value="all" ${state.requestsStatus === 'all' ? 'selected' : ''}>ทุกสถานะ</option>${requestStatuses.map(status => `<option value="${esc(status)}" ${state.requestsStatus === status ? 'selected' : ''}>${esc(status)}</option>`).join('')}</select></label>` : '';
    const tools = `<div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">${esc(tableTitle)}</span><span class="result-count">${allRows.length.toLocaleString('th-TH')} รายการจำลอง</span></div><div class="table-tools-right">${search}${statusFilter}${provinceFilter}${requestFilters}${button('⇧ นำเข้า Excel', 'open-data-import', 'secondary', `data-module="${id}"`)}${button('⇩ ส่งออก Excel', 'export-xlsx', 'secondary', `data-module="${id}"`)}${button('CSV', 'export-csv', 'secondary', `data-module="${id}"`)}</div></div>`;
    const actionLabel = id === 'correspondence' ? 'ร่างหนังสือ TEST_' : module.action;
    const callout = `<div class="callout ${['requests','admissions','budget','assets','correspondence'].includes(id) ? 'warn' : ''}"><span aria-hidden="true">ⓘ</span><div>${esc(module.callout)}</div></div>`;
    const firstRow = allRows.length ? page.start + 1 : 0;
    const lastRow = Math.min(page.start + PAGE_SIZE, allRows.length);
    pageContent.innerHTML = `${heading(module.eyebrow, module.title, module.description, `<span class="result-count">ข้อมูลจำลอง</span>${button(`<span>＋</span>${esc(actionLabel)}`, `new-${id}`, 'primary')}`)}<div class="module-stats">${stats}</div><section class="panel table-panel">${tools}${tableMarkup(rows, module.columns, id)}<div class="table-footer"><span>แสดง ${firstRow}–${lastRow} จาก ${allRows.length.toLocaleString('th-TH')} รายการ · ข้อมูลทดสอบเท่านั้น</span><span>source: TEST_FIXTURE</span>${paginationControls(id, allRows.length)}</div></section><div class="muted-panel">${callout}</div>`;
  }

  function admissionsPage() {
    const module = MODULES.admissions;
    updateHeader('admissions');
    const tabs = `<div class="tab-row" role="tablist" aria-label="ทะเบียนบาลีและผลสอบ"><button class="tab-button ${state.admissionsTab === 'applications' ? 'active' : ''}" data-action="admissions-tab" data-tab="applications" role="tab" aria-selected="${state.admissionsTab === 'applications'}">บัญชีสมัครบาลี/บาลีศึกษา</button><button class="tab-button ${state.admissionsTab === 'results' ? 'active' : ''}" data-action="admissions-tab" data-tab="results" role="tab" aria-selected="${state.admissionsTab === 'results'}">ค้นผลสอบรายปี</button></div>`;
    const stats = `<div class="module-stats"><div class="panel small-stat"><span>บัญชีสมัคร TEST_</span><b>${module.rows.length.toLocaleString('th-TH')} <em>รายการ</em></b></div><div class="panel small-stat"><span>ประเภทผู้สมัคร</span><b>TEST_บรรพชิต / คฤหัสถ์</b></div><div class="panel small-stat"><span>ผลสอบที่เผยแพร่</span><b>0 <em>ชุด</em></b></div></div>`;
    let content = '';
    if (state.admissionsTab === 'results') {
      const search = state.resultSearch || {};
      const levelOptions = ['<option value="all">ทุกชั้น/ประโยค</option>', ...PALI_RESULT_LEVELS.map(level => `<option value="${esc(level)}" ${search.level === level ? 'selected' : ''}>${esc(level.replace(/^TEST_/, ''))}</option>`)].join('');
      const trackOptions = `<option value="all">บาลีและบาลีศึกษาทั้งหมด</option><option value="TEST_บาลีสนามหลวง" ${search.track === 'TEST_บาลีสนามหลวง' ? 'selected' : ''}>TEST_บาลีสนามหลวง</option><option value="TEST_บาลีศึกษา" ${search.track === 'TEST_บาลีศึกษา' ? 'selected' : ''}>TEST_บาลีศึกษา</option>`;
      const resultForm = `<section class="panel" style="margin-top:13px"><div class="course-toolbar"><span class="table-tools-title">ตัวกรองผลสอบบาลี/บาลีศึกษา</span><span class="result-count">ข้อมูลค้นหาต้องเป็น TEST_ ในต้นแบบ</span></div><div class="demo-form" id="pali-result-search"><div class="form-field"><label for="result-year">ปีการศึกษา</label><input id="result-year" value="${esc(search.year || '')}" placeholder="TEST_ACADEMIC_YEAR_001" /></div><div class="form-field"><label for="result-track">ประเภทผลสอบ</label><select id="result-track">${trackOptions}</select></div><div class="form-field"><label for="result-level">ชั้น/ประโยค</label><select id="result-level">${levelOptions}</select></div><div class="form-field"><label for="result-name">ชื่อ/ฉายา/นามสกุล</label><input id="result-name" value="${esc(search.name || '')}" placeholder="TEST_ชื่อผู้สอบ" /></div><div class="form-field"><label for="result-temple">วัด</label><input id="result-temple" value="${esc(search.temple || '')}" placeholder="TEST_วัด" /></div><div class="form-field"><label for="result-school">สำนักเรียน/จังหวัด</label><input id="result-school" value="${esc(search.school || '')}" placeholder="TEST_สำนักเรียนหรือจังหวัด" /></div><div class="form-field"><label for="result-number">เลขลำดับ/เลขประกาศ</label><input id="result-number" value="${esc(search.number || '')}" placeholder="TEST_RESULT_NUMBER_001" /></div><div class="form-field full">${button('ค้นหาผลสอบ TEST_', 'search-pali-results', 'primary')}</div></div><div class="callout warn" style="margin:12px 14px"><span>ⓘ</span><div>${search.submitted ? 'ดำเนินการค้นในชุดข้อมูล TEST_ แล้ว แต่ยังไม่มี approved release ให้แสดง' : 'ยังไม่มีชุดผลสอบที่ผ่านการรับรองให้ค้นหา; ไม่พบชื่อไม่ใช่หลักฐานว่าสอบตก'}</div></div><div class="public-release" style="margin:0 14px 14px"><h3>ขอบเขตผลสอบ</h3><p>ผลค้นหาจริงต้องอ่านจาก release ที่อนุมัติแล้วเท่านั้น พร้อมปีการศึกษา ชั้นประโยค ประเภทบาลี/บาลีศึกษา และฟิลด์ที่อนุญาตเผยแพร่; ต้นแบบนี้ไม่มีชื่อหรือผลสอบจริง</p></div></section>`;
      content = resultForm;
    } else {
      const allRows = rowsForPage('admissions');
      state.currentRows = allRows;
      const page = pageSlice('admissions', allRows);
      const scopeFilter = `<label class="field-search" style="width:auto"><span>ส่วนงาน</span><select class="select-control" id="admissions-scope-filter"><option value="all" ${state.admissionsScope === 'all' ? 'selected' : ''}>ทุกส่วนงาน</option><option value="TEST_ส่วนกลาง" ${state.admissionsScope === 'TEST_ส่วนกลาง' ? 'selected' : ''}>ส่วนกลาง</option><option value="TEST_ส่วนภูมิภาค" ${state.admissionsScope === 'TEST_ส่วนภูมิภาค' ? 'selected' : ''}>ส่วนภูมิภาค</option></select></label>`;
      const searchInput = `<label class="field-search"><span>⌕</span><input type="search" class="module-search" placeholder="ค้นผู้สมัคร/สำนักเรียน TEST_" aria-label="ค้นบัญชีสมัคร" value="${esc(state.listSearch.admissions || '')}" /></label>`;
      const toolbar = `<div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">บัญชีสมัคร TEST_</span><span class="result-count">${allRows.length.toLocaleString('th-TH')} รายการ</span></div><div class="table-tools-right">${searchInput}${scopeFilter}${button('⇧ นำเข้า Excel', 'open-data-import', 'secondary', 'data-module="admissions"')}${button('⇩ ส่งออก Excel', 'export-xlsx', 'secondary', 'data-module="admissions"')}${button('CSV', 'export-csv', 'secondary', 'data-module="admissions"')}</div></div>`;
      const firstRow = allRows.length ? page.start + 1 : 0;
      const lastRow = Math.min(page.start + PAGE_SIZE, allRows.length);
      content = `<section class="panel table-panel" style="margin-top:13px">${toolbar}${tableMarkup(page.rows, module.columns, 'admissions')}<div class="table-footer"><span>แสดง ${firstRow}–${lastRow} จาก ${allRows.length.toLocaleString('th-TH')} รายการ · TEST_ เท่านั้น</span>${paginationControls('admissions', allRows.length)}</div></section><div class="callout warn" style="margin-top:13px"><span>ⓘ</span><div><b>แยกชนิดเอกสาร:</b> ศ.2 เป็นบัญชีสมัครสอบ; ศ.3 เป็นบัญชีเรียกชื่อ/เอกสารดำเนินการสอบในเส้นทางส่วนภูมิภาคตามข้อมูลอ้างอิงที่ตรวจพบ รายละเอียดขั้นตอนและฉบับแบบฟอร์มต้องยืนยันกับเจ้าของงานก่อนใช้จริง</div></div>`;
    }
    pageContent.innerHTML = `${heading(module.eyebrow, module.title, module.description, `${button('＋ สร้างร่างสมัคร TEST_', 'new-admissions', 'primary')}`)}${stats}${tabs}<div class="callout warn" style="margin-top:13px"><span>ⓘ</span><div>ทะเบียนเชื่อมกับ Person, Organization และ ExamSession กลาง; ฟิกซ์เจอร์ทุกแถวเป็น TEST_ ไม่เก็บเลขประจำตัวหรือช่องทางติดต่อจริง และไม่จัดเลขสอบ/ประกาศผล</div></div>${content}${formDownloadsPanel('pali')}`;
  }

  function coursePage() {
    const subjects = rowsForPage('pali');
    const page = pageSlice('pali', subjects);
    const track = COURSE_TRACKS[state.courseTrack] || COURSE_TRACKS.pali;
    const levelOptions = ['ทั้งหมด', ...track.levels];
    const trackTabs = `<div class="tab-row course-track-tabs" aria-label="เลือกคลังวิชา">${Object.entries(COURSE_TRACKS).map(([key, item]) => `<button class="tab-button ${state.courseTrack === key ? 'active' : ''}" data-action="course-track" data-track="${esc(key)}">${esc(item.label)} <span class="secondary-cell">${esc(item.description)}</span></button>`).join('')}</div>`;
    const tabs = `<div class="tab-row"><button class="tab-button ${state.courseTab === 'subjects' ? 'active' : ''}" data-action="course-tab" data-tab="subjects">บทเรียนและรายวิชา</button><button class="tab-button ${state.courseTab === 'assessments' ? 'active' : ''}" data-action="course-tab" data-tab="assessments">แบบทดสอบก่อนเรียน / หลังเรียน</button></div>`;
    const rows = page.rows.map(item => {
      const controls = state.courseTab === 'assessments'
        ? `<span class="status-pill">ยังไม่มีชุดที่รับรอง</span><div class="row-actions course-assessment-actions"><button class="row-action" data-action="assessment-status" data-course-id="${esc(item.id)}" data-assessment-mode="pre">ก่อนเรียน</button><button class="row-action" data-action="assessment-status" data-course-id="${esc(item.id)}" data-assessment-mode="post">หลังเรียน</button></div>`
        : `<button class="row-action" data-action="course-outline" data-course-id="${esc(item.id)}">ดูโครงบทเรียน</button>`;
      return `<tr><td><div class="primary-cell">${esc(item.id)}</div></td><td>${esc(item.level)}</td><td><span class="primary-cell">${esc(item.subject)}</span></td><td><span class="status-pill amber">TO VERIFY · เนื้อหา</span></td><td><span class="status-pill">ไม่มีชุดที่รับรอง</span></td><td>${controls}</td></tr>`;
    }).join('');
    const courseContent = `<section class="panel table-panel"><div class="course-toolbar"><span class="table-tools-title">${state.courseTab === 'assessments' ? 'สถานะแบบทดสอบ' : 'รายวิชาและบทเรียน'}</span><span class="result-count">${subjects.length} รายวิชา · TEST_</span><select class="select-control" id="level-filter" aria-label="กรองชั้น/ระดับ"><option ${state.courseLevel === 'ทั้งหมด' ? 'selected' : ''}>ทั้งหมด</option>${track.levels.map(level => `<option ${state.courseLevel === level ? 'selected' : ''}>${esc(level)}</option>`).join('')}</select></div><div class="table-wrap"><table><thead><tr><th>รหัสชุด</th><th>ชั้น/ระดับ</th><th>วิชา</th><th>บทเรียน/แหล่ง</th><th>คลังข้อสอบ</th><th>${state.courseTab === 'assessments' ? 'เปิดสถานะก่อน/หลังเรียน' : 'รายละเอียด'}</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="no-results">ไม่พบรายวิชาตามตัวกรอง</td></tr>'}</tbody></table></div><div class="table-footer"><span>ไม่มีข้อสอบ/เฉลยที่รับรองให้เผยแพร่</span><span>${esc(track.label)} · ${subjects.length} รายวิชาในตัวกรอง</span>${paginationControls('pali', subjects.length)}</div></section>`;
    const side = `<aside class="panel course-side"><h3>ก่อนเรียนและหลังเรียน</h3><p>แต่ละรายวิชามีจุดเข้าใช้งานแยกก่อนเรียนและหลังเรียน แต่ยังไม่เปิดทำข้อสอบจนกว่าเจ้าของวิชาจะรับรองเนื้อหาและรุ่นเผยแพร่</p><div class="rubric-row"><span>ชุดข้อสอบ / revision</span><span>TO VERIFY</span></div><div class="rubric-row"><span>เฉลย / rubric / ผู้ตรวจ</span><span>TO VERIFY</span></div><div class="rubric-row"><span>เกณฑ์บันทึกคะแนนเรียน</span><span>TO VERIFY</span></div><div class="callout warn" style="margin-top:12px"><span>ⓘ</span><div>คะแนนฝึกเรียนไม่ใช่ผลสอบทางการ งานแปล/แต่งต้องมี rubric และครูตรวจ</div></div></aside>`;
    const courseActions = `${button('⇧ นำเข้า Excel', 'open-data-import', 'secondary', 'data-module="pali"')}${button('⇩ ส่งออก Excel', 'export-xlsx', 'secondary', 'data-module="pali"')}${button('ขอเพิ่มเนื้อหา TEST_', 'request-course-content', 'secondary')}`;
    const trackStats = `<div class="module-stats"><div class="panel small-stat"><span>นักธรรม · ชั้นตรี–เอก</span><b>12 <em>วิชา</em></b></div><div class="panel small-stat"><span>ธรรมศึกษา · 9 ช่วงชั้น</span><b>36 <em>วิชา</em></b></div><div class="panel small-stat"><span>บาลี · 8 กลุ่มชั้นประโยค</span><b>20 <em>คู่ชั้น–วิชา</em></b></div></div>`;
    pageContent.innerHTML = `${heading('LEARNING & EXAM QUESTION BANK', 'คลังบทเรียนและข้อสอบ', 'เว็บไซต์เดียวรวมคลังนักธรรม ธรรมศึกษา และบาลี พร้อมแยกชั้น/วิชา และทางเข้าทดสอบก่อนเรียนกับหลังเรียน', courseActions)}${trackStats}${trackTabs}${tabs}<div class="callout warn"><span>ⓘ</span><div>โครงรายวิชาอ้างอิงขอบเขตที่แจ้งและหน้าแหล่งข้อมูลสาธารณะที่ตรวจดู ณ วันที่จัดทำ ส่วนบทเรียน ข้อสอบ เฉลย และ rubric ยังไม่มีชุดที่เจ้าของวิชารับรอง จึงเปิดได้เฉพาะดูสถานะก่อน/หลังเรียน</div></div><div class="course-layout" style="margin-top:13px"><div>${courseContent}</div>${side}</div>`;
    updateHeader('pali');
  }

  function importSummary() {
    const imp = state.import;
    if (!imp) return '';
    const profile = EXAM_FORM_PROFILES.find(item => item.key === imp.formKey);
    const invalidCount = imp.rowErrors.filter(errors => errors.length > 0).length;
    const errCount = imp.errors.length;
    const page = pageSlice('exam-import-preview', imp.rows);
    const rows = page.rows.map((row, offset) => { const index = page.start + offset; return `<tr><td>${index + 1}</td><td>${esc(row['ชื่อผู้สมัคร'] ?? '')}</td><td>${esc(row['ประเภทผู้สมัคร'] ?? '')}</td><td>${esc(row['ชั้น'] ?? '')}</td><td>${esc(row['หน่วยงาน'] ?? '')}</td><td>${esc(row['รหัสรอบสอบ'] ?? '')}</td><td>${imp.rowErrors[index]?.length ? `<span class="status-pill red">${esc(imp.rowErrors[index].join(' · '))}</span>` : '<span class="status-pill">TEST_ ผ่าน validation</span>'}</td></tr>`; }).join('');
    return `<section class="panel table-panel" style="margin-top:13px"><div class="callout warn" style="margin:12px 14px"><span>ⓘ</span><div><b>ประเภทบัญชีที่เลือก:</b> ${esc(profile?.label || 'TO VERIFY')} · ผู้สมัครกลุ่ม: ${esc(profile?.audience || 'TO VERIFY')}<br />ไฟล์นี้ใช้โครงสร้างนำเข้ากลาง TEST_ เพื่อ preview เท่านั้น ยังไม่ใช่สำเนาแบบฟอร์มทางการและไม่ยืนยันว่าคอลัมน์ครบตามฉบับปัจจุบัน</div></div><div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">Preview · ${esc(imp.fileName)}</span><span class="result-count">${imp.rows.length.toLocaleString('th-TH')} แถว</span></div><div class="table-tools-right"><span class="summary-chip">${imp.rows.length - invalidCount} ผ่าน</span><span class="summary-chip ${errCount ? 'error' : ''}">${errCount} ข้อผิดพลาด</span></div></div><div class="table-wrap"><table><thead><tr><th>#</th><th>ชื่อผู้สมัคร</th><th>ประเภทผู้สมัคร</th><th>ชั้น</th><th>สำนัก/สถานศึกษา</th><th>รหัสรอบสอบ</th><th>ผลตรวจ</th></tr></thead><tbody>${rows || '<tr><td colspan="7" class="no-results">ไฟล์ไม่มีข้อมูลแถว</td></tr>'}</tbody></table></div><div class="table-footer"><span>ตรวจชื่อซ้ำ ช่องว่าง TEST_ และชนิดแบบบัญชี</span>${button(imp.committed ? '✓ commit และรอบันทึกขึ้น Supabase แล้ว' : 'ยืนยัน commit TEST_', 'commit-import', 'primary', `${errCount || !imp.rows.length || imp.committed ? 'disabled' : ''}`)}${paginationControls('exam-import-preview', imp.rows.length)}</div></section>`;
  }

  function importPage() {
    const imp = state.import;
    const formOptions = `<option value="">เลือกประเภทบัญชีก่อนนำเข้า</option>${EXAM_FORM_PROFILES.map(item => `<option value="${esc(item.key)}" ${state.examFormType === item.key ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}`;
    const selectedProfile = EXAM_FORM_PROFILES.find(item => item.key === state.examFormType);
    const drop = `<div class="drop-zone" id="drop-zone"><div class="upload-icon">⇧</div><h3>เลือกไฟล์บัญชีสมัคร TEST_</h3><p>ไฟล์จะถูกอ่านในเบราว์เซอร์นี้เพื่อทำ preview และ validation<br />ไม่อัปโหลดหรือส่งข้อมูลไป server</p><label class="form-field full" for="exam-form-type"><span>ประเภทบัญชี/ชั้นสอบ</span><select class="select-control" id="exam-form-type">${formOptions}</select></label>${selectedProfile ? `<div class="modal-hint"><b>${esc(selectedProfile.label)}</b> · ${esc(selectedProfile.audience)}<br />${esc(selectedProfile.note)}</div>` : ''}<input id="excel-file" type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" /><button class="btn btn-primary" data-action="choose-file">เลือกไฟล์ Excel</button><div class="upload-meta" style="margin-top:12px"><span class="file-tag">.xlsx</span><span class="file-tag">.csv</span><span class="file-tag">ข้อมูลทุกแถวขึ้นต้น TEST_</span></div>${imp ? `<p class="file-name">ไฟล์ที่เลือก: ${esc(imp.fileName)} · ${esc(selectedProfile?.label || 'TO VERIFY')}</p>` : ''}</div>`;
    const checklist = `<aside class="panel upload-side"><h3>โครงสร้างนำเข้า TEST_</h3><div class="required-field">ชื่อผู้สมัคร <span>required · TEST_</span></div><div class="required-field">ประเภทผู้สมัคร <span>required · TEST_</span></div><div class="required-field">ชั้น <span>required · TEST_</span></div><div class="required-field">สำนัก/สถานศึกษา <span>required · TEST_</span></div><div class="required-field">รหัสรอบสอบ <span>required · TEST_</span></div><div class="callout warn" style="margin-top:12px"><span>ⓘ</span><div>โครงสร้างนี้เป็นแม่แบบกลางสำหรับทดสอบ ไม่ใช่สำเนาไฟล์ ศ.1/ศ.2/ศ.5/ศ.6; ต้องยืนยันคอลัมน์และรุ่นไฟล์ทางการก่อนรับข้อมูลจริง</div></div><div class="public-release"><h3>ผลสอบ/เลขประจำตัว</h3><p>ต้นแบบนี้ไม่จัดเลขสอบหรือสร้างผลสอบ ผู้รับผิดชอบและกฎการเผยแพร่ต้องยืนยันก่อนเปิดใช้จริง</p></div><div style="margin-top:13px">${button('ดาวน์โหลดแม่แบบ TEST_ (ไม่ใช่แบบทางการ)', 'download-template', 'secondary')}</div></aside>`;
    const steps = `<div class="workflow-steps"><div class="workflow-step"><span class="step-num">STEP 01</span><b>อัปโหลด / เลือกไฟล์</b><p>อ่านไฟล์ภายใน browser</p></div><div class="workflow-step"><span class="step-num">STEP 02</span><b>Preview / ตรวจทาน</b><p>ตรวจ required field และชื่อซ้ำ</p></div><div class="workflow-step"><span class="step-num">STEP 03</span><b>Commit TEST_</b><p>บันทึกชั่วคราวใน memory</p></div></div>`;
    pageContent.innerHTML = `${heading('DHAMMA EXAM REGISTRATION', 'สมัครนักธรรมและธรรมศึกษา', 'นำเข้า Excel โดยเลือกประเภทบัญชี ศ.1/ศ.2/ศ.5/ศ.6 ก่อน preview และตรวจทานในโหมด TEST_', '')}<div class="callout warn"><span>ⓘ</span><div><strong>ห้ามใส่ข้อมูลจริง</strong> — ข้อมูลทุกช่องต้องเป็น TEST_ ข้อมูลจะอยู่ในหน่วยความจำชั่วคราวของหน้าเว็บและหายเมื่อ reload; ผู้สมัครชั้นโท/เอกต้องระบุชั้นจริงในไฟล์ที่ผ่านการยืนยัน</div></div>${steps}<div class="upload-layout"><section class="panel">${drop}${imp ? `<div class="preview-summary"><span class="summary-chip">${imp.rows.length} แถวใน preview</span><span class="summary-chip ${imp.errors.length ? 'error' : ''}">${imp.errors.length} ข้อผิดพลาด</span></div>` : ''}</section>${checklist}</div>${importSummary()}<div class="public-release"><h3>การรับรองและผลสอบ</h3><p>กฎการตรวจรูปแบบทางการ การออกเลขผู้สมัคร และผลสอบจริงต้องมาจากแหล่งข้อมูล/กฎที่องค์กรยืนยัน ระบบนี้ไม่ตีความการค้นไม่พบว่าไม่ผ่าน</p></div>${formDownloadsPanel('dhamma')}`;
    updateHeader('exam-import');
  }

  function accessControlPage() {
    const draft = state.permissionDraft;
    const systemOptions = NAV.filter(item => item.system !== false && item.id !== 'home').map(item => `<option value="${esc(item.id)}" ${draft.module === item.id ? 'selected' : ''}>${esc(item.label)}</option>`).join('');
    const userOptions = TEST_USERS.map(user => `<option value="${esc(user.id)}" ${draft.userId === user.id ? 'selected' : ''}>${esc(user.label)} · ${esc(user.id)}</option>`).join('');
    const roleOptions = TEST_ROLES.map(role => `<option value="${esc(role)}" ${draft.role === role ? 'selected' : ''}>${esc(role)}</option>`).join('');
    const scopeOptions = TEST_SCOPES.map(scope => `<option value="${esc(scope)}" ${draft.scopeType === scope ? 'selected' : ''}>${esc(scope)}</option>`).join('');
    const permissionChecks = PERMISSIONS.map(([key,label]) => `<label class="access-check"><input type="checkbox" data-access-permission="${esc(key)}" ${draft.permissions.includes(key) ? 'checked' : ''} />${esc(label)}</label>`).join('');
    const assignmentPage = pageSlice('access-assignments', state.permissionAssignments);
    const rows = assignmentPage.rows.map(item => {
      const user = TEST_USERS.find(entry => entry.id === item.userId);
      const scope = `${item.scopeType} · ${item.scopeValue}`;
      const perms = item.permissions.map(key => `<span class="permission-chip">${esc(PERMISSIONS.find(([id])=>id===key)?.[1] || key)}</span>`).join('');
      return `<tr><td>${esc(user?.label || item.userId)}<div class="secondary-cell">${esc(item.userId)}</div></td><td>${esc(item.role)}</td><td>${esc(item.module === 'all' ? 'ทุกระบบ' : NAV.find(nav=>nav.id===item.module)?.label || item.module)}</td><td>${esc(scope)}</td><td>${perms}</td></tr>`;
    }).join('');
    pageContent.innerHTML = `${heading('ACCESS MANAGEMENT · TEST_', 'ผู้ใช้ บทบาท และสิทธิ์', 'กำหนด role และสิทธิ์แยกตามระบบกับขอบเขตข้อมูลในโหมดจำลอง', '')}<div class="callout warn"><span>ⓘ</span><div><strong>ตัวอย่างเพื่อทดสอบ UI เท่านั้น</strong> — ผู้ดูแลระบบสูงสุดในข้อมูล TEST_ แสดงสิทธิ์ทุก action แต่สิทธิ์งาน TEST_ ยังเป็นแบบจำลอง; ฐานข้อมูลแยกพื้นที่ตามบัญชีจริงด้วย RLS; ห้ามใช้เป็นหลักฐานสิทธิ์หรืออำนาจอนุมัติ การกำหนด policy จริงต้องยืนยันเจ้าของข้อมูลและผู้มีอำนาจก่อน</div></div><div class="access-layout" style="margin-top:13px"><section class="panel access-form-panel"><h2>กำหนดสิทธิ์ให้ผู้ใช้ TEST_</h2><div class="demo-form" id="permission-form"><div class="form-field full"><label for="access-user">ผู้ใช้</label><select id="access-user">${userOptions}</select></div><div class="form-field"><label for="access-role">บทบาท</label><select id="access-role">${roleOptions}</select></div><div class="form-field"><label for="access-module">ระบบ</label><select id="access-module"><option value="all" ${draft.module === 'all' ? 'selected' : ''}>ทุกระบบ</option>${systemOptions}</select></div><div class="form-field"><label for="access-scope">ระดับขอบเขต</label><select id="access-scope">${scopeOptions}</select></div><div class="form-field"><label for="access-scope-value">ค่าขอบเขต (TEST_)</label><input id="access-scope-value" value="${esc(draft.scopeValue)}" placeholder="TEST_จังหวัดตัวอย่าง" /></div><div class="form-field full"><label>สิทธิ์ราย action</label><div class="access-checks">${permissionChecks}</div></div></div><div class="modal-hint">* การพิจารณา/เผยแพร่จริงต้องเป็น maker-checker และอิง policy ที่องค์กรยืนยัน ระบบตัวอย่างไม่อนุมัติรายการใด</div><div style="margin-top:12px">${button('บันทึกกำหนดสิทธิ์ TEST_', 'save-access', 'primary')}</div></section><section class="panel access-summary"><h2>สิทธิ์จำลองปัจจุบัน</h2><div class="table-wrap"><table class="access-table"><thead><tr><th>ผู้ใช้</th><th>บทบาท</th><th>ระบบ</th><th>ขอบเขต</th><th>สิทธิ์</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-footer"><span>${state.permissionAssignments.length.toLocaleString('th-TH')} รายการกำหนดสิทธิ์ TEST_</span>${paginationControls('access-assignments', state.permissionAssignments.length)}</div></section></div>`;
    updateHeader('access-control');
  }

  function dataImportSummary() {
    const imp = state.dataImport;
    if (!imp) return '';
    const config = DATA_IMPORT_CONFIG[imp.moduleId];
    const page = pageSlice('data-import-preview', imp.rows);
    const previewFields = config.previewFields ? config.fields.filter(([,key])=>config.previewFields.includes(key)) : config.fields.slice(0,4);
    const rows = page.rows.map((row,offset) => { const index = page.start + offset; const valueFor = key => key === 'educationPositions' ? serializeEducationPositions(row[key]) : row[key]; const result = imp.rowErrors[index]?.length ? `<span class="status-pill red">${esc(imp.rowErrors[index].join(' · '))}</span>` : imp.rowWarnings[index]?.length ? `<span class="status-pill amber" title="${esc(imp.rowWarnings[index].join(' · '))}">ตรวจสอบตำแหน่ง</span><div class="secondary-cell">${esc(imp.rowWarnings[index].join(' · '))}</div>` : '<span class="status-pill">TEST_ ผ่าน</span>'; return `<tr><td>${index+1}</td>${previewFields.map(([,key])=>`<td>${esc(valueFor(key))}</td>`).join('')}<td>${result}</td></tr>`; }).join('');
    const existing = imp.rows.filter(row => getDataRows(imp.moduleId).some(current => current.id === row.id)).length;
    const adding = imp.rows.length - existing;
    const headers = previewFields.map(([label])=>`<th>${esc(label)}</th>`).join('');
    const firstRow = imp.rows.length ? page.start + 1 : 0;
    const lastRow = Math.min(page.start + PAGE_SIZE, imp.rows.length);
    const warningCount = (imp.rowWarnings || []).reduce((sum,items)=>sum + (items?.length ? 1 : 0),0);
    return `<section class="panel table-panel" style="margin-top:13px"><div class="table-tools"><div class="table-tools-left"><span class="table-tools-title">Preview · ${esc(imp.fileName)}</span><span class="result-count">${imp.rows.length.toLocaleString('th-TH')} แถว</span></div><div class="table-tools-right"><span class="summary-chip">เพิ่ม ${adding}</span><span class="summary-chip ${existing ? 'error' : ''}">เขียนทับ ${existing}</span><span class="summary-chip ${imp.errors.length ? 'error' : ''}">${imp.errors.length} ข้อผิดพลาด</span>${warningCount ? `<span class="summary-chip warning">${warningCount} แถวต้องตรวจสอบ</span>` : ''}</div></div>${imp.moduleId === 'organizations' ? '<div class="callout warn" style="margin:10px 14px"><span>ⓘ</span><div>preview นี้แสดงช่องทางติดต่อจำกัดสิทธิ์ในระเบียน TEST_ เท่านั้น ห้ามอัปโหลดหรือใช้ข้อมูลติดต่อจริงในต้นแบบ</div></div>' : ''}<div class="table-wrap"><table><thead><tr><th>#</th>${headers}<th>ผลตรวจ</th></tr></thead><tbody>${rows || `<tr><td colspan="${previewFields.length + 2}" class="no-results">ไม่มีข้อมูลแถว</td></tr>`}</tbody></table></div><div class="table-footer"><span>แสดงตัวอย่าง ${firstRow}–${lastRow} จาก ${imp.rows.length.toLocaleString('th-TH')} แถว · ข้อมูลยังไม่ถูกเปลี่ยน</span>${button(imp.committed ? '✓ นำเข้า TEST_ และรอบันทึกขึ้น Supabase แล้ว' : 'ตรวจสอบและนำเข้า', 'commit-data-import', 'primary', `${imp.errors.length || !imp.rows.length || imp.committed ? 'disabled' : ''}`)}${paginationControls('data-import-preview', imp.rows.length)}</div></section>`;
  }

  function dataToolsPage() {
    const selected = state.selectedDataModule;
    const options = Object.entries(DATA_IMPORT_CONFIG).map(([id,config])=>`<option value="${esc(id)}" ${selected === id ? 'selected' : ''}>${esc(config.label)}</option>`).join('');
    const imp = state.dataImport;
    pageContent.innerHTML = `${heading('DATA EXCHANGE · TEST_', 'นำเข้า/ส่งออก Excel', 'ส่งออกแฟ้มเพื่อตรวจแก้ เพิ่มระเบียน และนำกลับเข้าระบบตัวอย่างพร้อม preview ก่อนเปลี่ยนข้อมูล', '')}<div class="callout warn"><span>ⓘ</span><div>รองรับข้อมูล TEST_ เท่านั้น ไฟล์อ่านใน browser และเก็บใน memory จน reload ข้อมูลนี้เป็นแบบจำลอง TEST_; ก่อนนำเข้าระบบจะนับรหัสที่ซ้ำและถามยืนยันการเขียนทับแยกจากการเพิ่มข้อมูล<br/><b>ระบบ 07:</b> Excel จัดการเฉพาะข้อมูลทะเบียนพัสดุ; จำนวนคงเหลือมาจาก stock movement และไม่นำเข้าหรือเขียนทับจาก Excel<br/><b>ระบบ 08:</b> Excel อนุญาตเฉพาะ metadata TEST_ ตาม field allowlist; ห้ามใช้ส่งเนื้อความ ไฟล์แนบ ลายเซ็น หรือข้อมูลเอกสารจริง</div></div><section class="panel data-tools-panel" style="margin-top:13px"><div class="data-import-actions"><label class="form-field"><span>ระบบข้อมูล</span><select class="select-control" id="data-module-select">${options}</select></label>${button('⇩ ส่งออก Excel', 'export-xlsx', 'secondary', `data-module="${esc(selected)}"`)}${button('ดาวน์โหลดแม่แบบ Excel', 'export-xlsx-template', 'secondary', `data-module="${esc(selected)}"`)}<label class="form-field"><span>เลือกไฟล์ .xlsx หรือ .csv</span><input id="data-excel-file" type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" /></label></div><div class="modal-hint">ใช้หัวคอลัมน์จากไฟล์ส่งออกหรือแม่แบบของระบบที่เลือก คอลัมน์และค่า TEST_ จะถูกตรวจสอบก่อนแสดง preview; ข้อมูลติดต่อส่วนบุคคลไม่รวมใน export ของทะเบียนบุคคล</div>${imp ? `<p class="file-name">ไฟล์ที่เลือก: ${esc(imp.fileName)}${imp.moduleId !== selected ? ' · กรุณาเลือกไฟล์ของระบบที่ตรงกัน' : ''}</p>` : ''}</section>${dataImportSummary()}<div class="public-release"><h3>การยืนยันก่อนเขียนทับ</h3><p>เมื่อพบรหัสระเบียนเดิม ระบบจะระบุจำนวนรายการที่จะเขียนทับและขอให้กดยืนยัน หรือยกเลิกก่อนทำรายการ การทดสอบนี้เปลี่ยนเฉพาะข้อมูลจำลองใน memory; ระบบจริงต้องใช้ transaction, audit, optimistic lock และตรวจสิทธิ์ฝั่ง server อีกครั้ง</p></div>`;
    updateHeader('data-tools');
  }

  function loggedOutPage() {
    document.getElementById('sidebar').classList.add('logged-out');
    pageContent.innerHTML = `<section class="panel logged-out-panel"><div class="hero-tag">TEST SESSION ENDED</div><h1>ออกจากโหมดตัวอย่างแล้ว</h1><p>สถานะร่างและข้อมูลนำเข้า TEST_ ชั่วคราวถูกล้างจากหน้านี้แล้ว การปิดโหมดทดสอบไม่ได้ออกจากบัญชีเว็บไซต์</p><div class="callout warn"><span>ⓘ</span><div>หากต้องการออกจากบัญชีเว็บไซต์ ให้ใช้ปุ่มออกจากระบบด้านบน ซึ่งเชื่อมกับผู้ให้บริการบัญชี</div></div><div style="margin-top:16px">${button('กลับเข้าสู่โหมดตัวอย่าง TEST_', 'enter-demo', 'primary')}</div></section>`;
    document.getElementById('breadcrumb-current').textContent = 'ออกจากโหมดตัวอย่าง';
    document.getElementById('back-button').hidden = true;
    document.getElementById('logout-button').hidden = true;
    document.getElementById('user-chip').hidden = true;
    document.querySelector('.global-search')?.setAttribute('hidden','');
    document.querySelector('.notification-button')?.setAttribute('hidden','');
    document.querySelector('.mobile-menu')?.setAttribute('hidden','');
    navRoot.innerHTML = '';
  }

  function updateHeader(id) {
    const item = NAV.find(nav => nav.id === id);
    document.getElementById('breadcrumb-current').textContent = item ? item.label : 'ภาพรวม';
    document.getElementById('back-button').hidden = !state.demoLoggedIn || id === 'home';
    document.getElementById('logout-button').hidden = !state.demoLoggedIn;
    document.getElementById('user-chip').hidden = !state.demoLoggedIn;
    document.querySelector('.global-search')?.removeAttribute('hidden');
    document.querySelector('.notification-button')?.removeAttribute('hidden');
    document.querySelector('.mobile-menu')?.removeAttribute('hidden');
    document.getElementById('sidebar').classList.remove('logged-out');
    drawNav();
  }

  function render() {
    if (!state.demoLoggedIn) loggedOutPage();
    else if (state.page === 'home') homePage();
    else if (state.page === 'pali') coursePage();
    else if (state.page === 'admissions') admissionsPage();
    else if (state.page === 'exam-import') importPage();
    else if (state.page === 'access-control') accessControlPage();
    else if (state.page === 'data-tools') dataToolsPage();
    else modulePage(state.page);
    pageContent.focus({ preventScroll: true });
    window.portalPersistence?.changed(portalSnapshot());
  }

  function navigate(id) {
    if (!state.demoLoggedIn || !NAV.some(item => item.id === id)) return;
    if (id !== state.page) state.pageHistory.push(state.page);
    state.page = id;
    document.getElementById('global-search').value = '';
    document.getElementById('sidebar').classList.remove('open');
    document.querySelector('.mobile-overlay')?.classList.remove('visible');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    if (!state.demoLoggedIn || state.page === 'home') return;
    state.page = state.pageHistory.pop() || 'home';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(message, error = false) {
    toastRoot.innerHTML = `<div class="toast ${error ? 'error' : ''}">${esc(message)}</div>`;
    window.setTimeout(() => { toastRoot.innerHTML = ''; }, 3200);
  }

  function openModal({ title, subtitle = 'TEST_ · การทำงานจำลอง', body = '', confirmText = 'รับทราบ', cancelText = '', onConfirm = null }) {
    state.modalConfirm = onConfirm;
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="modal-backdrop"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-head"><div><p class="eyebrow">${esc(subtitle)}</p><h2 id="modal-title">${esc(title)}</h2></div><button class="modal-close" data-action="close-modal" aria-label="ปิด">×</button></header><div class="modal-body">${body}</div><footer class="modal-foot">${cancelText ? '<button class="btn btn-secondary" data-action="close-modal">ยกเลิก</button>' : ''}<button class="btn btn-primary" data-action="modal-confirm">${esc(confirmText)}</button></footer></section></div>`;
    modalRoot.querySelector('[data-action="close-modal"]')?.focus();
  }

  function budgetDraftForm(stageId) {
    const stage = BUDGET_STAGES.find(item => item.id === stageId && item.id !== 'overview');
    if (!stage) return;
    const isPlan = stageId === 'plan';
    const nextNumber = String(state.budgetDrafts.length + 1).padStart(3, '0');
    const ref = `TEST_BUDGET_DRAFT_${nextNumber}`;
    const form = `<form class="demo-form" id="budget-draft-form"><div class="form-field"><label for="budget-draft-ref">เลขอ้างอิงจำลอง</label><input id="budget-draft-ref" required value="${ref}" /></div><div class="form-field"><label for="budget-draft-period">งวดทดสอบ</label><select id="budget-draft-period"><option value="TEST_PERIOD_01">TEST_PERIOD_01</option><option value="TEST_PERIOD_02">TEST_PERIOD_02</option></select></div><div class="form-field"><label for="budget-draft-name">${isPlan ? 'ชื่อแผน' : 'รายการ'}</label><input id="budget-draft-name" required placeholder="TEST_..." /></div><div class="form-field"><label for="budget-draft-unit">หน่วยงาน / แผนที่เกี่ยวข้อง</label><input id="budget-draft-unit" required placeholder="TEST_..." /></div><div class="form-field full"><label for="budget-draft-amount">${isPlan ? 'วงเงินจัดสรรจำลอง' : 'ยอดรายการ'} (จำนวนเต็มสตางค์)</label><input id="budget-draft-amount" type="number" min="1" step="1" inputmode="numeric" required placeholder="จำนวนเต็ม เช่น 12500" /></div></form><div class="modal-hint">ข้อมูลข้อความและรหัสต้องขึ้นต้นด้วย TEST_; ยอดเงินรับเป็นจำนวนเต็มสตางค์ ไม่รับทศนิยม และจะเก็บเป็นข้อมูล TEST_ และบันทึกใน Supabase เมื่อยืนยัน</div>`;
    openModal({ title: isPlan ? 'สร้างร่างแผนงบประมาณ TEST_' : `สร้างร่าง${stage.label} TEST_`, subtitle: 'BUDGET WORKFLOW · TEST_', body: form, confirmText: 'ตรวจสอบและสร้างร่าง', cancelText: 'ยกเลิก', onConfirm: () => {
      const reference = document.getElementById('budget-draft-ref')?.value.trim() || '';
      const period = document.getElementById('budget-draft-period')?.value || '';
      const label = document.getElementById('budget-draft-name')?.value.trim() || '';
      const unit = document.getElementById('budget-draft-unit')?.value.trim() || '';
      const amountText = document.getElementById('budget-draft-amount')?.value.trim() || '';
      const amountSatang = Number(amountText);
      if (![reference, period, label, unit].every(value => value.startsWith('TEST_'))) {
        showToast('กรุณาใช้รหัสและข้อความ TEST_ เท่านั้น', true);
        return false;
      }
      if (!/^[1-9]\d*$/.test(amountText) || !Number.isSafeInteger(amountSatang)) {
        showToast('ยอดต้องเป็นจำนวนเต็มสตางค์ที่มากกว่า 0', true);
        return false;
      }
      if (state.budgetDrafts.some(row => row.id === reference)) {
        showToast('เลขอ้างอิง TEST_ ซ้ำในร่างปัจจุบัน', true);
        return false;
      }
      const totals = budgetTotals();
      const reservedCommitments = state.budgetDrafts.filter(row => row.stage === 'commitment').reduce((sum,row) => sum + row.amountSatang, 0);
      const reservedPayments = state.budgetDrafts.filter(row => row.stage === 'disbursement').reduce((sum,row) => sum + row.amountSatang, 0);
      const reservedRefunds = state.budgetDrafts.filter(row => row.stage === 'refund').reduce((sum,row) => sum + row.amountSatang, 0);
      if (stageId === 'commitment' && amountSatang > totals.availableSatang - reservedCommitments) {
        showToast('ยอดร่างเกินวงเงินที่ยังไม่ผูกพันในชุด TEST_', true);
        return false;
      }
      if (stageId === 'disbursement' && amountSatang > totals.unpaidSatang - reservedPayments) {
        showToast('ยอดร่างจ่ายเกินยอดผูกพันค้างจ่ายในชุด TEST_', true);
        return false;
      }
      if (stageId === 'refund' && amountSatang > totals.paidSatang - reservedRefunds) {
        showToast('ยอดร่างคืนเงินเกินยอดจ่ายจำลองที่ใช้ตรวจสอบได้', true);
        return false;
      }
      state.budgetDrafts.push({ id:reference, stage:stageId, period, amountSatang, label, unit, status:'TEST_ร่างใน memory · ยังไม่ผ่านการตรวจสอบ', note:'TEST_ข้อมูลที่ผู้ใช้กรอกเพื่อทดสอบหน้าจอ' });
      render();
      showToast('สร้างร่างงบประมาณ TEST_ และรอบันทึกขึ้น Supabase แล้ว · ยังไม่ใช่การอนุมัติหรือรายการเงินจริง');
      return true;
    }});
  }

  function assetReferenceExists(reference) {
    return state.assetMovements.some(item=>item.reference===reference)
      || state.assetLoans.some(item=>item.reference===reference)
      || state.assetMaintenance.some(item=>item.reference===reference)
      || state.assetCounts.some(item=>item.reference===reference)
      || state.assetDisposals.some(item=>item.reference===reference)
      || state.assetPurchases.some(item=>item.reference===reference);
  }

  function assetDraftForm(stageId) {
    const stage=ASSET_STAGES.find(item=>item.id===stageId && !['inventory','movement'].includes(item.id));
    if(!stage) return;
    const sequence=String(state.assetMovements.length+state.assetLoans.length+state.assetMaintenance.length+state.assetCounts.length+state.assetDisposals.length+state.assetPurchases.length+1).padStart(3,'0');
    const ref=`TEST_ASSET_EVENT_${sequence}`;
    const assetOptions=MODULES.assets.rows.map(item=>`<option value="${esc(item.id)}">${esc(item.name)} · ${esc(item.id)}</option>`).join('');
    const locations=assetLocationRows();
    const isTransfer=stageId==='transfer';
    const isReturn=stageId==='return';
    const isLoan=stageId==='loans';
    const isCount=stageId==='count';
    const refs=(isReturn
      ? state.assetMovements.filter(item=>item.type==='issue'&&assetOutstanding(item.reference)>0)
      : isLoan ? state.assetLoans.filter(item=>assetOutstanding(item.reference)>0) : []);
    const refOptions=refs.map(item=>`<option value="${esc(item.reference)}">${esc(item.reference)} · คงค้าง ${isReturn?assetOutstanding(item.reference):item.quantity} หน่วย</option>`).join('');
    const modeField=isLoan?`<div class="form-field"><label for="asset-loan-mode">รายการยืม</label><select id="asset-loan-mode"><option value="lend">บันทึกยืมออก</option><option value="return">คืนยืม</option></select></div>`:'';
    const refField=(isReturn||isLoan)?`<div class="form-field full"><label for="asset-source-reference">รายการต้นทาง</label><select id="asset-source-reference">${refOptions||'<option value="">ไม่มีรายการคงค้าง TEST_</option>'}</select></div>`:'';
    const borrowerField=isLoan?`<div class="form-field"><label for="asset-borrower">ผู้ยืม TEST_</label><input id="asset-borrower" value="TEST_ผู้ยืมตัวอย่าง" /></div>`:'';
    const budgetField=stageId==='purchase'?`<div class="form-field full"><label for="asset-budget-reference">รหัสแผนงบ System 06 (TEST_)</label><select id="asset-budget-reference">${MODULES.budget.rows.map(item=>`<option value="${esc(item.id)}">${esc(item.id)} · ${esc(item.name)}</option>`).join('')}</select></div>`:'';
    const locationFields=isTransfer
      ? `<div class="form-field"><label for="asset-from-location">คลังต้นทาง</label><select id="asset-from-location">${locations}</select></div><div class="form-field"><label for="asset-to-location">คลังปลายทาง</label><select id="asset-to-location"><option value="TEST_คลังย่อยตัวอย่าง">TEST_คลังย่อยตัวอย่าง</option>${locations}</select></div>`
      : stageId==='purchase'?' '
      : `<div class="form-field"><label for="asset-location">คลัง/หน่วยงาน</label><select id="asset-location">${locations}</select></div>`;
    const quantityLabel=isCount?'ยอดตรวจนับ':stageId==='disposal'?'จำนวนที่เสนอ':'จำนวน';
    const quantityField=`<div class="form-field"><label for="asset-quantity">${quantityLabel} (หน่วยจำนวนเต็ม)</label><input id="asset-quantity" type="number" min="${isCount?'0':'1'}" step="1" value="${isCount?'0':'1'}" required /></div>`;
    const body=`<form class="demo-form" id="asset-draft-form"><div class="form-field"><label for="asset-reference">รหัสอ้างอิง TEST_</label><input id="asset-reference" value="${ref}" required /></div><div class="form-field"><label for="asset-id">พัสดุ</label><select id="asset-id">${assetOptions}</select></div>${modeField}${refField}${budgetField}${locationFields}${quantityField}${borrowerField}<div class="form-field full"><label for="asset-note">หมายเหตุ TEST_</label><input id="asset-note" value="TEST_รายการสำหรับทดสอบขั้นตอน" required /></div></form><div class="callout warn asset-form-warning"><span>ⓘ</span><div>ใช้รหัส/ข้อความ TEST_ และจำนวนเต็มเท่านั้น: การเบิก/โอน/ยืมตรวจยอดคงเหลือ, transfer บันทึกคู่เข้า–ออก, การนับไม่ปรับยอด, คำขอซื้อ/จำหน่ายไม่เปลี่ยน stock และการยืนยันนี้ไม่ใช่การอนุมัติจริง</div></div>`;
    openModal({title:`บันทึก${stage.label} TEST_`,subtitle:'ระบบ 07 · TEST_FIXTURE',body,confirmText:'ตรวจสอบและบันทึก TEST_',cancelText:'ยกเลิก',onConfirm:()=>confirmAssetDraft(stageId)});
  }

  function confirmAssetDraft(stageId) {
    const stage=ASSET_STAGES.find(item=>item.id===stageId)||{label:'TEST_รายการพัสดุ'};
    const reference=document.getElementById('asset-reference')?.value.trim()||'';
    const assetId=document.getElementById('asset-id')?.value||'';
    const asset=MODULES.assets.rows.find(item=>item.id===assetId);
    const note=document.getElementById('asset-note')?.value.trim()||'';
    const quantityText=document.getElementById('asset-quantity')?.value.trim()||'';
    const quantity=Number(quantityText);
    const location=document.getElementById('asset-location')?.value||'';
    const fromLocation=document.getElementById('asset-from-location')?.value||'';
    const toLocation=document.getElementById('asset-to-location')?.value||'';
    const sourceReference=document.getElementById('asset-source-reference')?.value||'';
    const loanMode=document.getElementById('asset-loan-mode')?.value||'lend';
    const borrower=document.getElementById('asset-borrower')?.value.trim()||'';
    const budgetReference=document.getElementById('asset-budget-reference')?.value||'';
    const count=isNaN(quantity)?NaN:quantity;
    const isCount=stageId==='count';
    const isTransfer=stageId==='transfer';
    if(!reference.startsWith('TEST_')||!note.startsWith('TEST_')||!asset){showToast('รหัสอ้างอิง หมายเหตุ และทะเบียนต้องเป็นข้อมูล TEST_ ที่ครบถ้วน',true);return false;}
    if(assetReferenceExists(reference)){showToast('รหัสอ้างอิง TEST_ ซ้ำ ป้องกันการบันทึกซ้ำแล้ว',true);return false;}
    if(!/^(0|[1-9]\d*)$/.test(quantityText)||!Number.isSafeInteger(count)||(!isCount&&count<1)){showToast('จำนวนต้องเป็นจำนวนเต็มที่ถูกต้อง และมากกว่า 0 ยกเว้นยอดตรวจนับที่เป็น 0 ได้',true);return false;}
    const targetLocation=isTransfer?fromLocation:location;
    if(stageId!=='purchase'&&!ASSET_LOCATIONS.includes(targetLocation)){showToast('เลือกคลัง/หน่วยงาน TEST_ ที่กำหนด',true);return false;}
    const base={reference,assetId,note,status:'TEST_บันทึกจำลอง · ไม่ใช่การอนุมัติ'};
    const pushMovement=(type,delta,atLocation,extra={})=>state.assetMovements.push({id:`TEST_ASSET_MOVEMENT_${String(state.assetMovements.length+1).padStart(3,'0')}`,reference,assetId,type,quantityDelta:delta,location:atLocation,...base,...extra});
    if(stageId==='receive') pushMovement('receive',count,location);
    else if(stageId==='issue'){
      if(!ASSET_LOCATIONS.includes(location)||assetBalance(assetId,location)<count){showToast('ยอดคงเหลือในคลังต้นทางไม่พอสำหรับการเบิก',true);return false;}
      pushMovement('issue',-count,location);
    }else if(stageId==='return'){
      const source=state.assetMovements.find(item=>item.reference===sourceReference&&item.type==='issue');
      if(!source||source.assetId!==assetId||assetOutstanding(sourceReference)<count||!ASSET_LOCATIONS.includes(location)){showToast('รายการต้นทาง/พัสดุ/จำนวนคืนไม่ตรงกับยอดเบิกคงค้าง',true);return false;}
      pushMovement('return',count,location,{sourceReference});
    }else if(stageId==='transfer'){
      if(!ASSET_LOCATIONS.includes(fromLocation)||!ASSET_LOCATIONS.includes(toLocation)||fromLocation===toLocation){showToast('เลือกคลังต้นทางและปลายทางที่ต่างกัน',true);return false;}
      if(assetBalance(assetId,fromLocation)<count){showToast('ยอดในคลังต้นทางไม่พอสำหรับการโอน',true);return false;}
      pushMovement('transfer_out',-count,fromLocation,{counterpartLocation:toLocation});
      pushMovement('transfer_in',count,toLocation,{counterpartLocation:fromLocation});
    }else if(stageId==='loans'){
      if(loanMode==='return'){
        const loan=state.assetLoans.find(item=>item.reference===sourceReference&&item.status==='TEST_ยืมคงค้าง');
        if(!loan||loan.assetId!==assetId||assetOutstanding(sourceReference)<count||!ASSET_LOCATIONS.includes(location)){showToast('ตรวจรายการยืม พัสดุ และจำนวนคืนอีกครั้ง',true);return false;}
        pushMovement('loan_return',count,location,{sourceReference});
      }else{
        if(!ASSET_LOCATIONS.includes(location)||assetBalance(assetId,location)<count||!borrower.startsWith('TEST_')){showToast('ยอดไม่พอหรือข้อมูลผู้ยืมไม่ได้ขึ้นต้น TEST_',true);return false;}
        pushMovement('loan',-count,location);
        state.assetLoans.push({id:reference,reference,assetId,quantity:count,borrower,location,status:'TEST_ยืมคงค้าง',note});
      }
    }else if(stageId==='purchase'){
      if(!budgetReference.startsWith('TEST_')){showToast('เลือกแผนงบตัวอย่าง TEST_ ก่อนสร้างคำขอ',true);return false;}
      state.assetPurchases.push({id:reference,...base,quantity:count,budgetReference,status:'TEST_ร่างขอซื้อ · ไม่ผูกพันเงินจริง'});
    }else if(stageId==='maintenance'){
      state.assetMaintenance.push({id:reference,...base,location,status:'TEST_รอตรวจสภาพ'});
    }else if(stageId==='count'){
      if(!ASSET_LOCATIONS.includes(location)){showToast('เลือกคลัง/หน่วยงานสำหรับตรวจนับ',true);return false;}
      const expected=assetBalance(assetId,location);
      state.assetCounts.push({id:reference,...base,location,expected,counted:count,variance:count-expected,status:'TEST_รอตรวจทานจำลอง'});
    }else if(stageId==='disposal'){
      if(!ASSET_LOCATIONS.includes(location)||assetBalance(assetId,location)<count){showToast('ยอดเสนอจำหน่ายเกินจำนวนที่มีในคลัง',true);return false;}
      state.assetDisposals.push({id:reference,...base,location,quantity:count,status:'TEST_รอหลักเกณฑ์และอำนาจ'});
    }else return false;
    state.pageNumbers[`asset-events-${stageId}`]=1;
    render();
    showToast(`เพิ่มรายการ ${stage.label} TEST_ และรอบันทึกขึ้น Supabase แล้ว · ไม่ใช่รายการอนุมัติจริง`);
    return true;
  }

  function openBudgetDetail(stageId, rowId) {
    const row = [...(BUDGET_SAMPLE_EVENTS[stageId] || []), ...state.budgetDrafts.filter(item => item.stage === stageId)].find(item => item.id === rowId);
    if (!row) return;
    const amount = Number.isSafeInteger(row.amountSatang) ? `฿ ${money(row.amountSatang)}` : 'ไม่มียอดในขั้นตอนนี้';
    const ledger = Number.isSafeInteger(row.ledgerSatang) ? `<div class="note-row"><div><b>ยอดบัญชีจำลอง</b><p>฿ ${money(row.ledgerSatang)}</p></div></div>` : '';
    const detail = [['รหัส TEST_', row.id], ['งวด TEST_', row.period], ['รายการ', row.label || row.unit || `${row.source || ''} → ${row.destination || ''}`], ['ยอด TEST_', amount], ['สถานะตัวอย่าง', row.status], ['หมายเหตุ', row.note || 'TEST_ไม่มีหมายเหตุ']].map(([label,value]) => `<div class="note-row"><div><b>${esc(label)}</b><p>${esc(value || 'TO VERIFY')}</p></div></div>`).join('');
    openModal({ title:'รายละเอียดรายการงบประมาณ', subtitle:`${stageId.toUpperCase()} · TEST_`, body:`<section class="profile-section">${detail}${ledger}</section><div class="modal-hint">ข้อมูลนี้เป็นตัวอย่างจำลอง ไม่มีเอกสารจ่ายเงินจริง ไม่มีการอนุมัติ และไม่ก่อให้เกิดรายการบัญชี</div>`, confirmText:'ปิด' });
  }

  function organizationDraftForm() {
    const fields = [
      { key:'name', label:'ชื่อหน่วยงาน/สนามสอบ', required:true, full:true },
      { key:'type', label:'ประเภทหน่วยงาน', required:true, options:ORG_TYPE_OPTIONS },
      { key:'unit', label:'พื้นที่/สังกัด', required:true },
      { key:'address', label:'ที่อยู่', required:true, full:true },
      { key:'subdistrict', label:'ตำบล', required:true },
      { key:'district', label:'อำเภอ', required:true },
      { key:'province', label:'จังหวัด', required:true },
      { key:'postalCode', label:'รหัสไปรษณีย์', required:true },
      { key:'examType', label:'ประเภทสนามสอบ', options:ORG_EXAM_TYPE_OPTIONS },
      { key:'examSessionId', label:'รหัสรอบสอบ · ExamSession' },
      { key:'examSessionLabel', label:'ชื่อรอบสอบ', full:true },
      { key:'chairName', label:'ชื่อประธานสนามสอบ' },
      { key:'chairTitle', label:'ตำแหน่งประธานสนามสอบ' },
      { key:'chairAddress', label:'ที่อยู่ประธานสนามสอบ', full:true },
      { key:'chairPhone', label:'เบอร์โทรประธานสนามสอบ', type:'tel' },
      { key:'chairEmail', label:'อีเมลประธานสนามสอบ', type:'email' },
      { key:'chairLineId', label:'LINE ID ประธานสนามสอบ' },
      { key:'receiverName', label:'ชื่อผู้รับข้อสอบ' },
      { key:'receiverTitle', label:'ตำแหน่งผู้รับข้อสอบ' },
      { key:'receiverAddress', label:'ที่อยู่ผู้รับข้อสอบ', full:true },
      { key:'receiverPhone', label:'เบอร์โทรผู้รับข้อสอบ', type:'tel' },
      { key:'receiverEmail', label:'อีเมลผู้รับข้อสอบ', type:'email' },
      { key:'receiverLineId', label:'LINE ID ผู้รับข้อสอบ' }
    ];
    const input = field => {
      const id = `org-draft-${field.key}`;
      const control = field.options
        ? `<select id="${id}" name="${field.key}" ${field.required ? 'required' : ''}><option value="">เลือกเมื่อเกี่ยวข้อง</option>${field.options.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('')}</select>`
        : `<input id="${id}" name="${field.key}" type="${field.type || 'text'}" ${field.required ? 'required' : ''} placeholder="TEST_..." autocomplete="off" />`;
      return `<div class="form-field ${field.full ? 'full' : ''}"><label for="${id}">${esc(field.label)}${field.required ? ' *' : ''}</label>${control}</div>`;
    };
    const group = (title, keys) => `<div class="org-form-section"><h3>${esc(title)}</h3><div class="demo-form">${keys.map(key => input(fields.find(field => field.key === key))).join('')}</div></div>`;
    const body = `<form id="org-draft-form">${group('ทะเบียนและที่ตั้ง',['name','type','unit','address','subdistrict','district','province','postalCode'])}${group('สนามสอบและประธาน · ระบุรอบสอบ',['examType','examSessionId','examSessionLabel','chairName','chairTitle','chairAddress','chairPhone','chairEmail','chairLineId'])}${group('ผู้รับข้อสอบประจำสนาม · ระบุให้ตรงรอบสอบ',['receiverName','receiverTitle','receiverAddress','receiverPhone','receiverEmail','receiverLineId'])}</form><div class="callout warn" style="margin-top:10px"><span>ⓘ</span><div>ข้อมูลทุกช่องต้องเป็น TEST_ เท่านั้น ช่องผู้ติดต่อใช้เป็นข้อมูลจำกัดสิทธิ์ และระเบียนสนามสอบจะรอยืนยันการผูกผู้รับกับรอบสอบก่อนใช้งานจริง</div></div>`;
    openModal({ title:'เพิ่มหน่วยงานหรือสนามสอบ TEST_', subtitle:'ระบบ 02 · TEST_FIXTURE', body, confirmText:'บันทึกร่างใน memory', cancelText:'ยกเลิก', onConfirm:() => {
      const form = modalRoot.querySelector('#org-draft-form');
      if (!form) return false;
      const controls = [...form.querySelectorAll('input,select')];
      const values = Object.fromEntries(controls.map(control => [control.name, control.value.trim()]));
      const requiredKeys = fields.filter(field => field.required).map(field => field.key);
      const invalidBase = requiredKeys.some(key => !values[key] || !values[key].startsWith('TEST_'));
      const invalidValue = Object.values(values).some(value => value && !value.startsWith('TEST_'));
      const incompleteExamAssignment = values.examType && (!values.examSessionId || !values.examSessionLabel || !values.chairName || !values.receiverName);
      if (invalidBase || invalidValue || incompleteExamAssignment) {
        showToast(incompleteExamAssignment ? 'สนามสอบต้องระบุรอบสอบ ประธานสนาม และผู้รับข้อสอบให้ครบ' : 'กรอกช่องบังคับและใช้ข้อมูล TEST_ เท่านั้น', true);
        return false;
      }
      const id = `TEST_ORG_CUSTOM_${String(MODULES.organizations.rows.filter(row => row.id.startsWith('TEST_ORG_CUSTOM_')).length + 1).padStart(3,'0')}`;
      const examSite = Boolean(values.examType);
      MODULES.organizations.rows.push({ ...values, id, sub:`${id} · ${values.examSessionId || 'TEST_เพิ่มใน session'}`, status:examSite ? 'TEST_รอยืนยันรายรอบ' : 'TEST_รอตรวจทำเนียบ', tone:examSite ? 'blue' : 'amber' });
      state.organizationType = 'all';
      state.organizationProvince = 'all';
      state.pageNumbers.organizations = Math.max(1, Math.ceil(MODULES.organizations.rows.length / PAGE_SIZE));
      render();
      showToast('เพิ่มระเบียนระบบ 02 TEST_ และรอบันทึกขึ้น Supabase แล้ว');
      return true;
    }});
  }

  function draftForm(moduleId) {
    if (moduleId === 'organizations') { organizationDraftForm(); return; }
    if (moduleId === 'correspondence') { correspondenceDraftForm(); return; }
    if (moduleId === 'admissions') {
      const levelOptions = PALI_RESULT_LEVELS.map((level,index) => `<option value="${esc(level)}" ${index === 0 ? 'selected' : ''}>${esc(level)}</option>`).join('');
      const body = `<form class="demo-form" id="pali-application-draft"><div class="form-field full"><label for="pali-draft-name">ชื่อ/ฉายาผู้สมัคร TEST_ *</label><input id="pali-draft-name" name="name" required placeholder="TEST_ผู้สมัคร" autocomplete="off" /></div><div class="form-field"><label for="pali-draft-kind">ประเภทผู้สมัคร *</label><select id="pali-draft-kind" name="applicantKind" required><option value="TEST_บรรพชิต">TEST_บรรพชิต</option><option value="TEST_คฤหัสถ์">TEST_คฤหัสถ์</option></select></div><div class="form-field"><label for="pali-draft-track">สายสอบ *</label><select id="pali-draft-track" name="paliTrack"><option value="TEST_บาลีสนามหลวง">TEST_บาลีสนามหลวง</option><option value="TEST_บาลีศึกษา">TEST_บาลีศึกษา</option></select></div><div class="form-field"><label for="pali-draft-level">ชั้น/ประโยค *</label><select id="pali-draft-level" name="level">${levelOptions}</select></div><div class="form-field"><label for="pali-draft-scope">ส่วนงาน/บัญชี *</label><select id="pali-draft-scope" name="scope"><option value="TEST_ส่วนกลาง">TEST_ส่วนกลาง · ศ.2</option><option value="TEST_ส่วนภูมิภาค">TEST_ส่วนภูมิภาค · ศ.2 / ศ.3</option></select></div><div class="form-field"><label for="pali-draft-unit">รหัสสำนักเรียน *</label><input id="pali-draft-unit" name="unit" required placeholder="TEST_ORG_..." autocomplete="off" /></div><div class="form-field full"><label for="pali-draft-session">รหัสรอบสอบ ExamSession *</label><input id="pali-draft-session" name="examSessionId" required placeholder="TEST_SESSION_..." autocomplete="off" /></div></form><div class="callout warn" style="margin-top:10px"><span>ⓘ</span><div>ต้นแบบรับเฉพาะ TEST_ และบันทึกร่าง TEST_ ในพื้นที่บัญชี; ศ.2 คือบัญชีสมัคร ส่วน ศ.3 ในส่วนภูมิภาคเป็นบัญชีเรียกชื่อ/ดำเนินการสอบตามแหล่งที่ตรวจพบ</div></div>`;
      openModal({ title:'สร้างร่างสมัครบาลี TEST_', subtitle:'ระบบ 05 · TEST_FIXTURE', body, confirmText:'บันทึกร่างใน memory', cancelText:'ยกเลิก', onConfirm:() => {
        const form = modalRoot.querySelector('#pali-application-draft');
        if (!form) return false;
        const values = Object.fromEntries([...form.querySelectorAll('input,select')].map(control => [control.name, control.value.trim()]));
        if (Object.values(values).some(value => !value || !value.startsWith('TEST_'))) { showToast('กรอกทุกช่องด้วยข้อมูลที่ขึ้นต้น TEST_ เท่านั้น', true); return false; }
        const id = `TEST_APPLICANT_${String(MODULES.admissions.rows.length + 1).padStart(3,'0')}`;
        const regional = values.scope === 'TEST_ส่วนภูมิภาค';
        MODULES.admissions.rows.push({ id, name:values.name, sub:`${id} · TEST_ร่างใน memory`, applicantKind:values.applicantKind, paliTrack:values.paliTrack, level:values.level, formType:regional ? 'TEST_ส่วนภูมิภาค · ศ.2 / ศ.3' : 'TEST_ส่วนกลาง · ศ.2', unit:values.unit, examSessionId:values.examSessionId, status:'TEST_ร่างสมัคร', tone:'blue' });
        state.admissionsScope = 'all';
        state.pageNumbers.admissions = Math.max(1,Math.ceil(MODULES.admissions.rows.length / PAGE_SIZE));
        state.drafts += 1;
        render();
        showToast('เพิ่มร่างสมัครบาลี TEST_ และรอบันทึกขึ้น Supabase แล้ว');
        return true;
      }});
      return;
    }
    if (moduleId === 'requests') {
      const typeOptions = REQUEST_TYPE_OPTIONS.map(type => `<option value="${esc(type)}">${esc(type)}</option>`).join('');
      const provinceOptions = REQUEST_PROVINCE_OPTIONS.map(province => `<option value="${esc(province)}">${esc(province)}</option>`).join('');
      const body = `<form class="demo-form" id="request-draft-form"><div class="form-field full"><label for="request-draft-type">ประเภทคำขอ *</label><select id="request-draft-type" name="type" required><option value="" selected disabled>เลือกประเภทคำขอ</option>${typeOptions}</select></div><div class="form-field full"><label for="request-draft-target">สำนักหรือสนามสอบที่เกี่ยวข้อง *</label><input id="request-draft-target" name="target" required placeholder="TEST_..." autocomplete="off" /></div><div class="form-field"><label for="request-draft-unit">หน่วยงานผู้ยื่น *</label><input id="request-draft-unit" name="unit" required placeholder="TEST_..." autocomplete="off" /></div><div class="form-field"><label for="request-draft-province">จังหวัด *</label><select id="request-draft-province" name="province" required><option value="" selected disabled>เลือกจังหวัด TEST_</option>${provinceOptions}</select></div><div class="form-field full"><label for="request-draft-summary">รายละเอียดสำหรับสาธิต *</label><textarea id="request-draft-summary" name="summary" required placeholder="TEST_..." autocomplete="off"></textarea></div></form><div class="callout warn" style="margin-top:10px"><span>ⓘ</span><div>บันทึกได้เฉพาะร่าง TEST_ ในหน่วยความจำของ browser ไม่มีการส่งคำขอจริง ไม่มีไฟล์แนบ ไม่มีเลขรับทางการ และไม่ก่อให้เกิดการอนุมัติ</div></div>`;
      openModal({ title:'สร้างร่างคำขอ TEST_', subtitle:'ระบบ 04 · TEST_FIXTURE', body, confirmText:'บันทึกร่างใน memory', cancelText:'ยกเลิก', onConfirm:() => {
        const form = modalRoot.querySelector('#request-draft-form');
        if (!form) return false;
        const values = Object.fromEntries([...form.querySelectorAll('input,select,textarea')].map(control => [control.name, control.value.trim()]));
        if (Object.values(values).some(value => !value || !value.startsWith('TEST_'))) {
          showToast('กรุณากรอกทุกช่องด้วยข้อมูลที่ขึ้นต้น TEST_', true);
          return false;
        }
        const category = /สำนักเรียน|สำนักศาสนศึกษา/.test(values.type) ? REQUEST_CATEGORY_OPTIONS[0] : REQUEST_CATEGORY_OPTIONS[1];
        const id = `TEST_REQ_DRAFT_${String(state.drafts + 1).padStart(3, '0')}`;
        MODULES.requests.rows.unshift({
          id, name:id, sub:'TEST_ร่างในพื้นที่ข้อมูล TEST_ · ไม่ใช่เลขรับจริง', type:values.type, category,
          target:values.target, unit:values.unit, province:values.province, summary:values.summary,
          status:'TEST_ร่างคำขอจำลอง', currentStep:'TEST_รับข้อมูลจำลอง', timeline:['TEST_สร้างร่างในพื้นที่ข้อมูล TEST_'],
          relatedOrgId:'TEST_ยังไม่เชื่อมหน่วยงาน', attachmentSummary:'TEST_ไม่มีเอกสารจริง', officialOutcome:'TO VERIFY', tone:'amber'
        });
        state.drafts += 1;
        state.requestsCategory = 'all'; state.requestsType = 'all'; state.requestsProvince = 'all'; state.requestsStatus = 'all';
        state.listSearch.requests = ''; state.pageNumbers.requests = 1;
        render();
        showToast('สร้างร่างคำขอ TEST_ และรอบันทึกขึ้น Supabase แล้ว · ไม่มีการส่งหรืออนุมัติจริง');
        return true;
      }});
      return;
    }
    if (moduleId === 'people') {
      state.draftPersonName = '';
      state.draftEducationPositions = [];
      const fields = [
        { key: 'name', label: 'ชื่อบุคคล', required: true },
        { key: 'type', label: 'ประเภทบุคคล (บรรพชิต/คฤหัสถ์)', required: true },
        { key: 'section', label: 'แท่ง/แผนก', required: true, list: 'people-section-options' },
        { key: 'office', label: 'สำนัก/หน่วยงานที่สังกัด', required: true },
        { key: 'temple', label: 'สังกัดวัด', required: true },
        { key: 'subdistrict', label: 'ตำบล', required: true },
        { key: 'district', label: 'อำเภอ', required: true },
        { key: 'province', label: 'จังหวัด', required: true },
        { key: 'sanghaRegion', label: 'ภาค (เลือกภาค 1–18)', required: true, options: PEOPLE_SANGHA_REGIONS },
        { key: 'region', label: 'เขตหน/พื้นที่ (ถ้ามี)', required: true, list: 'people-region-options' },
        { key: 'phone', label: 'เบอร์โทรติดต่อ · จำกัดสิทธิ์', required: false, type: 'tel' },
        { key: 'email', label: 'อีเมล · จำกัดสิทธิ์', required: false, type: 'email' },
        { key: 'lineId', label: 'LINE ID · จำกัดสิทธิ์', required: false }
      ];
      const fieldsHtml = fields.map(({ key, label, required, list, options, type = 'text' }) => {
        const control = options
          ? `<select id="draft-${key}" name="${esc(key)}" ${required ? 'required' : ''}><option value="" selected disabled>เลือกภาค</option>${options.map(item => `<option value="${esc(item.value)}">${esc(item.label)}</option>`).join('')}</select>`
          : `<input id="draft-${key}" name="${esc(key)}" type="${type}" ${required ? 'required' : ''} ${list ? `list="${list}"` : ''} placeholder="TEST_..." autocomplete="off" />`;
        return `<div class="form-field ${['name','office','temple'].includes(key) ? 'full' : ''}"><label for="draft-${key}">${esc(label)}${required ? ' *' : ''}</label>${control}</div>`;
      }).join('');
      const governanceOptions = GOVERNANCE_POSITION_OPTIONS.map(value => `<option value="${esc(value)}">${esc(value.replace(/^TEST_/, ''))}</option>`).join('');
      const educationOptions = EDUCATION_POSITION_OPTIONS.map((value,index) => `<label class="position-role-option"><input id="draft-education-position-${index + 1}" type="checkbox" name="educationPositions" value="${esc(value)}" data-education-position="${esc(value)}" /><span>${esc(value.replace(/^TEST_/, ''))}</span></label>`).join('');
      const sectionOptions = PEOPLE_SECTIONS.map(value => `<option value="${esc(value)}"></option>`).join('');
      const regionOptions = PEOPLE_REGION_OPTIONS.map(value => `<option value="${esc(value)}"></option>`).join('');
      const body = `<form class="demo-form" id="draft-form"><div class="position-role-section full"><label for="draft-governancePosition">ตำแหน่งทางการปกครอง</label><select id="draft-governancePosition" name="governancePosition"><option value="">ไม่ระบุตำแหน่ง</option>${governanceOptions}</select></div><fieldset class="position-role-section full"><legend>ตำแหน่ง จศป. ฝ่ายการศึกษา · เลือกได้มากกว่า 1 ตำแหน่ง</legend><div class="position-role-grid">${educationOptions}</div><div id="education-role-warning" aria-live="polite"></div></fieldset>${fieldsHtml}<datalist id="people-section-options">${sectionOptions}</datalist><datalist id="people-region-options">${regionOptions}</datalist></form><div class="modal-hint">รายการตำแหน่งเป็นตัวอย่าง TEST_ · ภาคเลือกได้ 1–18 · ช่องทางติดต่อไม่บังคับและเป็นข้อมูลจำกัดสิทธิ์ · ตำแหน่งและสายบังคับบัญชาจริงรอเจ้าของข้อมูลยืนยัน</div>`;
      openModal({ title: 'เพิ่มระเบียนบุคคล TEST_', subtitle: 'ระบบ 01 · TEST_FIXTURE', body, confirmText: 'สร้างร่างใน memory', cancelText: 'ยกเลิก', onConfirm: () => {
        const form = modalRoot.querySelector('#draft-form');
        const inputs = [...form.querySelectorAll('input:not([type="checkbox"]), select')];
        const invalid = inputs.some(input => {
          const value = input.value.trim();
          return (input.required && !value) || (value && !value.startsWith('TEST_'));
        });
        if (invalid) {
          showToast('ช่องบังคับต้องกรอก และทุกค่าที่กรอกต้องขึ้นต้น TEST_', true);
          return false;
        }
        if (!form.querySelector('#draft-governancePosition').value && !state.draftEducationPositions.length) {
          showToast('เลือกตำแหน่งทางการปกครองอย่างน้อย 1 ตำแหน่ง หรือเลือกตำแหน่ง จศป. ฝ่ายการศึกษา', true);
          return false;
        }
        state.drafts += 1;
        showToast(`สร้างร่างบุคคล TEST_ และรอบันทึกขึ้น Supabase แล้ว · ทั้งหมด ${state.drafts} รายการ`);
        return true;
      }});
      updateEducationPositionWarning();
      return;
    }
    const names = {
      organizations: ['ชื่อหน่วยงาน TEST_', 'ประเภท TEST_', 'จังหวัด TEST_'],
      requests: ['ประเภทคำขอ TEST_', 'หน่วยงานผู้ยื่น TEST_', 'คำอธิบาย TEST_'],
      admissions: ['ชื่อผู้สมัคร TEST_', 'ประเภทผู้สมัคร TEST_ (บรรพชิต/คฤหัสถ์)', 'ชั้น/ประโยค TEST_', 'ชนิดบัญชี TEST_ (ส่วนกลาง/ภูมิภาค)', 'รหัสสำนักเรียน TEST_', 'รหัสรอบสอบ TEST_'],
      budget: ['ชื่อแผน TEST_', 'วงเงิน satang TEST_', 'ปีงบประมาณ TEST_'],
      assets: ['ชื่อพัสดุ TEST_', 'ประเภท TEST_', 'รหัสหน่วยงาน TEST_'],
      correspondence: ['เรื่องหนังสือ TEST_', 'หน่วยงานปลายทาง TEST_', 'ประเภทเอกสาร TEST_']
    }[moduleId] || ['รายละเอียด TEST_'];
    const fields = names.map((name, i) => `<div class="form-field ${i === names.length - 1 ? 'full' : ''}"><label for="draft-${i}">${esc(name)}</label><input id="draft-${i}" name="field-${i}" required placeholder="TEST_..." ${moduleId === 'budget' && i === 1 ? 'inputmode="numeric"' : ''} /></div>`).join('');
    const formBody = `<form class="demo-form" id="draft-form">${fields}</form><div class="modal-hint">ข้อมูลต้องขึ้นต้นด้วย TEST_ และจะอยู่เป็นข้อมูล TEST_ และบันทึกใน Supabase เมื่อยืนยัน ไม่บันทึกลงฐานข้อมูล/บัญชีจริง และไม่ใช่การอนุมัติ</div>`;
    openModal({ title: 'สร้างร่าง TEST_', subtitle: MODULES[moduleId]?.code || 'DEMO', body: formBody, confirmText: 'สร้างร่างใน memory', cancelText: 'ยกเลิก', onConfirm: () => {
      const form = modalRoot.querySelector('#draft-form');
      const values = [...form.querySelectorAll('input')].map(input => input.value.trim());
      if (values.some(value => !value || !value.startsWith('TEST_'))) {
        showToast('กรุณากรอกทุกช่องด้วยข้อมูลที่ขึ้นต้น TEST_', true);
        return false;
      }
      state.drafts += 1;
      showToast(`สร้างร่าง TEST_ และรอบันทึกขึ้น Supabase แล้ว · ทั้งหมด ${state.drafts} รายการ`);
      return true;
    }});
  }

  function openRow(moduleId, rowId) {
    if (moduleId === 'correspondence') { openCorrespondenceDetail(rowId); return; }
    const row = MODULES[moduleId]?.rows.find(item => item.id === rowId);
    if (!row) return;
    if (moduleId === 'admissions') {
      const fields = [['รหัสระเบียน','id'],['ผู้สมัคร TEST_','name'],['ประเภทผู้สมัคร','applicantKind'],['สายสอบ','paliTrack'],['ชั้น/ประโยค','level'],['ประเภทบัญชี','formType'],['สำนักเรียน','unit'],['ExamSession','examSessionId'],['สถานะจำลอง','status']];
      const detailRows = fields.map(([label,key]) => `<div class="note-row"><div><b>${esc(label)}</b><p>${esc(row[key] || 'TO VERIFY')}</p></div></div>`).join('');
      openModal({ title:row.name, subtitle:'PALI REGISTRATION · TEST_FIXTURE', body:`<div class="callout warn"><span>ⓘ</span><div>ข้อมูลตัวอย่าง TEST_ เท่านั้น ไม่มีข้อมูลส่วนบุคคลหรือสถานะสมัครจริง</div></div><section class="profile-section"><h3>บัญชีสมัครจำลอง</h3>${detailRows}</section><div class="modal-hint">การตรวจคุณสมบัติ เอกสาร แบบบัญชีรุ่นปัจจุบัน และเลขสอบต้องทำตามระเบียบ/สิทธิ์ที่เจ้าของข้อมูลยืนยัน</div>`, confirmText:'ปิด' });
      return;
    }
    if (moduleId === 'requests') {
      const fields = [['เลขอ้างอิงสาธิต','id'],['ประเภทคำขอ','type'],['หมวด','category'],['สำนัก/สนามสอบ','target'],['หน่วยงานผู้ยื่น','unit'],['จังหวัด','province'],['รหัสหน่วยงานที่เชื่อม','relatedOrgId'],['สถานะจำลอง','status'],['ขั้นตอนจำลอง','currentStep'],['เอกสารแนบ','attachmentSummary'],['ผลพิจารณาทางการ','officialOutcome']];
      const detailRows = fields.map(([label,key]) => `<div class="note-row"><div><b>${esc(label)}</b><p>${esc(row[key] || 'TO VERIFY')}</p></div></div>`).join('');
      const events = (Array.isArray(row.timeline) ? row.timeline : []).map((event,index) => `<li class="request-timeline-item"><span class="request-timeline-marker">${index + 1}</span><div><b>${esc(event)}</b><p>วันบันทึก: TO VERIFY · ผู้บันทึก: TO VERIFY</p></div></li>`).join('') || '<li class="request-timeline-item">ยังไม่มีเหตุการณ์จำลอง</li>';
      const body = `<div class="callout warn"><span>ⓘ</span><div>ข้อมูลทั้งระเบียนเป็น TEST_ · เส้นทางและชื่อสถานะเป็นเพียงต้นแบบ ไม่มีคำสั่ง อำนาจอนุมัติ ผลพิจารณา วันจริง หรือเอกสารจริง</div></div><section class="profile-section"><h3>ข้อมูลคำขอ</h3>${detailRows}</section><section class="profile-section request-timeline"><h3>ประวัติความคืบหน้า</h3><ol>${events}</ol></section><div class="modal-hint">ต้องยืนยันชนิดคำขอ ผู้มีอำนาจ/ผู้ตรวจ ขั้นตอน เอกสารประกอบ วันที่มีผล/บันทึก วิธีแจ้งผล การเปิดเผยข้อมูล และระยะเวลาเก็บรักษากับเจ้าของระเบียบก่อนใช้งานจริง</div>`;
      openModal({ title:row.name || row.id, subtitle:'REQUEST TRACKING · TEST_FIXTURE', body, confirmText:'ปิด' });
      return;
    }
    if (moduleId === 'organizations') {
      const value = field => row[field] || 'TO VERIFY';
      const profileFields = [['รหัสระเบียน','id'],['ประเภทหน่วยงาน','type'],['พื้นที่/สังกัด','unit'],['ที่อยู่','address'],['ตำบล','subdistrict'],['อำเภอ','district'],['จังหวัด','province'],['รหัสไปรษณีย์','postalCode']];
      const sessionFields = [['ประเภทสนามสอบ','examType'],['รหัสรอบสอบ (ExamSession)','examSessionId'],['ชื่อรอบสอบ','examSessionLabel']];
      const section = (title, fields, className='') => `<section class="profile-section ${className}"><h3>${esc(title)}</h3>${fields.map(([label,field]) => `<div class="note-row"><div><b>${esc(label)}</b><p>${esc(value(field))}</p></div></div>`).join('')}</section>`;
      const examFields = row.examType ? section('สนามสอบและรอบสอบ',sessionFields) : '';
      const chairman = [['ชื่อประธานสนามสอบ','chairName'],['ตำแหน่ง','chairTitle'],['ที่อยู่','chairAddress'],['เบอร์โทร','chairPhone'],['อีเมล','chairEmail'],['LINE ID','chairLineId']];
      const recipient = [['ชื่อผู้รับข้อสอบ','receiverName'],['ตำแหน่ง','receiverTitle'],['ที่อยู่','receiverAddress'],['เบอร์โทร','receiverPhone'],['อีเมล','receiverEmail'],['LINE ID','receiverLineId']];
      const contacts = row.examType ? `${section('ประธานสนามสอบ · จำกัดสิทธิ์',chairman,'contact-restricted')}${section('ผู้รับข้อสอบประจำสนาม · จำกัดสิทธิ์',recipient,'contact-restricted')}` : '<p class="modal-hint">ยังไม่มีการกำหนดผู้ประสานงานสนามสอบสำหรับหน่วยงานนี้</p>';
      openModal({ title:row.name || row.id, subtitle:'ORGANIZATION DIRECTORY · TEST_FIXTURE', body:`<div class="callout warn"><span>ⓘ</span><div>ระเบียนตัวอย่าง TEST_ เท่านั้น · ช่องทางติดต่อจัดเป็นข้อมูลจำกัดสิทธิ์ แต่ต้นแบบนี้ยังไม่มี server authorization หรือ field-level access; ห้ามใส่ข้อมูลติดต่อจริง</div></div>${section('ข้อมูลหน่วยงานและที่ตั้ง',profileFields)}${examFields}${contacts}<p class="modal-hint">ผู้รับข้อสอบและช่องทางติดต่อควรผูกกับ ExamSession พร้อมวันมีผล/วันบันทึกและประวัติแก้ไข ส่วนข้อมูลสาธารณะต้องผ่าน field allowlist และอนุมัติ release ก่อนเผยแพร่</p>`, confirmText:'ปิด' });
      return;
    }
    if (moduleId === 'people') {
      const profileGroups = [
        ['ข้อมูลบุคคล', [['รหัสระเบียน', row.id], ['ประเภทบุคคล', row.type]]],
        ['ตำแหน่ง', [['ตำแหน่งทางการปกครอง', row.governancePosition || 'TEST_ไม่ระบุ'], ['ตำแหน่ง จศป. ฝ่ายการศึกษา', educationPositionsOf(row.educationPositions).join(' · ') || 'TEST_ไม่ระบุ'], ['แท่ง/แผนก', row.section]]],
        ['สังกัดและพื้นที่', [['สำนัก/หน่วยงาน', row.office], ['สังกัดวัด', row.temple], ['ตำบล', row.subdistrict], ['อำเภอ', row.district], ['จังหวัด', row.province], ['ภาค (1–18)', row.sanghaRegion], ['เขตหน/พื้นที่', row.region]]]
      ];
      const sections = profileGroups.map(([title, fields]) => `<section class="profile-section"><h3>${esc(title)}</h3>${fields.map(([label, value]) => `<div class="note-row"><div><b>${esc(label)}</b><p>${esc(value)}</p></div></div>`).join('')}</section>`).join('');
      const roleWarnings = educationPositionWarnings(row.name, row.educationPositions, [row.id]);
      const roleWarningMarkup = roleWarnings.length ? `<div class="callout warn role-overlap-warning" role="status"><span>ⓘ</span><div>${roleWarnings.map(esc).join('<br />')}</div></div>` : '';
      const statusHistory = `<section class="profile-section status-history"><h3>ตรวจสอบสถานะและประวัติรายการ</h3><div class="note-row"><div><b>ประเภทเหตุสถานะ</b><p>${esc(row.changeType)}</p></div></div><div class="note-row"><div><b>ข้อมูลสถานะ</b><p>${esc(row.changeSummary)}</p></div></div><div class="note-row"><div><b>วันที่มีผล</b><p>${esc(row.effectiveDate)}</p></div></div><div class="note-row"><div><b>วันที่บันทึก</b><p>${esc(row.recordedDate)}</p></div></div><div class="note-row"><div><b>หลักฐานอ้างอิง</b><p>${esc(row.evidence)}</p></div></div><p class="modal-hint">ตัวอย่างนี้ไม่ใช่คำสั่งหรือผลพิจารณา ต้องยืนยันนิยามสถานะ ผู้บันทึก หลักฐาน และวันมีผล/วันบันทึกกับเจ้าของงาน</p></section>`;
      const contacts = [['เบอร์โทรติดต่อ', row.phone], ['อีเมล', row.email], ['LINE ID', row.lineId]].map(([label, value]) => `<div class="note-row"><div><b>${esc(label)}</b><p>${esc(value || 'TEST_ไม่ระบุ')}</p></div></div>`).join('');
      openModal({ title: row.name || row.id, subtitle: 'PEOPLE · TEST_FIXTURE', body: `<div class="callout warn"><span>ⓘ</span><div>โปรไฟล์สาธิตเท่านั้น ข้อมูลติดต่อในตัวอย่างขึ้นต้น TEST_ · ระบบนี้ยังไม่มีบัญชีงาน, server authorization, field-level access หรือฐานข้อมูลจริง จึงห้ามใส่ข้อมูลติดต่อจริง</div></div>${sections}${roleWarningMarkup}${statusHistory}<section class="profile-section contact-restricted"><h3>ช่องทางติดต่อ · จำกัดสิทธิ์</h3>${contacts}<p class="modal-hint">ก่อนเชื่อมข้อมูลจริง ต้องยืนยันเจ้าของข้อมูล วัตถุประสงค์ ฐานการใช้ ระยะเก็บ ผู้มีสิทธิ์อ่าน/แก้ไข/ส่งออก และ audit จากหน่วยงาน</p></section>`, confirmText: 'ปิด' });
      return;
    }
    const items = Object.entries(row).filter(([key]) => key !== 'tone').map(([key, value]) => `<div class="note-row"><div><b>${esc(key)}</b><p>${esc(typeof value === 'number' && key.endsWith('Satang') ? `TEST_฿ ${money(value)}` : value)}</p></div></div>`).join('');
    openModal({ title: row.name || row.id, subtitle: `${moduleId.toUpperCase()} · TEST_FIXTURE`, body: `<div class="callout warn"><span>ⓘ</span><div>ข้อมูลสาธิตเท่านั้น ไม่มีคำสั่ง/ผล/หลักฐานจริง และหน้านี้ไม่ได้ยืนยันสิทธิ์ฝั่ง server</div></div><div style="margin-top:10px">${items}</div>`, confirmText: 'ปิด' });
  }

  function getDataRows(moduleId) {
    return moduleId === 'pali' ? COURSES : MODULES[moduleId]?.rows || [];
  }

  function setDataRows(moduleId, rows) {
    if (moduleId === 'pali') COURSES.splice(0, COURSES.length, ...rows);
    else if (MODULES[moduleId]) MODULES[moduleId].rows.splice(0, MODULES[moduleId].rows.length, ...rows);
  }

  function xmlEscape(value) {
    return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  }

  function columnName(index) {
    let result = '';
    for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) result = String.fromCharCode(65 + ((value - 1) % 26)) + result;
    return result;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function joinBytes(chunks) {
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    chunks.forEach(chunk => { result.set(chunk, offset); offset += chunk.length; });
    return result;
  }

  function zipStored(files) {
    const encoder = new TextEncoder();
    const localParts = [], centralParts = [];
    let offset = 0;
    files.forEach(([name, text]) => {
      const fileName = encoder.encode(name), data = encoder.encode(text), crc = crc32(data);
      const local = new Uint8Array(30 + fileName.length), localView = new DataView(local.buffer);
      localView.setUint32(0,0x04034b50,true); localView.setUint16(4,20,true); localView.setUint16(6,0x0800,true);
      localView.setUint16(8,0,true); localView.setUint16(10,0,true); localView.setUint16(12,0,true);
      localView.setUint32(14,crc,true); localView.setUint32(18,data.length,true); localView.setUint32(22,data.length,true);
      localView.setUint16(26,fileName.length,true); localView.setUint16(28,0,true); local.set(fileName,30);
      const central = new Uint8Array(46 + fileName.length), centralView = new DataView(central.buffer);
      centralView.setUint32(0,0x02014b50,true); centralView.setUint16(4,20,true); centralView.setUint16(6,20,true);
      centralView.setUint16(8,0x0800,true); centralView.setUint16(10,0,true); centralView.setUint16(12,0,true); centralView.setUint16(14,0,true);
      centralView.setUint32(16,crc,true); centralView.setUint32(20,data.length,true); centralView.setUint32(24,data.length,true);
      centralView.setUint16(28,fileName.length,true); centralView.setUint16(30,0,true); centralView.setUint16(32,0,true);
      centralView.setUint16(34,0,true); centralView.setUint16(36,0,true); centralView.setUint32(38,0,true); centralView.setUint32(42,offset,true);
      central.set(fileName,46);
      localParts.push(local,data); centralParts.push(central); offset += local.length + data.length;
    });
    const central = joinBytes(centralParts), centralOffset = offset;
    const end = new Uint8Array(22), endView = new DataView(end.buffer);
    endView.setUint32(0,0x06054b50,true); endView.setUint16(4,0,true); endView.setUint16(6,0,true);
    endView.setUint16(8,files.length,true); endView.setUint16(10,files.length,true);
    endView.setUint32(12,central.length,true); endView.setUint32(16,centralOffset,true); endView.setUint16(20,0,true);
    return joinBytes([...localParts,central,end]);
  }

  function makeXlsx(moduleId, templateOnly = false) {
    const config = DATA_IMPORT_CONFIG[moduleId];
    if (!config) return null;
    const records = templateOnly ? [] : getDataRows(moduleId).map(row => moduleId === 'correspondence' && row.classification !== 'TEST_ทั่วไป' ? { ...row, name:'TEST_เอกสารจำกัดสิทธิ์' } : row);
    const matrix = [config.fields.map(([header])=>header), ...records.map(row=>config.fields.map(([,key])=>key === 'educationPositions' ? serializeEducationPositions(row[key]) : row[key] ?? ''))];
    const rowsXml = matrix.map((row,rowIndex) => {
      const cells = row.map((value,colIndex) => `<c r="${columnName(colIndex)}${rowIndex+1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`).join('');
      return `<row r="${rowIndex+1}">${cells}</row>`;
    }).join('');
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml}</sheetData></worksheet>`;
    const files = [
      ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
      ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="TEST_data" sheetId="1" r:id="rId1"/></sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
      ['xl/worksheets/sheet1.xml',sheet]
    ];
    return zipStored(files);
  }

  function exportXlsx(moduleId, templateOnly = false) {
    const bytes = makeXlsx(moduleId, templateOnly);
    if (!bytes) { showToast('ระบบนี้ยังไม่มีโครงสร้าง Excel สำหรับส่งออก', true); return; }
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TEST_${moduleId}_${templateOnly ? 'template' : 'export'}.xlsx`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast(`${templateOnly ? 'สร้างแม่แบบ' : 'ส่งออก'} Excel TEST_ แล้ว`);
  }

  function validateDataRows(moduleId, rawRows) {
    const config = DATA_IMPORT_CONFIG[moduleId];
    if (!config || !rawRows.length) throw new Error('ไม่พบโครงสร้างข้อมูลหรือหัวตาราง');
    const headers = rawRows[0].map(value=>String(value ?? '').replace(/^\uFEFF/,'').trim());
    const missing = config.fields.map(([header])=>header).filter(header=>!headers.includes(header));
    if (missing.length) throw new Error(`ขาดหัวคอลัมน์: ${missing.join(', ')}`);
    const rows = rawRows.slice(1).map(values => Object.fromEntries(config.fields.map(([header,key])=>[key,String(values[headers.indexOf(header)] ?? '').trim()]))).filter(row=>Object.values(row).some(Boolean));
    if (moduleId === 'people') rows.forEach(row => { row.educationPositions = educationPositionsOf(row.educationPositions); });
    const rowErrors = rows.map(row => {
      const errors = [];
      config.fields.forEach(([header,key]) => {
        const value = key === 'educationPositions' ? serializeEducationPositions(row[key]) : String(row[key] ?? '');
        if (!value && config.optionalFields?.includes(key)) return;
        if (!value) errors.push(`ขาด${header}`);
        else if ((config.numeric || []).includes(key)) {
          if (!/^(0|[1-9]\d*)$/.test(value) || !Number.isSafeInteger(Number(value))) errors.push(`${header}ต้องเป็นจำนวนเต็มไม่ติดลบ`);
        } else if (key === 'id' && !value.startsWith('TEST_')) errors.push(`${header}ต้องขึ้นต้น TEST_`);
        else if (!value.startsWith('TEST_') && value !== 'TO VERIFY' && !getDataRows(moduleId).some(item=>String(item[key] ?? '') === value)) errors.push(`${header}ต้องเป็นค่า TEST_ หรือค่ารายการเดิมที่มีอยู่`);
      });
      if (moduleId === 'organizations' && row.examType) {
        const assignmentRequired = [['examSessionId','รหัสรอบสอบ'],['examSessionLabel','ชื่อรอบสอบ'],['chairName','ชื่อประธานสนามสอบ'],['receiverName','ชื่อผู้รับข้อสอบ']];
        assignmentRequired.forEach(([key,label]) => { if (!row[key]) errors.push(`ขาด${label}สำหรับสนามสอบ`); });
      }
      if (moduleId === 'people') {
        const positions = educationPositionsOf(row.educationPositions);
        if (!row.governancePosition && positions.length === 0) errors.push('ต้องระบุตำแหน่งทางการปกครองหรือตำแหน่งฝ่ายการศึกษาอย่างน้อย 1 ตำแหน่ง');
        if (row.governancePosition && !GOVERNANCE_POSITION_OPTIONS.includes(row.governancePosition)) errors.push('ตำแหน่งทางการปกครองไม่อยู่ในรายการที่กำหนด');
        positions.forEach(position => { if (!EDUCATION_POSITION_OPTIONS.includes(position)) errors.push(`ตำแหน่งฝ่ายการศึกษาไม่อยู่ในรายการที่กำหนด: ${position}`); });
        if (new Set(positions).size !== positions.length) errors.push('พบตำแหน่งฝ่ายการศึกษาซ้ำในแถวเดียวกัน');
      }
      if (moduleId === 'pali' && !COURSE_TAXONOMY_KEYS.has([row.track, row.domain, row.level, row.subject].join('|'))) {
        errors.push('ประเภทคลัง สายหลักสูตร ชั้น/ระดับ และวิชาไม่ตรงกับรายการที่กำหนด');
      }
      return errors;
    });
    const rowWarnings = rows.map((row,index) => {
      if (moduleId !== 'people') return [];
      const warnings = educationPositionWarnings(row.name,row.educationPositions,[row.id]);
      const normalizedName = String(row.name ?? '').trim().replace(/\s+/g,' ').toLocaleLowerCase('th-TH');
      if (normalizedName) rows.forEach((other,otherIndex) => {
        if (otherIndex === index || other.id === row.id) return;
        if (String(other.name ?? '').trim().replace(/\s+/g,' ').toLocaleLowerCase('th-TH') === normalizedName
          && educationPositionsOf(other.educationPositions).length) {
          warnings.push(`ชื่อซ้ำกับแถว ${otherIndex + 2} ที่มีตำแหน่งฝ่ายการศึกษา ${educationPositionsOf(other.educationPositions).join(' / ')} · ตรวจสอบบุคคลและตำแหน่งซ้ำ/ทับซ้อน`);
        }
      });
      return [...new Set(warnings)];
    });
    const seen = new Set();
    rows.forEach((row,index)=>{ if (seen.has(row.id)) rowErrors[index].push('รหัสระเบียนซ้ำในไฟล์'); seen.add(row.id); });
    if (moduleId === 'pali') {
      const seenCourses = new Set();
      rows.forEach((row,index)=>{
        const key = [row.track,row.domain,row.level,row.subject].join('|');
        if (seenCourses.has(key)) rowErrors[index].push('พบคู่คลัง–ชั้น/ระดับ–วิชาซ้ำในไฟล์');
        seenCourses.add(key);
        if (COURSES.some(current => current.id !== row.id && [current.track,current.domain,current.level,current.subject].join('|') === key)) rowErrors[index].push('คู่คลัง–ชั้น/ระดับ–วิชามีอยู่แล้วในทะเบียน');
      });
    }
    return { rows, rowErrors, rowWarnings, errors: rowErrors.flat() };
  }

  function loadDataRows(moduleId, rawRows, fileName) {
    const checked = validateDataRows(moduleId, rawRows);
    const existingIds = new Set(getDataRows(moduleId).map(row=>row.id));
    const overwriteCount = checked.rows.filter(row=>existingIds.has(row.id)).length;
    state.dataImport = { moduleId, fileName, ...checked, overwriteCount, addCount: checked.rows.length - overwriteCount, committed: false };
    state.pageNumbers['data-import-preview'] = 1;
    render();
    showToast(`อ่าน preview แล้ว · เพิ่ม ${state.dataImport.addCount} · เขียนทับ ${overwriteCount} · ${checked.errors.length} ข้อผิดพลาด`, checked.errors.length > 0);
  }

  async function loadDataImportFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('ต้นแบบจำกัดขนาดไฟล์ไม่เกิน 5 MB', true); return; }
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx','csv'].includes(extension)) { showToast('รองรับเฉพาะไฟล์ .xlsx หรือ .csv', true); return; }
    try {
      const rawRows = extension === 'csv' ? parseCSV(await file.text()) : await parseXlsx(file);
      loadDataRows(state.selectedDataModule, rawRows, file.name);
    } catch (error) {
      state.dataImport = null; render(); showToast(error?.message || 'อ่านไฟล์ไม่สำเร็จ', true);
    }
  }

  function confirmDataImport() {
    const imp = state.dataImport;
    if (!imp || imp.errors.length || !imp.rows.length || imp.committed || imp.moduleId !== state.selectedDataModule) { showToast('ต้องเลือกไฟล์ของระบบที่ตรงกันและผ่าน validation ก่อน', true); return; }
    const overwriteCount = imp.rows.filter(row=>getDataRows(imp.moduleId).some(current=>current.id===row.id)).length;
    const addCount = imp.rows.length - overwriteCount;
    const overwriting = overwriteCount > 0;
    openModal({
      title: overwriting ? 'พบข้อมูลเดิม ต้องการเขียนทับหรือไม่?' : 'ยืนยันเพิ่มข้อมูล Excel?',
      subtitle: 'ยืนยันก่อนเปลี่ยนข้อมูล · TEST_',
      body: `<div class="overwrite-warning"><strong>ตรวจพบ:</strong> เพิ่ม ${addCount} รายการ · เขียนทับข้อมูลเดิม ${overwriteCount} รายการ<br />การเขียนทับจะจับคู่ด้วยรหัสระเบียน TEST_ และเปลี่ยนเฉพาะข้อมูลในชุดทดสอบของบัญชีนี้</div><p style="margin-top:10px">เลือก “ยืนยัน” เพื่อดำเนินการ หรือ “ยกเลิก” เพื่อคงข้อมูลเดิม</p>`,
      confirmText: overwriting ? 'ยืนยันเขียนทับ' : 'ยืนยันเพิ่มข้อมูล', cancelText: 'ยกเลิก',
      onConfirm: () => {
        const existing = getDataRows(imp.moduleId).map(row=>({...row}));
        const byId = new Map(existing.map((row,index)=>[row.id,index]));
        imp.rows.forEach(row=>{
          const index = byId.get(row.id);
          if (index === undefined) { byId.set(row.id,existing.length); existing.push({...row,sub:`${row.id} · TEST_นำเข้า`,tone:''}); }
          else existing[index] = {...existing[index],...row};
        });
        setDataRows(imp.moduleId,existing);
        imp.committed = true;
        render();
        showToast(`ยืนยันนำเข้า TEST_ แล้ว · เพิ่ม ${addCount} · เขียนทับ ${overwriteCount}`);
        return true;
      }
    });
  }

  function exportCSV(moduleId) {
    const module = MODULES[moduleId];
    if (!module) return;
    const rows = moduleId === 'assets' ? assetInventoryRows() : module.rows;
    const exportFields = {
      people: { headers: ['บุคคล', 'ประเภทบุคคล', 'ตำแหน่งทางการปกครอง', 'ตำแหน่ง จศป. ฝ่ายการศึกษา (หลายตำแหน่งคั่นด้วย |)', 'แท่ง/แผนก', 'สำนัก/หน่วยงาน', 'สังกัดวัด', 'ตำบล', 'อำเภอ', 'จังหวัด', 'ภาค (1–18)'], values: row => [row.name, row.type, row.governancePosition, serializeEducationPositions(row.educationPositions), row.section, row.office, row.temple, row.subdistrict, row.district, row.province, row.sanghaRegion] },
      organizations: { headers: DATA_IMPORT_CONFIG.organizations.fields.map(([label])=>label), values: row => DATA_IMPORT_CONFIG.organizations.fields.map(([,key])=>row[key] ?? '') },
      requests: { headers: DATA_IMPORT_CONFIG.requests.fields.map(([label])=>label), values: row => DATA_IMPORT_CONFIG.requests.fields.map(([,key])=>row[key] ?? '') },
      admissions: { headers: DATA_IMPORT_CONFIG.admissions.fields.map(([label])=>label), values: row => DATA_IMPORT_CONFIG.admissions.fields.map(([,key])=>row[key] ?? '') },
      budget: { headers: ['แผน', 'หน่วยงาน', 'จัดสรร', 'ผูกพัน', 'จ่ายจริง', 'คงเหลือหลังผูกพัน'], values: row => [row.name, row.type, money(row.allocatedSatang), money(row.committedSatang), money(row.paidSatang), money(row.allocatedSatang - row.committedSatang)] },
      assets: { headers: ['รหัสพัสดุ TEST_', 'รายการ', 'ประเภท', 'คงเหลือจาก movement', 'คลัง/หน่วยงาน', 'สถานะ'], values: row => [row.id, row.name, row.type, row.quantity, row.unit, row.status] },
      correspondence: { headers: ['รหัสเอกสาร TEST_', 'เรื่อง TEST_ (ปกปิดตามชั้นข้อมูล)', 'ประเภท TEST_', 'ชั้นข้อมูล TEST_', 'หน่วยงานต้นทาง ID TEST_', 'หน่วยงานปลายทาง ID TEST_', 'สถานะ TEST_'], values: row => [row.id, row.classification === 'TEST_ทั่วไป' ? row.name : 'TEST_เอกสารจำกัดสิทธิ์', row.type, row.classification, row.senderOrganizationId, row.recipientOrganizationId, row.status] }
    }[moduleId];
    if (!exportFields) return;
    const header = exportFields.headers;
    const body = rows.map(row => {
      const cells = exportFields.values(row);
      return cells.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',');
    });
    const blob = new Blob(['\ufeff', header.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','), '\n', body.join('\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TEST_${moduleId}_export.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('ดาวน์โหลด CSV ตัวอย่าง TEST_ แล้ว');
  }

  function exportAssetMovementsCSV() {
    const header=['รหัส movement TEST_','เลขอ้างอิง TEST_','รหัสพัสดุ','ประเภท movement','จำนวนเปลี่ยนแปลง','คลัง/หน่วยงาน','อ้างอิงต้นทาง/คลังคู่','สถานะจำลอง'];
    const rows=state.assetMovements.map(item=>{
      const values=[item.id,item.reference,item.assetId,ASSET_MOVEMENT_LABELS[item.type]||'TEST_ไม่ทราบประเภท',item.quantityDelta,item.location,item.sourceReference||item.counterpartLocation||'',item.status];
      return values.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',');
    });
    const blob=new Blob(['\ufeff',header.map(value=>`"${value}"`).join(','),'\n',rows.join('\n')],{type:'text/csv;charset=utf-8'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);link.download='TEST_assets_stock_card.csv';link.click();
    window.setTimeout(()=>URL.revokeObjectURL(link.href),1000);
    showToast('ส่งออก Stock card TEST_ แล้ว');
  }

  function applySearch(query) {
    const value = query.trim().toLocaleLowerCase('th-TH');
    if (state.page === 'home') {
      document.querySelectorAll('.system-card').forEach(card => { card.hidden = value && !card.textContent.toLocaleLowerCase('th-TH').includes(value); });
      return;
    }
    const searchBox = pageContent.querySelector('.module-search');
    if (searchBox && searchBox.value !== query) searchBox.value = query;
    pageContent.querySelectorAll('tbody tr[data-row]').forEach(row => { row.hidden = value && !row.dataset.row.toLocaleLowerCase('th-TH').includes(value); });
  }

  function downloadTemplate() {
    const link = document.createElement('a');
    link.href = '/assets/TEST_exam_signup_template.xlsx';
    link.download = 'TEST_exam_signup_template.xlsx';
    link.click();
    showToast('ดาวน์โหลดแม่แบบ TEST_ แบบกลาง · ไม่ใช่สำเนาแบบทางการ');
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell.length || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
    return rows.filter(line => line.some(value => String(value).trim() !== ''));
  }

  async function unzipXlsx(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    let end = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
      if (view.getUint32(i, true) === 0x06054b50) { end = i; break; }
    }
    if (end < 0) throw new Error('ไม่พบโครงสร้าง ZIP ของไฟล์ .xlsx');
    const entryCount = view.getUint16(end + 10, true);
    let offset = view.getUint32(end + 16, true);
    const files = new Map();
    const decoder = new TextDecoder('utf-8');
    for (let i = 0; i < entryCount; i += 1) {
      if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('โครงสร้าง XLSX ไม่ถูกต้อง');
      const method = view.getUint16(offset + 10, true);
      const compressedSize = view.getUint32(offset + 20, true);
      const nameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const localOffset = view.getUint32(offset + 42, true);
      const fileName = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(dataStart, dataStart + compressedSize);
      let raw;
      if (method === 0) raw = compressed;
      else if (method === 8 && typeof DecompressionStream !== 'undefined') {
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        raw = new Uint8Array(await new Response(stream).arrayBuffer());
      } else throw new Error('รูปแบบการบีบอัด XLSX นี้ยังไม่รองรับ');
      files.set(fileName, decoder.decode(raw));
      offset += 46 + nameLength + extraLength + commentLength;
    }
    return files;
  }

  function colIndex(cellRef) {
    const letters = String(cellRef).match(/^[A-Z]+/i)?.[0]?.toUpperCase() || 'A';
    let value = 0;
    for (const ch of letters) value = value * 26 + ch.charCodeAt(0) - 64;
    return value - 1;
  }

  async function parseXlsx(file) {
    const files = await unzipXlsx(await file.arrayBuffer());
    const parser = new DOMParser();
    let sheetPath = 'xl/worksheets/sheet1.xml';
    const workbookXml = files.get('xl/workbook.xml');
    const relsXml = files.get('xl/_rels/workbook.xml.rels');
    if (workbookXml && relsXml) {
      const workbookDoc = parser.parseFromString(workbookXml, 'application/xml');
      const relsDoc = parser.parseFromString(relsXml, 'application/xml');
      const relationId = workbookDoc.getElementsByTagName('sheet')[0]?.getAttribute('r:id');
      const relation = [...relsDoc.getElementsByTagName('Relationship')].find(item => item.getAttribute('Id') === relationId);
      const target = relation?.getAttribute('Target');
      if (target) sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
    }
    const sheetXml = files.get(sheetPath);
    if (!sheetXml) throw new Error('ไม่พบ worksheet แรกในไฟล์');
    const sheet = parser.parseFromString(sheetXml, 'application/xml');
    if (sheet.querySelector('parsererror')) throw new Error('อ่าน worksheet ไม่สำเร็จ');
    const sharedDoc = files.has('xl/sharedStrings.xml') ? parser.parseFromString(files.get('xl/sharedStrings.xml'), 'application/xml') : null;
    const shared = sharedDoc ? [...sharedDoc.getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent || '').join('')) : [];
    return [...sheet.getElementsByTagName('row')].map(row => {
      const cells = [];
      for (const cell of row.getElementsByTagName('c')) {
        const idx = colIndex(cell.getAttribute('r'));
        const type = cell.getAttribute('t');
        let value = cell.getElementsByTagName('v')[0]?.textContent ?? '';
        if (type === 's') value = shared[Number(value)] ?? '';
        else if (type === 'inlineStr') value = [...cell.getElementsByTagName('t')].map(t => t.textContent || '').join('');
        cells[idx] = value;
      }
      return cells.map(value => value ?? '');
    });
  }

  const REQUIRED_HEADERS = ['ชื่อผู้สมัคร', 'ประเภทผู้สมัคร', 'ชั้น', 'หน่วยงาน', 'รหัสรอบสอบ'];
  const NORMAL_HEADERS = {
    'student_name': 'ชื่อผู้สมัคร', 'name': 'ชื่อผู้สมัคร', 'ผู้สมัคร': 'ชื่อผู้สมัคร',
    'applicant_type': 'ประเภทผู้สมัคร', 'type': 'ประเภทผู้สมัคร',
    'level': 'ชั้น', 'ระดับชั้น': 'ชั้น',
    'organization': 'หน่วยงาน', 'school': 'หน่วยงาน', 'สำนัก/สถานศึกษา': 'หน่วยงาน',
    'exam_session': 'รหัสรอบสอบ', 'session': 'รหัสรอบสอบ'
  };

  function normalizeHeaders(headers) {
    return headers.map(value => {
      const clean = String(value ?? '').replace(/^\uFEFF/, '').trim();
      return REQUIRED_HEADERS.includes(clean) ? clean : NORMAL_HEADERS[clean.toLowerCase()] || clean;
    });
  }

  function validateRows(rawRows, formKey = state.examFormType) {
    if (!rawRows.length) throw new Error('ไฟล์ไม่มีแถวหัวตาราง');
    const headers = normalizeHeaders(rawRows[0]);
    const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
    if (duplicateHeaders.length) throw new Error('หัวคอลัมน์ซ้ำหลังปรับรูปแบบ · ปฏิเสธไฟล์');
    const unexpectedHeaders = headers.filter(header => !REQUIRED_HEADERS.includes(header));
    if (unexpectedHeaders.length) throw new Error(`พบ ${unexpectedHeaders.length} หัวคอลัมน์นอกแม่แบบกลาง · ปฏิเสธไฟล์`);
    const hasUnmappedValues = rawRows.slice(1).some(values =>
      values.slice(headers.length).some(value => String(value ?? '').trim() !== '')
    );
    if (hasUnmappedValues) throw new Error('พบค่าข้อมูลที่ไม่มีหัวคอลัมน์ · ปฏิเสธไฟล์');
    const missing = REQUIRED_HEADERS.filter(header => !headers.includes(header));
    if (missing.length) throw new Error(`ขาดหัวคอลัมน์: ${missing.join(', ')}`);
    const rows = rawRows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, String(values[index] ?? '').trim()]))).filter(row => Object.values(row).some(Boolean));
    const rowErrors = rows.map(row => {
      const errors = [];
      REQUIRED_HEADERS.forEach(header => { if (!row[header]) errors.push(`ขาด${header}`); });
      REQUIRED_HEADERS.forEach(header => { if (row[header] && !row[header].startsWith('TEST_')) errors.push(`${header}ต้องขึ้นต้น TEST_`); });
      const profile = EXAM_FORM_PROFILES.find(item => item.key === formKey);
      if (profile && row['ชั้น']?.startsWith('TEST_')) {
        const className = row['ชั้น'].slice('TEST_'.length);
        const programMatches = profile.program === 'นักธรรม' ? className.includes('นักธรรม') : className.includes('ธรรมศึกษา');
        const gradeMatches = profile.grade === 'ตรี' ? className.includes('ตรี') : /โท|เอก/.test(className);
        const applicantType = row['ประเภทผู้สมัคร'] || '';
        const applicantMatches = profile.program === 'นักธรรม' ? /บรรพชิต|สามเณร/.test(applicantType) : /คฤหัสถ์|นักเรียน|นักศึกษา/.test(applicantType);
        if (!programMatches || !gradeMatches) errors.push('ชั้นไม่ตรงกับประเภทบัญชีที่เลือก');
        if (applicantType.startsWith('TEST_') && !applicantMatches) errors.push('ประเภทผู้สมัครไม่ตรงกับบัญชีที่เลือก');
      }
      return errors;
    });
    const seen = new Set();
    rows.forEach((row, index) => {
      const key = row['ชื่อผู้สมัคร'];
      if (key && seen.has(key)) rowErrors[index].push('ชื่อซ้ำ');
      if (key) seen.add(key);
    });
    const errors = rowErrors.flat();
    return { rows, rowErrors, errors };
  }

  async function loadImportFile(file) {
    if (!file) return;
    if (!EXAM_FORM_PROFILES.some(item => item.key === state.examFormType)) { showToast('กรุณาเลือกประเภทบัญชีและชั้นสอบก่อนเลือกไฟล์', true); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('ต้นแบบจำกัดขนาดไฟล์ไม่เกิน 5 MB', true); return; }
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'csv'].includes(extension)) { showToast('รองรับเฉพาะไฟล์ .xlsx หรือ .csv', true); return; }
    try {
      const rawRows = extension === 'csv' ? parseCSV(await file.text()) : await parseXlsx(file);
      const checked = validateRows(rawRows, state.examFormType);
      state.import = { fileName: file.name, formKey: state.examFormType, ...checked, committed: false };
      state.pageNumbers['exam-import-preview'] = 1;
      render();
      showToast(`อ่านไฟล์ตัวอย่างแล้ว · ${checked.rows.length} แถว · ${checked.errors.length} ข้อผิดพลาด`, checked.errors.length > 0);
    } catch (error) {
      state.import = null;
      render();
      showToast(error?.message || 'อ่านไฟล์ไม่สำเร็จ', true);
    }
  }

  document.addEventListener('click', event => {
    const pageTarget = event.target.closest('[data-page]');
    if (pageTarget) { navigate(pageTarget.dataset.page); return; }
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;
    const action = actionTarget.dataset.action;
    if (['page-first', 'page-prev', 'page-next', 'page-last'].includes(action)) {
      const key = actionTarget.dataset.pageKey;
      const current = Number(state.pageNumbers[key]) || 1;
      const totalPages = Math.max(1, Math.ceil(rowsForPage(key).length / PAGE_SIZE));
      const next = action === 'page-first' ? 1 : action === 'page-prev' ? current - 1 : action === 'page-next' ? current + 1 : totalPages;
      setPage(key, next);
    } else if (action === 'toggle-menu') {
      document.getElementById('sidebar').classList.toggle('open');
      let overlay = document.querySelector('.mobile-overlay');
      if (!overlay) { overlay = document.createElement('div'); overlay.className = 'mobile-overlay'; document.body.appendChild(overlay); overlay.addEventListener('click', () => { document.getElementById('sidebar').classList.remove('open'); overlay.classList.remove('visible'); }); }
      overlay.classList.toggle('visible');
    } else if (action === 'scroll-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'go-back') {
      goBack();
    } else if (action === 'logout') {
      openModal({ title: 'ยืนยันปิดโหมดทดสอบ?', subtitle: 'TEST_ SESSION', body: '<p>การดำเนินการนี้ล้างเฉพาะข้อมูล TEST_ ชั่วคราวจากหน้านี้ และปิดโหมดทดสอบ บัญชีเว็บไซต์ยังคงเข้าสู่ระบบอยู่</p><div class="modal-hint">หากต้องการออกจากบัญชี ให้กดปุ่มออกจากระบบด้านบน</div>', confirmText: 'ปิดโหมดทดสอบ', cancelText: 'ยกเลิก', onConfirm: () => {
        state.demoLoggedIn = false; state.page = 'home'; state.pageHistory = []; state.import = null; state.dataImport = null; state.drafts = 0; state.budgetDrafts = []; state.budgetPeriod = 'all'; state.budgetTab = 'overview'; state.assetTab='inventory'; state.assetMovements=ASSET_SAMPLE_MOVEMENTS.map(item=>({...item})); state.assetLoans=ASSET_SAMPLE_LOANS.map(item=>({...item})); state.assetMaintenance=ASSET_SAMPLE_MAINTENANCE.map(item=>({...item})); state.assetCounts=ASSET_SAMPLE_COUNTS.map(item=>({...item})); state.assetDisposals=ASSET_SAMPLE_DISPOSALS.map(item=>({...item})); state.assetPurchases=ASSET_SAMPLE_PURCHASES.map(item=>({...item}));
        state.permissionAssignments = INITIAL_PERMISSION_ASSIGNMENTS.map(item=>({...item,permissions:[...item.permissions]}));
        state.permissionDraft = { userId: 'TEST_USER_001', role: 'TEST_ผู้ปฏิบัติงาน', module: 'people', scopeType: 'TEST_จังหวัด', scopeValue: 'TEST_จังหวัดตัวอย่าง', permissions: ['read','edit'] };
        resetCorrespondenceDemo(); render(); showToast('ออกจากโหมดตัวอย่างแล้ว'); return true;
      }});
    } else if (action === 'enter-demo') {
      state.demoLoggedIn = true; state.page = 'home'; state.pageHistory = []; render(); showToast('เข้าสู่โหมดตัวอย่าง TEST_ แล้ว');
    } else if (action === 'save-access') {
      const draft = state.permissionDraft;
      if (!TEST_USERS.some(user=>user.id===draft.userId) || !String(draft.scopeValue).startsWith('TEST_')) { showToast('เลือกผู้ใช้และขอบเขต TEST_ ให้ครบก่อน', true); return; }
      state.permissionAssignments.push({ id:`TEST_ASSIGN_${String(state.permissionAssignments.length+1).padStart(3,'0')}`, actor:'TEST_ADMIN_001', ...draft, permissions:[...draft.permissions] });
      render(); showToast('บันทึกบทบาทและสิทธิ์จำลองและรอบันทึกขึ้น Supabase แล้ว');
    } else if (action === 'open-data-import') {
      state.selectedDataModule = actionTarget.dataset.module || 'people'; state.dataImport = null; navigate('data-tools');
    } else if (action === 'export-xlsx') {
      exportXlsx(actionTarget.dataset.module || state.selectedDataModule);
    } else if (action === 'export-xlsx-template') {
      exportXlsx(actionTarget.dataset.module || state.selectedDataModule, true);
    } else if (action === 'commit-data-import') {
      confirmDataImport();
    } else if (action === 'modal-confirm') {
      const result = state.modalConfirm ? state.modalConfirm(modalRoot.querySelector('.modal-card')) : true;
      if (result !== false) { modalRoot.innerHTML = ''; state.modalConfirm = null; }
    } else if (action === 'budget-tab') {
      if (!BUDGET_STAGES.some(item => item.id === actionTarget.dataset.tab)) return;
      state.budgetTab = actionTarget.dataset.tab;
      state.budgetPeriod = 'all';
      render();
    } else if (action === 'budget-new') {
      budgetDraftForm(actionTarget.dataset.stage || state.budgetTab);
    } else if (action === 'budget-detail') {
      openBudgetDetail(actionTarget.dataset.stage, actionTarget.dataset.rowId);
    } else if (action === 'asset-tab') {
      if(!ASSET_STAGES.some(item=>item.id===actionTarget.dataset.tab)) return;
      state.assetTab=actionTarget.dataset.tab;
      state.pageNumbers.assets=1;
      state.pageNumbers[`asset-events-${state.assetTab}`]=1;
      render();
    } else if (action === 'correspondence-tab') {
      if (!CORRESPONDENCE_TABS.some(item=>item.id===actionTarget.dataset.tab)) return;
      state.correspondenceTab=actionTarget.dataset.tab; state.pageNumbers.correspondence=1; render();
    } else if (action === 'correspondence-mail-merge') {
      correspondenceMailMergeForm();
    } else if (action === 'correspondence-mail-merge-edit') {
      correspondenceMailMergeForm(state.correspondenceMailMergePrefill);
    } else if (action === 'correspondence-detail') {
      openCorrespondenceDetail(actionTarget.dataset.documentId);
    } else if (action === 'correspondence-send') {
      sendCorrespondenceDraft(actionTarget.dataset.documentId);
    } else if (action === 'correspondence-ack') {
      acknowledgeCorrespondence(actionTarget.dataset.documentId);
    } else if (action === 'asset-new') {
      assetDraftForm(actionTarget.dataset.stage||state.assetTab);
    } else if (action === 'asset-detail') {
      assetRecordDetail(actionTarget.dataset.stage,actionTarget.dataset.rowId);
    } else if (action === 'asset-export-movements') {
      exportAssetMovementsCSV();
    } else if (action === 'help') {
      openModal({ title: 'วิธีใช้และติดต่อ', subtitle: 'INFORMATION', body: '<p>ต้นแบบนี้รวบรวมเมนูงาน 9 ระบบเพื่อทดสอบขอบเขตและประสบการณ์ใช้งาน</p><p><b>ช่องทางติดต่อ:</b> TO VERIFY · ให้หน่วยงานเจ้าของโครงการระบุผู้ประสานงานกลาง</p><p>ระบบยังไม่รับข้อมูลจริง เข้าเว็บไซต์ผ่านบัญชี ChatGPT; ยังไม่มีสิทธิ์อนุมัติในระบบงาน และไม่มีการส่งไฟล์ไปยัง server</p>', confirmText: 'รับทราบ' });
    } else if (action === 'notifications') {
      openModal({ title: 'การแจ้งเตือน', body: '<p>ไม่มีการแจ้งเตือนจริงในต้นแบบ</p><p>รายการแจ้งเตือนจะเชื่อมกับ task/outbox หลังยืนยันบทบาท ผู้รับ และ event policy</p>', confirmText: 'ปิด' });
    } else if (action.startsWith('new-')) {
      const moduleId = action.slice(4);
      if (moduleId === 'pali') { showToast('คลังเนื้อหายังรอแหล่งและเจ้าของวิชายืนยัน', true); return; }
      draftForm(moduleId);
    } else if (action === 'view-row') {
      openRow(actionTarget.dataset.module, actionTarget.dataset.rowId);
    } else if (action === 'export-csv') {
      exportCSV(actionTarget.dataset.module);
    } else if (action === 'course-track') {
      if (!COURSE_TRACKS[actionTarget.dataset.track]) return;
      state.courseTrack = actionTarget.dataset.track;
      state.courseLevel = 'ทั้งหมด';
      state.pageNumbers.pali = 1;
      render();
    } else if (action === 'admissions-tab') {
      if (!['applications','results'].includes(actionTarget.dataset.tab)) return;
      state.admissionsTab = actionTarget.dataset.tab;
      render();
    } else if (action === 'search-pali-results') {
      const fields = {
        year: document.getElementById('result-year')?.value.trim() || '',
        track: document.getElementById('result-track')?.value || 'all',
        level: document.getElementById('result-level')?.value || 'all',
        name: document.getElementById('result-name')?.value.trim() || '',
        temple: document.getElementById('result-temple')?.value.trim() || '',
        school: document.getElementById('result-school')?.value.trim() || '',
        number: document.getElementById('result-number')?.value.trim() || ''
      };
      const invalid = Object.entries(fields).some(([key,value]) => !['level','track'].includes(key) && value && !value.startsWith('TEST_'));
      if (invalid) { showToast('โหมดต้นแบบรับเฉพาะคำค้น TEST_ ห้ามใส่ชื่อหรือปีจริง', true); return; }
      state.resultSearch = { ...fields, submitted:true };
      render();
      showToast('ค้นในชุดข้อมูล TEST_ แล้ว · ยังไม่มีชุดผลสอบที่เผยแพร่');
    } else if (action === 'course-tab') {
      state.courseTab = actionTarget.dataset.tab;
      render();
    } else if (action === 'course-outline') {
      const course = COURSES.find(item => item.id === actionTarget.dataset.courseId);
      if (!course) return;
      openModal({ title: `โครงรายวิชา · ${course.subject}`, subtitle: `${course.domain} · ${course.level} · ${course.id}`, body: `<div class="profile-section"><h3>สถานะเนื้อหา</h3><div class="note-row"><div><b>บทเรียนและแหล่งอ้างอิง</b><p>${esc(course.lessons)}</p></div></div><div class="note-row"><div><b>ชุดข้อสอบและเฉลย</b><p>${esc(course.questionBank)}</p></div></div><div class="note-row"><div><b>เกณฑ์ rubric / ผู้ตรวจ</b><p>${esc(course.rubric)}</p></div></div></div><p class="modal-hint">ก่อนเปิดให้เรียน ต้องรับเนื้อหาและ revision จากเจ้าของวิชา พร้อมผู้ตรวจ แหล่งที่มา และสิทธิ์เผยแพร่</p>`, confirmText: 'ปิด' });
    } else if (action === 'assessment-status') {
      const course = COURSES.find(item => item.id === actionTarget.dataset.courseId);
      if (!course) return;
      const mode = actionTarget.dataset.assessmentMode === 'post' ? 'หลังเรียน' : 'ก่อนเรียน';
      openModal({ title: `แบบทดสอบ${mode} · ${course.subject}`, subtitle: `${course.domain} · ${course.level}`, body: `<div class="callout warn"><span>ⓘ</span><div>ยังเริ่มทำแบบทดสอบไม่ได้ เพราะไม่พบชุดข้อสอบ${mode}ที่ผ่านการรับรองสำหรับรายวิชานี้</div></div><p>เมื่อเจ้าของวิชายืนยันชุดข้อสอบ เฉลยหรือ rubric, รุ่นเนื้อหา และการเผยแพร่แล้ว ระบบจึงเปิดแบบทดสอบ${mode}ได้</p><div class="modal-hint">ไม่มีการสร้างข้อสอบ เฉลย คะแนน หรือผลสอบจำลองในหน้านี้ คะแนนฝึกเรียนจะแยกจากผลสอบทางการ</div>`, confirmText: 'รับทราบ' });
    } else if (action === 'request-course-content') {
      openModal({ title: 'ขอเพิ่มชุดเนื้อหา', subtitle: 'TO VERIFY · CONTENT OWNER', body: '<p>ยังไม่มีแหล่งบทเรียน ข้อสอบ เฉลย หรือเกณฑ์ rubric ที่ผ่านการยืนยัน</p><p>ผู้รับผิดชอบแต่ละรายวิชาต้องส่งชุดเนื้อหาพร้อมแหล่งที่มา revision ผู้ตรวจ และเงื่อนไขเผยแพร่ ก่อนนำเข้าคลังหรือเปิดแบบทดสอบ</p><div class="modal-hint">ข้อสอบ เฉลย คะแนนเรียน และผลสอบจริงไม่ได้ถูกสร้างขึ้นในต้นแบบนี้</div>', confirmText: 'รับทราบ' });
    } else if (action === 'choose-file') {
      document.getElementById('excel-file')?.click();
    } else if (action === 'download-template') {
      downloadTemplate();
    } else if (action === 'commit-import') {
      if (!state.import || state.import.formKey !== state.examFormType) { showToast('เลือกประเภทบัญชีให้ตรงกับไฟล์ก่อนนำเข้า', true); return; }
      if (state.import.errors.length || !state.import.rows.length) { showToast('ต้องผ่าน validation ทุกแถวก่อน', true); return; }
      const profile = EXAM_FORM_PROFILES.find(item => item.key === state.import.formKey);
      openModal({ title: 'ยืนยันนำเข้า TEST_?', subtitle: `ตรวจสอบก่อนบันทึกใน session · ${profile?.label || 'TO VERIFY'}`, body: `<p>กำลังนำเข้ารายชื่อจำลอง ${state.import.rows.length} แถวตามประเภทบัญชี <b>${esc(profile?.label || 'TO VERIFY')}</b> โดยบันทึกในพื้นที่ TEST_ ของบัญชีหลังยืนยัน</p><div class="overwrite-warning">ข้อมูลนี้เป็นแบบจำลอง TEST_ และยังไม่ตรวจการเขียนทับกับทะเบียนกลาง แบบฟอร์มและคอลัมน์ที่เลือกยังต้องเทียบกับฉบับทางการ ให้ยกเลิกหากยังไม่ได้ตรวจไฟล์</div>`, confirmText: 'ยืนยันนำเข้า', cancelText: 'ยกเลิก', onConfirm: () => { state.import.committed = true; render(); showToast(`นำเข้า TEST_ ${state.import.rows.length} แถวและรอบันทึกขึ้น Supabase แล้ว`); return true; } });
    } else if (action === 'close-modal') {
      modalRoot.innerHTML = '';
      state.modalConfirm = null;
    } else if (action === 'modal-backdrop' && event.target === actionTarget) {
      modalRoot.innerHTML = '';
      state.modalConfirm = null;
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'global-search') applySearch(event.target.value);
    else if (event.target.id === 'draft-name') { state.draftPersonName = event.target.value; updateEducationPositionWarning(); }
    else if (event.target.classList.contains('module-search')) {
      const query = event.target.value;
      const cursor = event.target.selectionStart ?? query.length;
      state.listSearch[state.page] = query;
      state.pageNumbers[state.page] = 1;
      render();
      const searchInput = pageContent.querySelector('.module-search');
      if (searchInput) { searchInput.focus(); searchInput.setSelectionRange?.(cursor, cursor); }
    }
    else if (event.target.id === 'access-scope-value') state.permissionDraft.scopeValue = event.target.value.trim();
  });

  document.addEventListener('change', event => {
    if (event.target.dataset?.pageInput) setPage(event.target.dataset.pageInput, event.target.value);
    else if (event.target.dataset?.educationPosition) {
      const roles = new Set(state.draftEducationPositions);
      if (event.target.checked) roles.add(event.target.dataset.educationPosition); else roles.delete(event.target.dataset.educationPosition);
      state.draftEducationPositions = [...roles];
      updateEducationPositionWarning();
    }
    else if (event.target.id === 'level-filter') { state.courseLevel = event.target.value; state.pageNumbers.pali = 1; render(); }
    else if (event.target.id === 'people-status-filter') { state.peopleStatus = event.target.value; state.pageNumbers.people = 1; render(); }
    else if (event.target.id === 'admissions-scope-filter') { state.admissionsScope = event.target.value; state.pageNumbers.admissions = 1; render(); }
    else if (event.target.id === 'exam-form-type') { state.examFormType = event.target.value; state.import = null; state.pageNumbers['exam-import-preview'] = 1; render(); }
    else if (event.target.id === 'organization-type-filter') { state.organizationType = event.target.value; state.pageNumbers.organizations = 1; render(); }
    else if (event.target.id === 'organization-province-filter') { state.organizationProvince = event.target.value; state.pageNumbers.organizations = 1; render(); }
    else if (event.target.id === 'requests-category-filter') { state.requestsCategory = event.target.value; state.pageNumbers.requests = 1; render(); }
    else if (event.target.id === 'requests-type-filter') { state.requestsType = event.target.value; state.pageNumbers.requests = 1; render(); }
    else if (event.target.id === 'requests-province-filter') { state.requestsProvince = event.target.value; state.pageNumbers.requests = 1; render(); }
    else if (event.target.id === 'requests-status-filter') { state.requestsStatus = event.target.value; state.pageNumbers.requests = 1; render(); }
    else if (event.target.id === 'budget-period-filter') { state.budgetPeriod = event.target.value; render(); }
    else if (event.target.id === 'data-module-select') { state.selectedDataModule = event.target.value; state.dataImport = null; state.pageNumbers['data-import-preview'] = 1; render(); }
    else if (event.target.id === 'data-excel-file') loadDataImportFile(event.target.files?.[0]);
    else if (event.target.id === 'access-user') state.permissionDraft.userId = event.target.value;
    else if (event.target.id === 'access-role') state.permissionDraft.role = event.target.value;
    else if (event.target.id === 'access-module') state.permissionDraft.module = event.target.value;
    else if (event.target.id === 'access-scope') state.permissionDraft.scopeType = event.target.value;
    else if (event.target.id === 'access-scope-value') state.permissionDraft.scopeValue = event.target.value.trim();
    else if (event.target.dataset?.accessPermission) {
      const permission = event.target.dataset.accessPermission;
      const permissions = new Set(state.permissionDraft.permissions);
      if (event.target.checked) permissions.add(permission); else permissions.delete(permission);
      state.permissionDraft.permissions = [...permissions];
    }
    else if (event.target.id === 'excel-file') loadImportFile(event.target.files?.[0]);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalRoot.innerHTML) modalRoot.innerHTML = '';
    if (event.key === 'Enter' && event.target.dataset?.pageInput) { event.preventDefault(); setPage(event.target.dataset.pageInput, event.target.value); }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.system-card[role="button"]')) navigate(event.target.dataset.page);
  });

  document.addEventListener('dragover', event => { if (event.target.closest('#drop-zone')) { event.preventDefault(); document.getElementById('drop-zone')?.classList.add('dragging'); } });
  document.addEventListener('dragleave', event => { if (event.target.closest('#drop-zone')) document.getElementById('drop-zone')?.classList.remove('dragging'); });
  document.addEventListener('drop', event => {
    if (!event.target.closest('#drop-zone')) return;
    event.preventDefault();
    document.getElementById('drop-zone')?.classList.remove('dragging');
    loadImportFile(event.dataTransfer?.files?.[0]);
  });

  const PERSISTED_KEYS = ['budgetDrafts','assetMovements','assetLoans','assetMaintenance','assetCounts','assetDisposals','assetPurchases','permissionAssignments','correspondenceAudit','drafts'];
  function portalSnapshot() {
    return JSON.parse(JSON.stringify({ schemaVersion: 1,
      moduleRows: Object.fromEntries(Object.entries(MODULES).map(([key, value]) => [key, value.rows])),
      state: Object.fromEntries(PERSISTED_KEYS.map(key => [key, state[key]])),
      examImport: state.import?.committed ? state.import : null,
      budgetSampleEvents: BUDGET_SAMPLE_EVENTS,
      catalogs: { courses: COURSES, examForms: EXAM_FORM_PROFILES, testUsers: TEST_USERS, testRoles: TEST_ROLES, permissions: PERMISSIONS, assetLocations: ASSET_LOCATIONS }
    }));
  }
  function portalHydrate(snapshot) {
    if (snapshot?.schemaVersion !== 1 || !snapshot.moduleRows || !snapshot.state) throw new Error('Unsupported workspace version');
    for (const key of Object.keys(MODULES)) {
      const rows = snapshot.moduleRows[key];
      if (!Array.isArray(rows) || rows.some(row => !row || !String(row.id).startsWith('TEST_'))) throw new Error('Invalid TEST_ records');
    }
    for (const key of PERSISTED_KEYS) {
      if (key === 'drafts' ? !Number.isSafeInteger(snapshot.state[key]) || snapshot.state[key] < 0 : !Array.isArray(snapshot.state[key])) throw new Error('Invalid workspace collection');
    }
    const data = JSON.parse(JSON.stringify(snapshot));
    for (const key of Object.keys(MODULES)) MODULES[key].rows = data.moduleRows[key];
    for (const key of PERSISTED_KEYS) state[key] = data.state[key];
    state.import = data.examImport?.committed ? data.examImport : null;
    render();
  }
  window.portalApp = { snapshot: portalSnapshot, hydrate: portalHydrate };
  render();
})();

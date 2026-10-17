export const modules = [
  {id:'people',number:'01',name:'ทะเบียนบุคคล',detail:'บุคลากรคณะสงฆ์และฝ่ายการศึกษา'},
  {id:'organizations',number:'02',name:'หน่วยงานและสนามสอบ',detail:'สำนักเรียน วัด องค์กร และสนามสอบ'},
  {id:'learning',number:'03',name:'การเรียนรู้และคลังข้อสอบ',detail:'รายวิชานักธรรม ธรรมศึกษา และบาลี'},
  {id:'requests',number:'04',name:'คำขอและสถานะ',detail:'ติดตามคำขอของหน่วยงานและสนามสอบ'},
  {id:'admissions',number:'05',name:'ทะเบียนสมัครและผลสอบ',detail:'ข้อมูลการสมัครและผลสอบบาลี'},
  {id:'budget',number:'06',name:'งบประมาณ',detail:'แผนงานและรายการงบประมาณ'},
  {id:'assets',number:'07',name:'พัสดุและครุภัณฑ์',detail:'ทะเบียนทรัพย์สินและรายการเคลื่อนไหว'},
  {id:'correspondence',number:'08',name:'สารบรรณออนไลน์',detail:'หนังสือรับ ส่ง และจดหมายเวียน'},
  {id:'exam-import',number:'09',name:'สมัครนักธรรมและธรรมศึกษา',detail:'แบบบัญชีและการตรวจไฟล์นำเข้า'},
] as const;
export type ModuleId = typeof modules[number]['id'];
export function findModule(id:string){return modules.find(module=>module.id===id);}

import { describe, expect, it } from 'vitest';
import { fiscalYearBE, formatThaiBuddhistDate } from './thai-date.js';
const zone='Asia/Bangkok'; // TEST_ fixture only; production must load this value from settings.
describe('วันที่และปีงบประมาณ',()=>{
  it('ก่อนเที่ยงคืน 30 ก.ย. ยังอยู่ปีงบเดิม',()=>expect(fiscalYearBE('2026-09-30T16:59:59Z',zone)).toBe(2569));
  it('เที่ยงคืน 1 ต.ค. เปลี่ยนปีงบใหม่ตามเขตเวลา',()=>expect(fiscalYearBE('2026-09-30T17:00:00Z',zone)).toBe(2570));
  it('31 ธ.ค. และ 1 ม.ค. อยู่ปีงบเดียวกัน',()=>{
    expect(fiscalYearBE('2026-12-31T12:00:00Z',zone)).toBe(2570);expect(fiscalYearBE('2027-01-01T12:00:00Z',zone)).toBe(2570);
  });
  it('แสดงวันที่ไทย พ.ศ.',()=>expect(formatThaiBuddhistDate('2026-10-17T00:00:00Z',zone)).toBe('17 ตุลาคม 2569'));
  it('ปฏิเสธวันที่ไม่ถูกต้อง',()=>expect(()=>fiscalYearBE('TEST_INVALID_DATE',zone)).toThrow('วันที่ไม่ถูกต้อง'));
});

import snapshot from '../../../../supabase/seed_snapshot.json';
import {selectDemoRecords} from './records';
import type {ModuleId} from './modules';

// Build-time fixture projection only. No database client, credentials or calls.
export function recordsForModule(id:ModuleId){
  if(id==='learning')return selectDemoRecords(snapshot.catalogs.courses);
  if(id==='exam-import')return selectDemoRecords(snapshot.catalogs.examForms);
  return selectDemoRecords(snapshot.moduleRows[id]);
}

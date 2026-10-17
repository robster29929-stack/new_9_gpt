'use client';
import {useEffect,useState} from 'react';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts';
export function SummaryChart({data}:{data:{label:string;count:number}[]}){
  const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
  if(!mounted)return <p className="h-80" role="status">กำลังเตรียมกราฟ</p>;
  return <div className="h-80 min-w-0" role="img" aria-label="กราฟจำนวนข้อมูลสาธิตแต่ละระบบ ดูจำนวนทั้งหมดในตารางด้านล่าง"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{top:20,right:8,left:0,bottom:15}}><XAxis dataKey="label" tick={{fontSize:14}}/><YAxis allowDecimals={false} width={35} tick={{fontSize:14}}/><Tooltip formatter={value=>[value,'รายการสาธิต']} labelFormatter={value=>'ระบบ '+String(value)}/><Bar dataKey="count" name="รายการสาธิต" fill="#285e48" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>;
}

import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import './globals.css';

export const metadata:Metadata={title:{default:'พื้นที่ทำงาน · 9 ระบบ',template:'%s · พื้นที่ทำงาน'},description:'พื้นที่ตรวจการย้ายระบบ ข้อมูลสาธิต TEST_ เท่านั้น',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:ReactNode}){
  return <html lang="th"><body><a className="skip-link" href="#main-content">ข้ามไปเนื้อหาหลัก</a>{children}</body></html>;
}

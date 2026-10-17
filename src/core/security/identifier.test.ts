import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { decryptIdentifier, encryptIdentifier, maskIdentifier, presentIdentifier } from './identifier.js';
const plaintext='TEST_IDENTIFIER_001'; // Synthetic string, never an actual national identifier.
describe('ข้อมูลระบุตัวบุคคล',()=>{
  it('ciphertext ไม่มี plaintext และถอดด้วยกุญแจเดิมได้',()=>{
    const key=randomBytes(32),cipher=encryptIdentifier(plaintext,key);
    expect(cipher).not.toContain(plaintext);expect(decryptIdentifier(cipher,key)).toBe(plaintext);
  });
  it('nonce ทำให้ข้อความเดิมได้ ciphertext ต่างกัน',()=>{
    const key=randomBytes(32);expect(encryptIdentifier(plaintext,key)).not.toBe(encryptIdentifier(plaintext,key));
  });
  it('wrong key และข้อมูลถูกแก้ต้องถอดไม่ได้',()=>{
    const key=randomBytes(32),cipher=encryptIdentifier(plaintext,key);
    expect(()=>decryptIdentifier(cipher,randomBytes(32))).toThrow();
    const parts=cipher.split('.');const tag=Buffer.from(parts[2]!, 'base64url');tag[0]=tag[0]! ^ 1;parts[2]=tag.toString('base64url');
    expect(()=>decryptIdentifier(parts.join('.'),key)).toThrow();
  });
  it('ไม่มีสิทธิ์อ่านต้องไม่คืนแม้ข้อมูล masked',()=>{
    const key=randomBytes(32),cipher=encryptIdentifier(plaintext,key);
    expect(()=>presentIdentifier(cipher,key,{canRead:false,canReveal:false})).toThrow('ไม่มีสิทธิ์');
  });
  it('มีสิทธิ์อ่านปกติจะ masked; reveal ต้องมีสิทธิ์แยก',()=>{
    const key=randomBytes(32),cipher=encryptIdentifier(plaintext,key);
    expect(presentIdentifier(cipher,key,{canRead:true,canReveal:false})).toBe(maskIdentifier(plaintext));
    expect(presentIdentifier(cipher,key,{canRead:true,canReveal:true})).toBe(plaintext);
  });
});

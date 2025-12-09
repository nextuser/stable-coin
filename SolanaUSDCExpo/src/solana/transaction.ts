// 修改导入语句
import { gcm, gcmsiv } from '@noble/ciphers/aes.js';// 替换原导入语句
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { CONFIG, SOLANA_CONST } from '../config';
import { Buffer } from 'buffer';
import * as nacl from 'tweetnacl';

// 修改 encryptTxPrivateKey 函数
export const encryptTxPrivateKey = (privateKey: string, password: string) => {
  const salt = nacl.randomBytes(CONFIG.ENCRYPTION.SALT_LEN);
  const iv = nacl.randomBytes(CONFIG.ENCRYPTION.IV_LEN);
  
  const aesKey = pbkdf2(sha256, password, salt, {
    c: CONFIG.ENCRYPTION.PBKDF2_ITERATIONS,
    dkLen: CONFIG.ENCRYPTION.PBKDF2_KEY_LEN,
  });

  const cipher = gcm(aesKey, iv);
  // 加密结果包含密文和认证标签
  const encryptedWithTag = cipher.encrypt(Buffer.from(privateKey, 'hex'));
  // 认证标签通常附加在密文末尾
  const tag = encryptedWithTag.subarray(encryptedWithTag.length - 16); // GCM标签长度为16字节
  const encrypted = encryptedWithTag.subarray(0, encryptedWithTag.length - 16);

  return {
    salt: Buffer.from(salt).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    tag: Buffer.from(tag).toString('base64'),
    encryptedKey: Buffer.from(encrypted).toString('base64'),
  };
};

// 修改 decryptTxPrivateKey 函数
export const decryptTxPrivateKey = (encryptedData: {
  salt: string;
  iv: string;
  tag: string;
  encryptedKey: string;
}, password: string) => {
  const salt = Buffer.from(encryptedData.salt, 'base64');
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const tag = Buffer.from(encryptedData.tag, 'base64');
  const encryptedKey = Buffer.from(encryptedData.encryptedKey, 'base64');

  const aesKey = pbkdf2(sha256, password, salt, {
    c: CONFIG.ENCRYPTION.PBKDF2_ITERATIONS,
    dkLen: CONFIG.ENCRYPTION.PBKDF2_KEY_LEN,
  });

  // 将密文和标签合并
  const encryptedWithTag = new Uint8Array(encryptedKey.length + tag.length);
  encryptedWithTag.set(encryptedKey);
  encryptedWithTag.set(tag, encryptedKey.length);

  const cipher = gcm(aesKey, iv);
  // 直接解密包含标签的数据
  const decrypted = cipher.decrypt(encryptedWithTag);

  return Buffer.from(decrypted).toString('hex');
};
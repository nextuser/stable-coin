import * as SecureStore from 'expo-secure-store';
import * as nacl from 'tweetnacl';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { aesgcm } from '@noble/ciphers/aes-gcm';
import { CONFIG } from '../config';

/**
 * 生成Solana钱包（密钥对）
 */
export const generateSolanaWallet = () => {
  const keyPair = nacl.sign.keyPair();
  return {
    privateKey: Buffer.from(keyPair.secretKey).toString('hex'),
    publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
  };
};

/**
 * 加密并存储私钥（Expo SecureStore）
 */
export const savePrivateKey = async (password: string, privateKey: string) => {
  try {
    // 生成盐值
    const salt = nacl.randomBytes(CONFIG.ENCRYPTION.SALT_LEN);
    // 派生AES密钥
    const aesKey = pbkdf2(sha256, password, salt, {
      c: CONFIG.ENCRYPTION.PBKDF2_ITERATIONS,
      dkLen: CONFIG.ENCRYPTION.PBKDF2_KEY_LEN,
    });
    // 生成IV
    const iv = nacl.randomBytes(CONFIG.ENCRYPTION.IV_LEN);
    // 加密私钥
    const cipher = aesgcm(aesKey, iv);
    const encrypted = cipher.encrypt(Buffer.from(privateKey, 'hex'));
    const tag = cipher.getAuthTag();

    // 存储加密后的数据（盐+IV+标签+密文）
    await SecureStore.setItemAsync('solana_wallet', JSON.stringify({
      salt: Buffer.from(salt).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      tag: Buffer.from(tag).toString('base64'),
      encrypted: Buffer.from(encrypted).toString('base64'),
      publicKey: Buffer.from(nacl.sign.keyPair.fromSecretKey(Buffer.from(privateKey, 'hex')).publicKey).toString('hex'),
    }));
    return true;
  } catch (error) {
    console.error('存储私钥失败:', error);
    throw new Error('钱包创建失败');
  }
};

/**
 * 解密获取私钥
 */
export const getPrivateKey = async (password: string) => {
  try {
    const stored = await SecureStore.getItemAsync('solana_wallet');
    if (!stored) throw new Error('钱包未初始化');
    const { salt, iv, tag, encrypted } = JSON.parse(stored);

    // 派生AES密钥
    const aesKey = pbkdf2(sha256, password, Buffer.from(salt, 'base64'), {
      c: CONFIG.ENCRYPTION.PBKDF2_ITERATIONS,
      dkLen: CONFIG.ENCRYPTION.PBKDF2_KEY_LEN,
    });
    // 解密
    const cipher = aesgcm(aesKey, Buffer.from(iv, 'base64'));
    cipher.setAuthTag(Buffer.from(tag, 'base64'));
    const decrypted = cipher.decrypt(Buffer.from(encrypted, 'base64'));
    
    return Buffer.from(decrypted).toString('hex');
  } catch (error) {
    console.error('解密私钥失败:', error);
    throw new Error('密码错误或钱包损坏');
  }
};

/**
 * 获取钱包公钥（无需解密）
 */
export const getPublicKey = async () => {
  try {
    const stored = await SecureStore.getItemAsync('solana_wallet');
    if (!stored) return null;
    const { publicKey } = JSON.parse(stored);
    return publicKey;
  } catch (error) {
    return null;
  }
};

/**
 * 初始化钱包（生成+存储）
 */
export const initWallet = async (password: string) => {
  const { privateKey, publicKey } = generateSolanaWallet();
  await savePrivateKey(password, privateKey);
  return publicKey;
};


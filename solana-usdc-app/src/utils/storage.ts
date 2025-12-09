import * as SecureStore from 'expo-secure-store';

/**
 * 安全存储加密后的私钥
 * @param key 存储键
 * @param value 存储值
 */
export const secureStoreSet = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value);
};

/**
 * 获取安全存储的值
 * @param key 存储键
 * @returns 存储值（null 表示无）
 */
export const secureStoreGet = async (key: string) => {
  return await SecureStore.getItemAsync(key);
};

/**
 * 删除安全存储的值
 * @param key 存储键
 */
export const secureStoreDelete = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};

// 私钥存储键
export const ENCRYPTED_PRIVATE_KEY_KEY = 'solana_encrypted_private_key';
// JWT 令牌存储键
export const JWT_TOKEN_KEY = 'jwt_token';

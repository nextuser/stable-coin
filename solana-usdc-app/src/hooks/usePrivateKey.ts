import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { encryptPrivateKey } from '../utils/crypto';
import { getWalletAddress } from '../utils/solana';

import { secureStoreGet, secureStoreSet, secureStoreDelete, ENCRYPTED_PRIVATE_KEY_KEY } from '../utils/storage';

export const usePrivateKey = () => {
  const [encryptedKey, setEncryptedKey] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [decryptLoading, setDecryptLoading] = useState(false);

  // 初始化：从安全存储读取加密私钥
  useEffect(() => {
    const loadEncryptedKey = async () => {
      const key = await secureStoreGet(ENCRYPTED_PRIVATE_KEY_KEY);
      setEncryptedKey(key);
    };
    loadEncryptedKey();
  }, []);

  // 导入并加密私钥
  const importPrivateKey = useCallback(async (privateKey: string, password: string) => {
    try {
      const encrypted = encryptPrivateKey(privateKey, password);
      await secureStoreSet(ENCRYPTED_PRIVATE_KEY_KEY, encrypted);
      setEncryptedKey(encrypted);
      // 获取钱包地址
      const address = getWalletAddress(encrypted, password);
      setWalletAddress(address);
      Alert.alert('成功', '私钥导入并加密成功');
      return true;
    } catch (err) {
      Alert.alert('失败', (err as Error).message);
      return false;
    }
  }, []);

  // 解密私钥并获取钱包地址
  const decryptAndGetAddress = useCallback(async (password: string) => {
    if (!encryptedKey) {
      Alert.alert('提示', '未导入私钥');
      return null;
    }
    setDecryptLoading(true);
    try {
      const address = getWalletAddress(encryptedKey, password);
      setWalletAddress(address);
      Alert.alert('成功', '密码验证成功');
      return address;
    } catch (err) {
      Alert.alert('失败', (err as Error).message);
      return null;
    } finally {
      setDecryptLoading(false);
    }
  }, [encryptedKey]);

  // 注销私钥（清除安全存储）
  const logoutPrivateKey = useCallback(async () => {
    await secureStoreDelete(ENCRYPTED_PRIVATE_KEY_KEY);
    setEncryptedKey(null);
    setWalletAddress(null);
    Alert.alert('成功', '私钥已注销');
  }, []);

  return {
    encryptedKey,
    walletAddress,
    decryptLoading,
    importPrivateKey,
    decryptAndGetAddress,
    logoutPrivateKey
  };
};

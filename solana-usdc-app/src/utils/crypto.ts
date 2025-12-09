import CryptoJS from 'crypto-js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

// RN 需手动引入随机数
import 'react-native-get-random-values';

/**
 * AES-256-CBC 加密 Solana 私钥
 * @param privateKey Base58 格式私钥
 * @param password 用户密码
 * @returns 加密后的字符串（salt + iv + ciphertext）
 */
// export const encryptPrivateKey = (privateKey: string, password: string): string => {
//   // 验证私钥合法性
//   try {
//     Keypair.fromSecretKey(bs58.decode(privateKey));
//   } catch (err) {
//     throw new Error('无效的 Solana 私钥');
//   }

//   // 生成随机盐值和 IV（RN 环境兼容）
//   const salt = CryptoJS.lib.WordArray.random(16);
//   const iv = CryptoJS.lib.WordArray.random(16);

//   // 基于密码+盐值生成 AES 密钥（256位）
//   const key = CryptoJS.PBKDF2(password, salt, {
//     keySize: 8, // 8*32=256位
//     iterations: 100000,
//     hasher: CryptoJS.algo.SHA256
//   });

//   // 加密私钥
//   const encrypted = CryptoJS.AES.encrypt(privateKey, key, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7
//   });

//   // 拼接盐值、IV、密文
//   const encryptedData = {
//     salt: salt.toString(CryptoJS.enc.Hex),
//     iv: iv.toString(CryptoJS.enc.Hex),
//     ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Hex)
//   };

//   return JSON.stringify(encryptedData);
// };

export function encryptPrivateKey(privateKey :string,password:string):string{
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    return encryptKeyPair(keypair,password);

}
/**
 * AES加密Solana私钥（AES-256-CBC）
 * @param privateKey Base58格式的Solana私钥
 * @param password 用户设置的解密密码
 * @returns 加密后的私钥字符串（含iv+密文）
 */
export const encryptKeyPair = (keypair: Keypair, password: string): string => {
  // 1. 验证私钥合法性
  // try {
  //   Keypair.fromSecretKey(bs58.decode(privateKey));
  // } catch (err) {
  //   throw new Error('无效的Solana私钥');
  // }

  const privateKey = bs58.encode(keypair.secretKey);

  // 2. 生成AES密钥（基于密码+盐值）
  const salt = CryptoJS.lib.WordArray.random(16); // 随机盐值
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 8, // 256位密钥
    iterations: 100000, // 迭代次数，提升破解难度
  });

  // 3. 生成随机IV（初始化向量）
  const iv = CryptoJS.lib.WordArray.random(16);

  // 4. AES-256-CBC加密私钥
  const encrypted = CryptoJS.AES.encrypt(privateKey, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // 5. 拼接盐值+IV+密文（用于解密）
  const encryptedData = {
    salt: salt.toString(CryptoJS.enc.Hex),
    iv: iv.toString(CryptoJS.enc.Hex),
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
  };

  return JSON.stringify(encryptedData);
};

/**
 * AES-256-CBC 解密私钥
 * @param encryptedKey 加密后的私钥字符串
 * @param password 用户密码
 * @returns Base58 格式私钥
 */
// export const decryptPrivateKey = (encryptedKey: string, password: string): string => {
//   try {
//     const { salt, iv, ciphertext } = JSON.parse(encryptedKey);
//     const saltHex = CryptoJS.enc.Hex.parse(salt);
//     const ivHex = CryptoJS.enc.Hex.parse(iv);
//     const ciphertextHex = CryptoJS.enc.Hex.parse(ciphertext);

//     // 还原 AES 密钥
//     const key = CryptoJS.PBKDF2(password, saltHex, {
//       keySize: 8,
//       iterations: 100000,
//       hasher: CryptoJS.algo.SHA256
//     });

//     // 解密
//     const decrypted = CryptoJS.AES.decrypt(
//       { ciphertext: ciphertextHex },
//       key,
//       { iv: ivHex, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
//     );

//     const privateKey = decrypted.toString(CryptoJS.enc.Utf8);
//     // 验证解密结果
//     Keypair.fromSecretKey(bs58.decode(privateKey));
//     return privateKey;
//   } catch (err) {
//     throw new Error('密码错误或私钥已损坏');
//   }
// };

/**
 * 使用CryptoJS解密Solana私钥（AES-256-CBC）
 * @param encryptedData 加密的私钥数据（JSON字符串格式）
 * @param password 用户设置的解密密码
 * @returns 解密后的Base58格式私钥
 */
export const decryptKeyPair = (encryptedData: string, password: string): Keypair => {
  try {
    // 1. 解析加密数据
    const encryptedObj = JSON.parse(encryptedData);
    const salt = CryptoJS.enc.Hex.parse(encryptedObj.salt);
    const iv = CryptoJS.enc.Hex.parse(encryptedObj.iv);
    const ciphertext = CryptoJS.enc.Hex.parse(encryptedObj.ciphertext);

    // 2. 重新生成AES密钥
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 8, // 256位密钥
      iterations: 100000,
    });

    // 3. 解密数据
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext } as any,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // 4. 转换为原始私钥字符串
    const privateKey = decrypted.toString(CryptoJS.enc.Utf8);
    
    // 5. 验证解密结果
    if (!privateKey) {
      throw new Error('解密失败，密码可能不正确');
    }

    return Keypair.fromSecretKey(bs58.decode(privateKey));

    // // 6. 验证私钥合法性
    // try {
    //   Keypair.fromSecretKey(bs58.decode(privateKey));
    // } catch (err) {
    //   throw new Error('解密后的私钥无效');
    // }

    // return privateKey;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('加密数据格式错误');
    }
    throw error;
  }
};

/**
 * 销毁内存中的私钥（安全加固）
 * @param keypair Solana Keypair
 */
export const destroyPrivateKey = (keypair: Keypair): void => {
  if (keypair.secretKey) {
    keypair.secretKey.fill(0); // 清空私钥内存
  }
};

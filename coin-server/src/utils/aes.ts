import CryptoJS from 'crypto-js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import {config} from 'dotenv';

config();

/**
 * AES加密Solana私钥（AES-256-CBC）
 * @param privateKey Base58格式的Solana私钥
 * @param password 用户设置的解密密码
 * @returns 加密后的私钥字符串（含iv+密文）
 */
const encryptPrivateKey = (keypair: Keypair, password: string): string => {
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

// 存储加密后的私钥到本地
const saveEncryptedPrivateKey = (encryptedKey: string) => {
  localStorage.setItem('solana_encrypted_private_key', encryptedKey);
  // 移动端可存储到本地文件，Web端优先LocalStorage
};

// // 调用示例：用户导入私钥并加密存储
// export function loadPrivateKey(privateKey: string, password: string): Keypair {
//   const encryptedKey = encryptPrivateKey(privateKey, password);
//   saveEncryptedPrivateKey(encryptedKey);
//   // 同步钱包地址到Server（仅地址，无钥）
//   const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
//   return keypair
//   //await syncWalletAddressToServer(keypair.publicKey.toBase58());
// };

/**
 * 使用CryptoJS解密Solana私钥（AES-256-CBC）
 * @param encryptedData 加密的私钥数据（JSON字符串格式）
 * @param password 用户设置的解密密码
 * @returns 解密后的Base58格式私钥
 */
const decryptPrivateKey = (encryptedData: string, password: string): Keypair => {
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

export function saveKeypair(keypair: Keypair, password: string) {
  const encryptedKey = encryptPrivateKey(privateKey, password);
  saveEncryptedPrivateKey(encryptedKey);
};

/**
 * 从本地存储获取并解密私钥
 * @param password 用户密码
 * @returns 解密后的Keypair对象
 */
export function loadKeypair(password: string): Keypair {
  const encryptedKey = localStorage.getItem('solana_encrypted_private_key');
  
  if (!encryptedKey) {
    throw new Error('未找到存储的加密私钥');
  }

  const privateKey = decryptPrivateKey(encryptedKey, password);
  return privateKey;
};



function test(){
  const privateKey = process.env.FEE_PAYER_PRIVATE_KEY ||'';
  const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  const encoded = encryptPrivateKey(keypair, '12345678');

  console.log("encode pubkey:",encoded);

  const decodedKeyPair = decryptPrivateKey(encoded, '12345678');
  console.log("decode pubkey:",decodedKeyPair.publicKey.toBase58()  ,bs58.encode(decodedKeyPair.secretKey) )
}

function test_save_load(){ 
    const privateKey = process.env.FEE_PAYER_PRIVATE_KEY ||'';
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    console.log("before save: pubkey",keypair.publicKey.toBase58()  ,bs58.encode(keypair.secretKey) );
    const password = '12345678';
    saveEncryptedPrivateKey(encryptPrivateKey(keypair,password));

    const keypair_out = loadKeypair(password);
    console.log("decode pubkey:",keypair_out.publicKey.toBase58()  ,bs58.encode(keypair_out.secretKey) )
}

//todo 
//test();


import { Transaction, PublicKey, Connection, Keypair } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import bs58 from 'bs58';
import { decryptKeyPair, destroyPrivateKey } from './crypto';
import { FeeRule } from '../types';

// RN 需手动引入 buffer 兼容
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// 初始化 Solana 连接
const SOLANA_RPC_URL = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const USDC_MINT_ADDRESS = process.env.EXPO_PUBLIC_USDC_MINT_ADDRESS || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const PLATFORM_FEE_ACCOUNT = process.env.EXPO_PUBLIC_PLATFORM_FEE_ACCOUNT || '';

const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');

/**
 * 获取用户钱包地址（从加密私钥解密）
 * @param encryptedKey 加密后的私钥
 * @param password 密码
 * @returns 钱包地址（Base58）
 */
export const getWalletAddress = (encryptedKey: string, password: string): string => {
  const keypair = decryptKeyPair(encryptedKey, password);
  const address = keypair.publicKey.toBase58();
  // 销毁内存中的私钥
  destroyPrivateKey(keypair);
  return address;
};

/**
 * 构建含手续费的未签名交易
 * @param fromAddress 用户钱包地址
 * @param toAddress 收款地址
 * @param amount 转账本金（USDC）
 * @param feeRule 手续费规则
 * @returns 未签名交易 + 手续费金额
 */
export const createUnsignedTxWithFee = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  feeRule: FeeRule
): Promise<{ transaction: Transaction; platformFee: number }> => {
  // 计算手续费
  let platformFee = 0;
  if (feeRule.type === 'fixed') {
    platformFee = feeRule.value;
  } else {
    platformFee = amount * feeRule.value;
    platformFee = feeRule.min ? Math.max(platformFee, feeRule.min) : platformFee;
  }

  // 核心地址
  const fromPubkey = new PublicKey(fromAddress);
  const toPubkey = new PublicKey(toAddress);
  const platformFeePubkey = new PublicKey(PLATFORM_FEE_ACCOUNT);
  const usdcMint = new PublicKey(USDC_MINT_ADDRESS);

  // 获取 ATA（关联代币账户）
  const fromAta = await getAssociatedTokenAddress(usdcMint, fromPubkey);
  const toAta = await getAssociatedTokenAddress(usdcMint, toPubkey);
  const platformFeeAta = await getAssociatedTokenAddress(usdcMint, platformFeePubkey);

  // 构建本金转账指令
  const mainTransfer = createTransferInstruction(
    fromAta,
    toAta,
    fromPubkey,
    Math.floor(amount * 1000000) // 转换为最小单位（6位小数）
  );

  // 构建手续费转账指令
  const feeTransfer = createTransferInstruction(
    fromAta,
    platformFeeAta,
    fromPubkey,
    Math.floor(platformFee * 1000000)
  );

  // 组装交易
  const transaction = new Transaction();
  transaction.add(mainTransfer);
  transaction.add(feeTransfer);

  // 设置区块哈希（防止交易过期）
  const latestBlockhash = await solanaConnection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.feePayer = fromPubkey; // 临时设为用户地址

  return { transaction, platformFee };
};

/**
 * 本地签名交易
 * @param unsignedTx 未签名交易
 * @param encryptedKey 加密后的私钥
 * @param password 密码
 * @returns 签名后的交易 Base64 字符串
 */
export const signTransactionLocally = async (
  unsignedTx: Transaction,
  encryptedKey: string,
  password: string
): Promise<string> => {
  // 解密私钥
  const keypair = decryptKeyPair(encryptedKey, password);

  // 签名交易
  unsignedTx.sign(keypair);

  // 序列化交易
  const signedTxBuffer = unsignedTx.serialize();
  const signedTxBase64 = signedTxBuffer.toString('base64');

  // 销毁内存中的私钥
  destroyPrivateKey(keypair);

  return signedTxBase64;
};

/**
 * 查询 USDC 余额
 * @param walletAddress 钱包地址
 * @returns USDC 余额（单位：USDC）
 */
export const getUsdcBalance = async (walletAddress: string): Promise<number> => {
  const pubkey = new PublicKey(walletAddress);
  const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
  const ata = await getAssociatedTokenAddress(usdcMint, pubkey);

  try {
    const account = await getAccount(solanaConnection, ata);
    return Number(account.amount) / 1000000; // 转换为 USDC 单位
  } catch (err) {
    return 0;
  }
};

/**
 * 查询交易状态
 * @param txId 交易 ID
 * @returns 交易状态（success/failed/pending）
 */
export const getTransactionStatus = async (txId: string): Promise<'success' | 'failed' | 'pending'> => {
  try {
    const tx = await solanaConnection.getTransaction(txId, {
      commitment: 'confirmed'
    });
    if (!tx) return 'pending';
    return tx.meta?.err ? 'failed' : 'success';
  } catch (err) {
    return 'pending';
  }
};

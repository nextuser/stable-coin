import dotenv from 'dotenv';
import bs58 from 'bs58';
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount,
  //createTransferInstruction
} from '@solana/spl-token';
import type { SolanaAddress, TxId } from '../types/index.js';

// 加载环境变量
dotenv.config();

// 初始化Solana连接
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL!;
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// 加载Fee Payer账户（Base58私钥解码）
const FEE_PAYER_PRIVATE_KEY = process.env.FEE_PAYER_PRIVATE_KEY as string;
const feePayer = Keypair.fromSecretKey(bs58.decode(FEE_PAYER_PRIVATE_KEY));

// USDC Mint地址
const USDC_MINT = new PublicKey(process.env.USDC_MINT_ADDRESS!);

/**
 * 查询USDC余额（单位：USDC）
 * @param walletAddress Solana钱包地址
 */
export const getUsdcBalance = async (walletAddress: SolanaAddress): Promise<number> => {
  try {
    const walletPk = new PublicKey(walletAddress);
    const ataAddress = await getAssociatedTokenAddress(USDC_MINT, walletPk);
    const ataAccount = await getAccount(connection, ataAddress);
    return Number(ataAccount.amount) / 10 ** 6; // 转换为6位小数
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('Account does not exist')) return 0;
    throw new Error(`查询USDC余额失败：${err.message}`);
  }
};

/**
 * 提交USDC交易（Fee Payer代付Gas）
 * @param unsignedTxBase64 未签名交易Base64
 * @param userPk 用户公钥
 */
export const submitUsdcTx = async (unsignedTxBase64: string, userPk: SolanaAddress): Promise<TxId> => {
  userPk=userPk  //todo log public key
  try {
    // 反序列化未签名交易
    const unsignedTxBuffer = Buffer.from(unsignedTxBase64, 'base64');
    const tx = Transaction.from(unsignedTxBuffer);

    // Fee Payer部分签名
    tx.partialSign(feePayer);

    // 提交交易
    const txId = await sendAndConfirmTransaction(
      connection,
      tx,
      [feePayer],
      { commitment: 'confirmed', skipPreflight: false }
    );

    const { value: txStatus } = await connection.getSignatureStatus(txId);
    if (txStatus?.err) {
      throw new Error(`交易失败：${JSON.stringify(txStatus.err)}`);
    }

    return txId;
  } catch (error) {
    const err = error as Error;
    throw new Error(`提交交易失败：${err.message}`);
  }
};

/**
 * 验证Solana地址合法性
 * @param address 钱包地址
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// 导出核心对象
export { connection, feePayer, USDC_MINT };

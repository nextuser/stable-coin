import { EncryptionConfig, FeeConfig } from '../types';

export const CONFIG = {
  // Solana RPC（推荐测试网：https://api.devnet.solana.com）
  RPC_URL: 'https://api.devnet.solana.com',
  // USDC Mint地址（测试网）
  USDC_MINT: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  // 平台Fee Payer公钥（替换为实际测试网地址）
  PLATFORM_FEE_PAYER_PK: 'PLACEHOLDER_FEE_PAYER_PUBLIC_KEY',
  // 加密配置
  ENCRYPTION: {
    PBKDF2_ITERATIONS: 100000,
    PBKDF2_KEY_LEN: 32,
    SALT_LEN: 32,
    IV_LEN: 12,
  } as EncryptionConfig,
  FEE: {
    MIN_FEE_USDC: 0.001,
    FEE_BUFFER_RATIO: 1.1,
  } as FeeConfig,
};

export const SOLANA_CONST = {
  TOKEN_PROGRAM_ID: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  LAMPORTS_PER_SOL: 1000000000,
};


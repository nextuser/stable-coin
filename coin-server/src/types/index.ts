// Solana核心类型
export type SolanaAddress = string; // Solana钱包地址（Base58）
export type Base58PrivateKey = string; // Solana私钥（Base58）
export type TxId = string; // Solana交易ID（Base58）

// API响应通用类型
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
  error?: string;
}

// JWT载荷类型
export interface JwtPayload {
  userId: string;
  walletAddress: SolanaAddress;
}

// 交易参数类型
export interface TransactionCreateParams {
  txId: TxId;
  fromAddress: SolanaAddress;
  toAddress: SolanaAddress;
  amount: number;
  feeUsdc: number;
  status: 'pending' | 'success' | 'failed';
  userId: string;
}

// 请求体类型（扩展Express）
export interface RegisterRequest {
  username: string;
  password: string;
  walletAddress: SolanaAddress;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SubmitTxRequest {
  unsignedTxBase64: string;
  toAddress: SolanaAddress;
  amount: number;
  feeUsdc: number;
}

// 手续费规则类型
export type FeeRule = {
  type: 'fixed' | 'ratio'; // 固定/比例
  value: number; // 固定金额/比例（如0.1 / 0.001）
  min?: number; // 最低手续费（仅比例模式）
};

// 交易参数类型
export type TransactionParams = {
  fromAddress: string;
  toAddress: string;
  amount: number;
  platformFee: number;
};

// 签名后的交易提交参数
export type SignedTxSubmitParams = {
  signedTxBase64: string;
  toAddress: string;
  amount: number;
  platformFee: number;
};

// 交易记录类型
export type TransactionRecord = {
  txId: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  platformFee: number;
  gasFeeSol: number;
  status: 'success' | 'failed';
  createdAt: string;
};

// API 响应通用类型
export type ApiResponse<T = any> = {
  code: number;
  msg: string;
  data: T;
};

// 导航参数类型
export type RootStackParamList = {
  Home: undefined;
  ImportKey: undefined;
  Transaction: undefined;
};

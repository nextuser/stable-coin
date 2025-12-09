export type RootStackParamList = {
  InitWallet: undefined;
  Home: undefined;
  SignTx: { unsignedTxBase64: string; feeUsdc: number };
};

export type EncryptionConfig = {
  PBKDF2_ITERATIONS: number;
  PBKDF2_KEY_LEN: number;
  SALT_LEN: number;
  IV_LEN: number;
};

export type FeeConfig = {
  MIN_FEE_USDC: number;
  FEE_BUFFER_RATIO: number;
};


// useTransaction.ts
import { useState, useEffect } from 'react';
import { post, get } from '../utils/request';
import { createUnsignedTxWithFee, signTransactionLocally } from '../utils/solana';
import { TransactionRecord } from '../types';

export const useTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [txRecords, setTxRecords] = useState<TransactionRecord[]>([]);

  const submitTransaction = async (
    fromAddress: string,
    toAddress: string,
    amount: number,
    feeRule: any,
    encryptedKey: string,
    password: string
  ) => {
    setLoading(true);
    try {
      // 实现交易提交逻辑
      // 1. 创建带手续费的未签名交易
      // 2. 本地签名交易
      // 3. 提交到服务器
    } catch (err) {
      console.error('Transaction failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionRecords = async () => {
    setLoading(true);
    try {
      // 获取交易记录逻辑
      const res = await get<{ records: TransactionRecord[] }>('/api/transactions');
      setTxRecords(res.data.records);
    } catch (err) {
      console.error('Failed to fetch transaction records:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    submitTransaction,
    fetchTransactionRecords,
    txRecords,
    loading
  };
};
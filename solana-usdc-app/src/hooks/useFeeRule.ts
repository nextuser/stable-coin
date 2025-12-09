// useFeeRule.ts
import { useState, useEffect } from 'react';
import { get } from '../utils/request'; // 使用已有的 request 工具
import { FeeRule } from '../types';

export const useFeeRule = () => {
  const [feeRule, setFeeRule] = useState<FeeRule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeRule = async () => {
      try {
        const res = await get<{ feeRule: FeeRule }>('/api/config/fee-rule');
        setFeeRule(res.data.feeRule);
      } catch (err) {
        console.error('Failed to fetch fee rule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeRule();
  }, []);

  return { feeRule, loading };
};
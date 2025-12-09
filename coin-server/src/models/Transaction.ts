import mongoose, { Document, Schema, Types } from 'mongoose';
import type { SolanaAddress, TxId } from '../types/index';

// 交易状态枚举
export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed'
}

// 交易文档接口
export interface ITransaction extends Document {
  txId: TxId;
  fromAddress: SolanaAddress;
  toAddress: SolanaAddress;
  amount: number;
  feeUsdc: number;
  status: TransactionStatus;
  user: Types.ObjectId;
  createdAt: Date;
}

// 交易Schema
const transactionSchema = new Schema<ITransaction>(
  {
    txId: {
      type: String,
      required: [true, '交易ID不能为空'],
      unique: true,
      trim: true
    },
    fromAddress: {
      type: String,
      required: [true, '转出地址不能为空'],
      trim: true,
      validate: {
        validator: (v: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v),
        message: '无效的Solana转出地址'
      }
    },
    toAddress: {
      type: String,
      required: [true, '转入地址不能为空'],
      trim: true,
      validate: {
        validator: (v: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v),
        message: '无效的Solana转入地址'
      }
    },
    amount: {
      type: Number,
      required: [true, '转账金额不能为空'],
      min: [0.000001, 'USDC最小转账金额为0.000001'] // 6位小数精度
    },
    feeUsdc: {
      type: Number,
      required: [true, '手续费不能为空'],
      min: [0, '手续费不能为负数']
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '关联用户不能为空']
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // 仅保留创建时间
  }
);
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ txId: 1 });
transactionSchema.index({ status: 1 });

// 导出Transaction模型
export default mongoose.model<ITransaction>('Transaction', transactionSchema);

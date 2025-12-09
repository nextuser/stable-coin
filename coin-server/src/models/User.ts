import mongoose, { Document, Schema } from 'mongoose';
import type { SolanaAddress } from '../types/index.ts';

// 用户文档接口
export interface IUser extends Document {
  username: string;
  password: string;
  walletAddress: SolanaAddress;
  createdAt: Date;
  updatedAt: Date;
}

// 用户Schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, '用户名不能为空'],
      unique: true,
      trim: true,
      minlength: [3, '用户名长度不能小于3位']
    },
    password: {
      type: String,
      required: [true, '密码不能为空'],
      minlength: [6, '密码长度不能小于6位']
    },
    walletAddress: {
      type: String,
      required: [true, '钱包地址不能为空'],
      unique: true,
      trim: true,
      validate: {
        validator: (v: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v), // Solana地址校验
        message: '无效的Solana钱包地址'
      }
    }
  },
  {
    timestamps: true // 自动生成createdAt/updatedAt
  }
);

// 导出User模型
export default mongoose.model<IUser>('User', userSchema);

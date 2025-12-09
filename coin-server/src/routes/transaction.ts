import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getUsdcBalance, isValidSolanaAddress } from '../utils/solana.js';
import type {
  ApiResponse,
  RegisterRequest,
  LoginRequest,
  SolanaAddress
} from '../types/index.js';

// 创建路由实例
const router = express.Router();

// 1. 用户注册
router.post('/register', async (req: Request<{}, ApiResponse, RegisterRequest>, res: Response<ApiResponse>) => {
  try {
    const { username, password, walletAddress } = req.body;

    // 参数校验
    if (!username || !password || !walletAddress) {
      return res.status(400).json({ code: -1, msg: '参数不全' });
    }

    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ code: -1, msg: '无效的Solana钱包地址' });
    }

    // 检查用户是否存在
    const existingUser = await User.findOne({
      $or: [{ username }, { walletAddress }]
    });

    if (existingUser) {
      return res.status(400).json({ code: -1, msg: '用户名或钱包地址已存在' });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const newUser = new User({
      username,
      password: hashedPassword,
      walletAddress
    });

    await newUser.save();

    // 返回响应
    res.status(200).json({
      code: 0,
      msg: '注册成功',
      data: { username, walletAddress }
    });
  } catch (error) {
    const err = error as Error;
    console.error('注册失败:', err);
    res.status(500).json({
      code: -1,
      msg: '服务器错误',
      error: err.message
    });
  }
});

// 2. 用户登录
router.post('/login', async (req: Request<{}, ApiResponse, LoginRequest>, res: Response<ApiResponse>) => {
  try {
    const { username, password } = req.body;

    // 参数校验
    if (!username || !password) {
      return res.status(400).json({ code: -1, msg: '参数不全' });
    }

    // 查询用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ code: -1, msg: '用户不存在' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ code: -1, msg: '密码错误' });
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 返回响应
    res.status(200).json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        user: {
          username: user.username,
          walletAddress: user.walletAddress
        }
      }
    });
  } catch (error) {
    const err = error as Error;
    console.error('登录失败:', err);
    res.status(500).json({
      code: -1,
      msg: '服务器错误',
      error: err.message
    });
  }
});

// 3. 查询USDC余额
router.get('/balance', async (req: Request<{ walletAddress: SolanaAddress }, ApiResponse>, res: Response<ApiResponse>) => {
  try {
    const { walletAddress } = req.query;
    if(typeof(walletAddress) !== 'string') {
      return res.status(400).json({ code: -1, msg: '参数错误' });
    }

    // 参数校验
    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ code: -1, msg: '无效的Solana钱包地址' });
    }

    // 查询余额
    const balance = await getUsdcBalance(walletAddress);

    // 返回响应
    res.status(200).json({
      code: 0,
      msg: '查询成功',
      data: { balance }
    });
  } catch (error) {
    const err = error as Error;
    console.error('查询余额失败:', err);
    res.status(500).json({
      code: -1,
      msg: '服务器错误',
      error: err.message
    });
  }
});

// 导出路由
export default router;

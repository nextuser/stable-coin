import dotenv from 'dotenv';
import express, { Express } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import walletRoutes from './routes/wallet.js';
import transactionRoutes from './routes/transaction.js';
import type { ApiResponse } from './types/index.js';

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app: Express = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI!;

// 全局中间件
app.use(cors()); // 跨域
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // 表单解析

// 路由挂载
app.use('/api/wallet', walletRoutes);
app.use('/api/transaction', transactionRoutes);

// 健康检查接口
app.get('/health', (_, res: express.Response<ApiResponse>) => {
  res.status(200).json({ code: 0, msg: '服务运行正常' });
});

// 全局错误处理中间件
app.use((err: Error, _: express.Request, res: express.Response<ApiResponse>) => {
  console.error('全局错误:', err);
  res.status(500).json({
    code: -1,
    msg: '服务器内部错误',
    error: err.message
  });
});

// 连接MongoDB并启动服务
const startServer = async () => {
  try {
    // 连接MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB连接成功');

    // 启动HTTP服务
    app.listen(PORT, () => {
      console.log(`🚀 服务已启动：http://localhost:${PORT}`);
    });
  } catch (error) {
    const err = error as Error;
    console.error('❌ 服务启动失败:', err.message);
    process.exit(1);
  }
};

// 启动服务
startServer();

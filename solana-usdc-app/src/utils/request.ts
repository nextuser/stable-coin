import axios, { AxiosRequestConfig } from 'axios';
import { secureStoreGet, JWT_TOKEN_KEY } from './storage';
import { Alert } from 'react-native';
import { ApiResponse } from '../types';

// 创建 axios 实例
const request = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：添加 JWT 令牌
request.interceptors.request.use(
  async (config) => {
    const token = await secureStoreGet(JWT_TOKEN_KEY);
    if (token) {
      config.headers!['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一处理错误
// request.ts 中的响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;
    if (res.code !== 0) {
      Alert.alert('请求失败', res.msg || '操作失败');
      return Promise.reject(new Error(res.msg || '操作失败'));
    }
    return response; // 返回原始响应对象而不是数据
  },
  (error) => {
    const errMsg = error.response?.data?.msg || error.message || '网络异常';
    Alert.alert('错误', errMsg);
    return Promise.reject(error);
  }
);

// 封装请求方法
export const get = async <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return await request.get(url, { params, ...config });
};

export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return await request.post(url, data, config);
};

export default request;

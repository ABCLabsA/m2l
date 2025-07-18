import axios from "axios";
import { Executor } from "./Executor";
import { Api } from "./service";
import { regularApiConfig, aiApiConfig } from "../config/api";

// 常规API的axios实例（通过Next.js代理）
const RegularAxiosInstance = axios.create({
  baseURL: regularApiConfig.baseURL,
  headers: regularApiConfig.headers,
  timeout: regularApiConfig.timeout,
});

// AI API的axios实例（直接连接后端）
const AiAxiosInstance = axios.create({
  baseURL: aiApiConfig.baseURL,
  headers: aiApiConfig.headers,
  timeout: aiApiConfig.timeout,
});

// 通用的请求拦截器函数
const createRequestInterceptor = (instance: any) => {
  instance.interceptors.request.use((config: any) => {
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          const jwtToken = authData.state?.tokenValue;
          if (jwtToken) {
            config.headers.Authorization = `Bearer ${jwtToken}`;
          }
        }
      } catch (error) {
        console.error('Error getting JWT token:', error);
      }
    }
    return config;
  });
};

// 通用的响应拦截器函数
const createResponseInterceptor = (instance: any) => {
  instance.interceptors.response.use(
    (response: any) => response.data,
    (error: any) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
      
      // 处理429错误 - AI助手使用次数上限
      if (error.response?.status === 429) {
        const responseData = error.response.data;
        // 创建一个带有特定标识的错误对象
        const rateLimitError = new Error(responseData?.message || '您今日的AI助手使用次数已达上限，请明天再试');
        (rateLimitError as any).isRateLimit = true;
        (rateLimitError as any).code = 429;
        (rateLimitError as any).originalData = responseData;
        return Promise.reject(rateLimitError);
      }
      
      return Promise.reject(error);
    }
  );
};

// 应用拦截器到两个实例
createRequestInterceptor(RegularAxiosInstance);
createResponseInterceptor(RegularAxiosInstance);
createRequestInterceptor(AiAxiosInstance);
createResponseInterceptor(AiAxiosInstance);

// 常规API的executor
export const regularExecutor: Executor = (args: {
  readonly uri: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly headers?: {readonly [key:string]: string};
  readonly body?: any;
}) => {
  console.log(`常规API请求: ${args.method} ${args.uri} -> ${regularApiConfig.baseURL}${args.uri}`);
  return RegularAxiosInstance.request({
    url: args.uri,
    method: args.method,
    data: args.body,
    headers: args.headers,
  });
};

// AI API的executor
export const aiExecutor: Executor = (args: {
  readonly uri: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly headers?: {readonly [key:string]: string};
  readonly body?: any;
}) => {
  console.log(`AI API请求: ${args.method} ${args.uri} -> ${aiApiConfig.baseURL}${args.uri}`);
  return AiAxiosInstance.request({
    url: args.uri,
    method: args.method,
    data: args.body,
    headers: args.headers,
  });
};

// 兼容性：默认使用常规executor
export const executor = regularExecutor;

// 创建两个不同的API实例
export const api = new Api(regularExecutor);
export const aiApi = new Api(aiExecutor);   
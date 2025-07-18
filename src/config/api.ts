// API配置

// 常规API配置（通过Next.js代理）
export const getRegularApiBaseUrl = (): string => {
  // 常规API始终通过代理
  return '/back';
};

// AI API配置（直接连接后端）
export const getAiApiBaseUrl = (): string => {
  // 如果是浏览器环境
  if (typeof window !== 'undefined') {
    // 开发环境和生产环境都直接连接
    return process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8100';
  }
  
  // 服务器端环境（SSR）
  return process.env.AI_API_URL || 'http://localhost:8100';
};

// 常规API配置选项（通过代理）
export const regularApiConfig = {
  baseURL: getRegularApiBaseUrl(),
  timeout: 30000, // 30秒超时，适合常规操作
  headers: {
    'Content-Type': 'application/json',
  },
};

// AI API配置选项（直接连接）
export const aiApiConfig = {
  baseURL: getAiApiBaseUrl(),
  timeout: 1000000, // 1000秒超时，适合AI长时间处理
  headers: {
    'Content-Type': 'application/json',
  },
};

// 检查是否在开发环境
export const isDevelopment = process.env.NODE_ENV === 'development';

// 检查是否在生产环境
export const isProduction = process.env.NODE_ENV === 'production';

console.log('API Configuration:', {
  environment: process.env.NODE_ENV,
  regularApiBaseURL: regularApiConfig.baseURL,
  aiApiBaseURL: aiApiConfig.baseURL,
  isDevelopment,
  isProduction
}); 
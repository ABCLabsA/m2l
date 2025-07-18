# Aptos 证书系统工具类

基于您的智能合约 `dev::certificate` 重新构建的 TypeScript 工具类，用于与 Aptos 区块链上的证书颁发系统进行交互。

## 功能特性

### 🎓 证书管理
- **NFT 证书颁发**: 为用户颁发课程完成证书 NFT
- **证书查询**: 查看用户已获得的证书
- **证书统计**: 查看特定课程的证书颁发统计

### 💰 代币系统
- **M2L 代币**: 自定义的学习积分代币
- **代币颁发**: 与证书一起颁发代币奖励
- **余额查询**: 查看用户代币余额
- **供应量查询**: 查看代币总供应量

### 📚 课程管理
- **课程注册**: 添加新课程到系统
- **课程更新**: 修改现有课程信息
- **课程删除**: 从系统中移除课程
- **课程查询**: 获取课程详细信息

## 快速开始

### 安装依赖

```bash
npm install @aptos-labs/ts-sdk
```

### 基本使用

```typescript
import { aptosClient } from './src/utils/AptosCertificates';

// 初始化合约（管理员操作，只需执行一次）
await aptosClient.initialize();

// 创建用户账户
const userAccount = aptosClient.createUserAccount();

// 申请测试代币
await aptosClient.fundAccount(userAccount.accountAddress.toString());

// 设置课程
await aptosClient.setCourse(
  "blockchain_101", 
  100, 
  "https://example.com/metadata.json"
);

// 为用户颁发证书和代币
await aptosClient.mintCertificateAndCoins(userAccount, "blockchain_101", 50);
```

## API 文档

### 管理员操作

#### `initialize()`
初始化智能合约系统
```typescript
await aptosClient.initialize();
```

#### `setCourse(courseId, points, metadataUri)`
设置或更新课程信息
```typescript
await aptosClient.setCourse(
  "course_id",     // 课程ID
  100,             // 积分奖励
  "metadata_uri"   // 元数据URI
);
```

#### `removeCourse(courseId)`
删除课程
```typescript
await aptosClient.removeCourse("course_id");
```

#### `mintCertificateAndCoins(userAccount, courseId, coinAmount)`
为用户颁发证书NFT和代币
```typescript
await aptosClient.mintCertificateAndCoins(
  userAccount,     // 用户账户对象
  "course_id",     // 课程ID
  50               // 代币数量
);
```

### 查询操作

#### `getCourseInfo(courseId)`
获取课程信息
```typescript
const courseInfo = await aptosClient.getCourseInfo("course_id");
// 返回: { points: number, metadata_uri: string }
```

#### `viewUserCertificates(userAddress)`
查看用户证书
```typescript
const certificates = await aptosClient.viewUserCertificates("0x...");
```

#### `viewUserBalance(userAddress)`
查看用户代币余额
```typescript
const balance = await aptosClient.viewUserBalance("0x...");
```

#### `viewCertificateStats(courseId)`
查看证书统计
```typescript
const stats = await aptosClient.viewCertificateStats("course_id");
```

#### `viewTotalCoinSupply()`
查看代币总供应量
```typescript
const totalSupply = await aptosClient.viewTotalCoinSupply();
```

### 工具函数

#### `createUserAccount()`
创建新用户账户
```typescript
const userAccount = aptosClient.createUserAccount();
```

#### `restoreAccountFromPrivateKey(privateKeyHex)`
从私钥恢复账户
```typescript
const account = aptosClient.restoreAccountFromPrivateKey("0x...");
```

#### `getAccountBalance(accountAddress)`
获取账户 APT 余额
```typescript
const balance = await aptosClient.getAccountBalance("0x...");
```

#### `fundAccount(accountAddress)`
为账户申请测试代币
```typescript
await aptosClient.fundAccount("0x...");
```

## 数据结构

### CourseMeta
```typescript
interface CourseMeta {
  points: number;           // 课程积分
  metadata_uri: string;     // 元数据URI
}
```

### CertificateInfo
```typescript
interface CertificateInfo {
  token_address: string;    // NFT代币地址
  user_address: string;     // 用户地址
  course_id: string;        // 课程ID
}
```

## 运行示例

运行包含的示例代码来了解完整的使用流程：

```bash
npx ts-node src/utils/example.ts
```

## 注意事项

1. **网络配置**: 当前配置为 Aptos 测试网 (TESTNET)
2. **管理员权限**: 某些操作需要管理员账户权限
3. **Gas 费用**: 所有交易都需要 APT 来支付 gas 费用
4. **多签名交易**: 颁发证书需要管理员和用户双方签名

## 错误处理

工具类包含完整的错误处理机制，所有异步操作都包装在 try-catch 块中，并提供详细的错误信息。

## 配置

当前配置参数：
- **网络**: Aptos Testnet
- **模块地址**: `dev`
- **模块名称**: `certificate`
- **管理员地址**: `86314c7111dfd122845a1de317550ffd4371c18e9dfe9c316597ef9ed1c8ee76`

如需修改配置，请编辑 `src/utils/AptosCertificates.ts` 文件中的相关常量。

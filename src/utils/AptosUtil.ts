import { Aptos, AptosConfig, MoveString, MoveVector, Network, SimpleTransaction, TypeTagVector } from "@aptos-labs/ts-sdk";

export class AptosUtil {
  public client: Aptos;
  public contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  public constructor() {
    const config = new AptosConfig({
      network: Network.MAINNET,
    });
    this.client = new Aptos(config);
  }

  public generateCertificateTransaction(
    sender: string, 
    courseId: string, 
    courseName: string,
    coinAmount: number, 
    nonce: string, 
    signatureBytes: number[],
    courseBadge: string
  ): Promise<SimpleTransaction> {
    const reward = coinAmount.toString() + "00000000"
    const transaction = this.client.transaction.build.simple({
        sender: sender,
        data: {
            function: `${this.contractAddress}::certificate::mint_certificate_and_coins`,
            functionArguments: [
                courseId,           // course_id: String
                courseName,         // course_name: String
                reward,         // coin_amount: u64
             // points: u64  
                nonce,              // nonce: String (TypeScript string 会自动转换为 Move String)
                signatureBytes,     // signature: vector<u8> (number[] 会自动转换为 vector<u8>)
                courseBadge,        // course_badge: String
            ]
        },
        options: {
          maxGasAmount: 20000 // 这里设置最大 gas，单位是 Octa（1 APT = 100,000,000 Octa）
        }
    })
    return transaction;
  }

  // 查询M2L币数量  
  public async getM2lCoinCount(address: string): Promise<string> {
    try {
      // 假设 M2L 代币的资源类型，您需要根据实际情况调整
      const coinType = this.contractAddress + "::m2l_coin::M2lCoin";
      const coinStoreType = "0x1::coin::CoinStore<" + coinType + ">";
      
      const resource = await this.client.getAccountResource({
        accountAddress: address,
        resourceType: coinStoreType as `${string}::${string}::${string}`,
      });
      
      // 从资源中提取余额
      const balance = (resource as any).coin.value;
      return balance;
    } catch (error) {
      console.error("获取 M2L 代币余额失败:", error);
      return "0";
    }
  }

  // 查询NFT数量
  public async getNftCount(address: string): Promise<number> {
    try {
      // 使用 Aptos SDK 查询账户拥有的所有 Token (NFT)
      const tokens = await this.client.getAccountOwnedTokens({
        accountAddress: address,
      });
      
      return tokens.length;
    } catch (error) {
      console.error("获取 NFT 数量失败:", error);
      return 0;
    }
  }

  // 查询特定集合的NFT数量
  public async getNftCountByCollection(address: string, collectionAddress?: string): Promise<number> {
    try {
      const tokens = await this.client.getAccountOwnedTokens({
        accountAddress: address,
      });
      
      if (!collectionAddress) {
        return tokens.length;
      }
      
      // 如果指定了集合地址，则过滤该集合的NFT
      const filteredTokens = tokens.filter(token => 
        token.current_token_data?.collection_id === collectionAddress
      );
      
      return filteredTokens.length;
    } catch (error) {
      console.error("获取特定集合 NFT 数量失败:", error);
      return 0;
    }
  }

  // 获取账户拥有的所有代币余额（包括 APT 和其他代币）
  public async getAllCoinBalances(address: string): Promise<Record<string, string>> {
    try {
      const resources = await this.client.getAccountResources({
        accountAddress: address,
      });
      
      const balances: Record<string, string> = {};
      
      // 遍历所有资源，查找 CoinStore 类型的资源
      for (const resource of resources) {
        if (resource.type.includes("0x1::coin::CoinStore")) {
          // 提取代币类型
          const coinTypeMatch = resource.type.match(/0x1::coin::CoinStore<(.+)>/);
          if (coinTypeMatch && coinTypeMatch[1]) {
            const coinType = coinTypeMatch[1];
            const balance = (resource.data as any).coin.value;
            balances[coinType] = balance;
          }
        }
      }
      
      return balances;
    } catch (error) {
      console.error("获取所有代币余额失败:", error);
      return {};
    }
  }

  public castObjToUint8Array(obj: any): Uint8Array {
    return new Uint8Array(Object.values(obj));
  }

  public castNumberArrayToUint8Array(numberArray: number[]): Uint8Array {
    return new Uint8Array(numberArray);
  }

  // ========================== 地址格式化工具 ========================
  
  // 格式化Aptos地址 - 确保地址是64字符长度
  public static formatAddress(address: string): string {
    if (!address) return '';
    
    // 移除0x前缀
    let cleanAddress = address.replace('0x', '');
    // 填充到64字符
    cleanAddress = cleanAddress.padStart(64, '0');
    // 添加0x前缀
    return '0x' + cleanAddress;
  }

  // 验证地址格式是否正确
  public static isValidAddress(address: string): boolean {
    if (!address) return false;
    
    // 检查是否以0x开头
    if (!address.startsWith('0x')) return false;
    
    // 检查长度是否正确（0x + 64字符）
    if (address.length !== 66) return false;
    
    // 检查是否只包含十六进制字符
    const hexPart = address.slice(2);
    return /^[0-9a-fA-F]{64}$/.test(hexPart);
  }

  // 缩短地址显示（用于UI显示）
  public static shortenAddress(address: string, startLength: number = 6, endLength: number = 4): string {
    if (!address) return '';
    
    if (address.length <= startLength + endLength + 2) {
      return address; // 地址太短，直接返回
    }
    
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
  }

  // ========================== 合约 View 函数封装 ========================
  
  // 查看用户的证书
  public async viewUserCertificates(userAddress: string): Promise<any[]> {
    try {
      const result = await this.client.view({
        payload: {
          function: `${this.contractAddress}::certificate::view_user_certificates`,
          functionArguments: [userAddress],
        },
      });
      return result[0] as any[];
    } catch (error) {
      console.error("查询用户证书失败:", error);
      return [];
    }
  }

  // 查看用户的M2L代币余额
  public async viewUserBalance(userAddress: string): Promise<string> {
    try {
      const result = await this.client.view({
        payload: {
          function: `${this.contractAddress}::certificate::view_user_balance`,
          functionArguments: [userAddress],
        },
      });
      return result[0] as string;
    } catch (error) {
      console.error("查询用户余额失败:", error);
      return "0";
    }
  }

  // 查看课程证书统计信息
  public async viewCertificateStats(courseId: string): Promise<string[]> {
    try {
      const result = await this.client.view({
        payload: {
          function: `${this.contractAddress}::certificate::view_certificate_stats`,
          functionArguments: [courseId],
        },
      });
      return result[0] as string[];
    } catch (error) {
      console.error("查询证书统计失败:", error);
      return [];
    }
  }

  // 查看M2L代币总供应量
  public async viewTotalCoinSupply(): Promise<string | null> {
    try {
      const result = await this.client.view({
        payload: {
          function: `${this.contractAddress}::certificate::view_total_coin_supply`,
          functionArguments: [],
        },
      });
      
      // result[0] 是 Option<u128> 类型，需要检查是否有值
      const supply = result[0] as any;
      if (supply && supply.vec && supply.vec.length > 0) {
        return supply.vec[0] as string;
      }
      return null;
    } catch (error) {
      console.error("查询代币总供应量失败:", error);
      return null;
    }
  }

  // 检查用户是否拥有特定课程的证书（辅助函数）
  public async hasCourseCertificate(userAddress: string): Promise<boolean> {
    try {
      const certificates = await this.viewUserCertificates(userAddress);
      // 这里需要根据实际返回的数据结构来判断
      // 由于合约中的view_user_certificates目前返回空数组，可能需要其他方式实现
      return certificates.length > 0;
    } catch (error) {
      console.error("检查用户证书失败:", error);
      return false;
    }
  }

  // 获取用户的详细信息汇总
  public async getUserSummary(userAddress: string): Promise<{
    m2lBalance: string;
    certificates: any[];
    nftCount: number;
    allBalances: Record<string, string>;
  }> {
    try {
      // 并行查询多个信息
      const [m2lBalance, certificates, nftCount, allBalances] = await Promise.all([
        this.viewUserBalance(userAddress),
        this.viewUserCertificates(userAddress),
        this.getNftCount(userAddress),
        this.getAllCoinBalances(userAddress)
      ]);

      return {
        m2lBalance,
        certificates,
        nftCount,
        allBalances
      };
    } catch (error) {
      console.error("获取用户信息汇总失败:", error);
      return {
        m2lBalance: "0",
        certificates: [],
        nftCount: 0,
        allBalances: {}
      };
    }
  }
}

export const aptosUtil = new AptosUtil();
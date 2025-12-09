import * as web3 from '@solana/web3.js';
import { PublicKey ,LAMPORTS_PER_SOL} from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv'

import { TOKEN_PROGRAM_ID , AccountLayout } from '@solana/spl-token';
dotenv.config();

// 1. 显式声明 Config 接口（类型约束，明确配置项）
interface Config {
  HELIUS_API_KEY: string;
  SOLANA_ENV: string;
  HOME: string;
  DEVNET_WSS_URL: string;
  MAINNET_RPC_URL: string;
  DEVNET_RPC_URL: string;
}

// 2. 抽离必填配置项列表（可维护性：新增/删除只需改这里）
const REQUIRED_ENV_KEYS: (keyof Config)[] = [
  'HELIUS_API_KEY',
  'SOLANA_ENV',
  'DEVNET_WSS_URL',
  'MAINNET_RPC_URL',
  'DEVNET_RPC_URL'
  // HOME 可选：若HOME不需要强制配置，从必填列表移除
];

/**
 * 获取并校验环境配置
 * @returns 校验后的配置对象
 * @throws 进程退出（必填配置缺失时）
 */
function getConfig(): Config {
  // 3. 初始化配置（合理默认值 + 类型约束）
  const result: Config = {
    HELIUS_API_KEY: process.env.HELIUS_API_KEY || '',
    SOLANA_ENV: process.env.SOLANA_ENV || 'devnet', // 合理默认值，提升可用性
    HOME: process.env.HOME || '', // HOME 通常由系统自动设置，无需强制校验
    DEVNET_WSS_URL: process.env.DEVNET_WSS_URL || '',
    MAINNET_RPC_URL: process.env.MAINNET_RPC_URL || '',
    DEVNET_RPC_URL: process.env.DEVNET_RPC_URL || '',
  };

  // 4. 安全校验必填配置（替代原for...in，更精准）
  REQUIRED_ENV_KEYS.forEach((key) => {
    const value = result[key].trim(); // 去除首尾空格，避免空字符串+空格的无效配置
    // 精准空值判断：仅校验 undefined/空字符串（排除合法的非空值）
    if (!value) {
      console.error(`\x1B[31m❌ 环境配置错误：请在.env文件中配置 ${key}（不能为空/仅空格）！\x1B[0m`);
      process.exitCode = -1; // 先设置退出码，确保进程退出状态正确
      process.exit(-1); // 退出进程，阻止后续逻辑执行
    }
  });

  // 5. 可选：补充SOLANA_ENV的合法值校验（增强配置合法性）
  const validSolanaEnvs = ['devnet', 'mainnet-beta', 'testnet','localnet'];
  if (!validSolanaEnvs.includes(result.SOLANA_ENV)) {
    console.warn(`\x1B[33m⚠️ SOLANA_ENV配置值${result.SOLANA_ENV}不合法，建议使用：${validSolanaEnvs.join('/')}\x1B[0m`);
  }

  return result;
}

const config = getConfig();
//console.log(process.env);
export const  DEVNET_RPC_URL:string|undefined = config.DEVNET_RPC_URL
if(!DEVNET_RPC_URL){
    console.error("DEVNET_RPC_URL未配置！ 请在.env文件中配置DEVNET_RPC_URL！")
    process.exit(-1);
}
//用来模拟https://beta.solpg.io/ 的环境中的pg
export type PlayGround = {
    wallet : {
        keypair:web3.Keypair,
        publicKey:web3.PublicKey
    },
    connection:web3.Connection,
    rpc_url : string
    //PROGRAM_ID :web3.PublicKey
}

export function getWssConnection(){
    return new  web3.Connection(config.DEVNET_WSS_URL,"confirmed");
}

export function get_rpc_url(env : string) :string{
    dotenv.config();
    if(env == "mainnet"){
        //# return config.MAINNET_RPC_URL
        return config.MAINNET_RPC_URL
    } else {
        return config.DEVNET_RPC_URL
    }
}

export function get_pg(payer? :web3.Keypair, env ? : string) : PlayGround{
    if(!payer){
        payer = getKeypair();
    }
    if(!env){
        env = config.SOLANA_ENV;
    }

    let rpc_url = get_rpc_url(env);
    if(typeof(rpc_url) != 'string' ){
        console.log("error url:",rpc_url);
        process.exit(-1);
    }
    
    rpc_url = rpc_url.replace("$HELIUS_API_KEY",config.HELIUS_API_KEY)
    console.log("connect to:",rpc_url);
    let connection = new web3.Connection(rpc_url, "confirmed");
    
    return {
        wallet : { publicKey:payer.publicKey,
            keypair :payer},
        connection: connection,
        rpc_url : rpc_url,
       // PROGRAM_ID : new web3.PublicKey(programId) ,
    }
}


// 定义读取秘钥文件的函数
export function readSecretKeyFromFile(filePath: string): web3.Keypair {
    try {
        console.log("read secret key from:",filePath);
        if(filePath.startsWith("./")){
            filePath = path.resolve(__dirname, filePath);
        }
        // 读取文件内容
        const secretKeyData = fs.readFileSync(filePath, 'utf8');
        // 将文件内容解析为 JSON 格式
        const secretKeyArray = JSON.parse(secretKeyData);
        // 将解析后的数组转换为 Uint8Array 类型
        const secretKeyUint8Array = new Uint8Array(secretKeyArray);
        // 使用 Uint8Array 创建 Keypair 对象
        return web3.Keypair.fromSecretKey(secretKeyUint8Array);
    } catch (error) {
        console.error('Error reading secret key file:', error);
        throw error;
    }
}

export function getKeypair() : web3.Keypair{
    // 示例：指定秘钥文件路径
    const secretKeyFilePath = path.resolve(config.HOME,'./.config/solana/id.json');
    // 调用函数读取秘钥文件
    const keypair = readSecretKeyFromFile(secretKeyFilePath);

    // 打印公钥和私钥（注意：私钥信息敏感，请勿随意打印）
    console.log('connected : Public Key:', keypair.publicKey.toBase58());
    // console.log('Secret Key:', keypair.secretKey); 
    return keypair;

}


export function show_tx(digest: string) {
    console.log(`https://solscan.io/tx/${digest}?cluster=devnet`);
}

export async function show_balance(connection:web3.Connection,addr :string, prompt ? : string){
    if(prompt) console.log(prompt);
    console.log("My address:", addr);
    let pk = new web3.PublicKey(addr);
    const balance = await connection.getBalance(pk);
    console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);
}

export async function show_account(connection:web3.Connection,addr :string){
    console.log("account info of ", addr);
    console.log(await connection.getAccountInfo(new web3.PublicKey(addr)));
}

export async function query_token(owner:string,token?:string) {
    let pg = get_pg();
    let filter = token ? { mint : new PublicKey(token)} : { programId: TOKEN_PROGRAM_ID };
    const tokenAccounts = await pg.connection.getTokenAccountsByOwner(
      new PublicKey(owner),
      filter
    );
    console.log("Token                                         Balance  ");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((tokenAccount) => {
      const accountData = AccountLayout.decode(tokenAccount.account.data);
      console.log(`${accountData.mint.toBase58()}   ${accountData.amount}  }`);
    })
  
  }

export async function query_balance() {
    let pg = get_pg();
    return  (await pg.connection.getBalance(pg.wallet.publicKey))/LAMPORTS_PER_SOL;
}

export const PROGRAM_ID= new PublicKey('D3ppXDXN3mzM6v8rQYTzwW8A3hCaDG5Eg6e7uToYJJjw');
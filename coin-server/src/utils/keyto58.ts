import {readSecretKeyFromFile} from './utils'
import bs58 from 'bs58'
let keypair = readSecretKeyFromFile("/home/ljl/.config/solana/keys/first.json")
console.log( keypair.publicKey.toBase58(), bs58.encode(keypair.secretKey)  )
import { IPDB } from "../src/ipdb.js"
import dotenv from 'dotenv'
dotenv.config()

const ipdb = new IPDB()
ipdb.debug = true
console.log("Using provider:", "https://goerli.infura.io/v3/" + process.env.INFURA_PROJECT_ID)
const provider = new ipdb.ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/" + process.env.INFURA_PROJECT_ID);
ipdb.wallet = new ipdb.ethers.Wallet(process.env.OWNER_KEY).connect(provider)

const { db, id } = await ipdb.retrieve("ipfs_rocks", true)
console.log("Contents are:", db)
console.log('--')

// Read stats from database
const info = await ipdb.stats(id)
console.log("Informations about db are:", info)
console.log('--')

// Set Pinata Key
console.log('Web3.Storage JWT is:', process.env.WEB3STORAGE_JWT)
ipdb.set('web3storage', process.env.WEB3STORAGE_JWT)

// Pin db remotely
const pinned = await ipdb.pin(id, 'web3storage')
console.log("Pinning result is:", pinned)

process.exit()
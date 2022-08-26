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

// Update database
await ipdb.put(id, { rocks: true })
const put1 = await ipdb.get(id, "rocks")
console.log("`rocks` value is:", put1)
console.log('--')

// Update it again
await ipdb.put(id, { power: Math.floor(Math.random() * 1000) })
const put2 = await ipdb.get(id, "power")
console.log("`power` value is:", put2)
console.log('--')

// Read stats from database
const info = await ipdb.stats(id)
console.log("Informations about db are:", info)
console.log('--')

const tx = await ipdb.store(id)
if (tx.hash !== undefined) {
    console.log("Pending transaction at:", tx.hash)
    const receipt = await tx.wait()
    console.log("💸 Gas used:", receipt.gasUsed.toString())
    console.log("Db stored successfully!")
} else {
    console.log("Error while creating transaction..")
}

process.exit()
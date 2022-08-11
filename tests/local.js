import { IPDB } from "../src/ipdb.js"

const ipdb = new IPDB()
const ethers = ipdb.ethers
ipdb.wallet = ethers.Wallet.createRandom()

const { db, id } = await ipdb.create("ipfsrocks")
console.log("Contents are:", db)
console.log('--')

// Update database
await ipdb.put(id, { rocks: true })
const put1 = await ipdb.get(id, "rocks")
console.log("`rocks` value is:", put1)
console.log('--')

// Update it again
await ipdb.put(id, { power: 100 })
const put2 = await ipdb.get(id, "power")
console.log("`power` value is:", put2)
console.log('--')

// Print complete db
const complete = await ipdb.open(id)
console.log("Complete db is:", complete)
console.log('--')

// Read stats from database
const info = await ipdb.stats(id)
console.log("Informations about db are:", info)
console.log('--')

// Exit test
console.log("Nothing to do, closing..")
process.exit()
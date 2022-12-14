import * as IPFS from 'ipfs-core'
import { ethers } from "ethers"
import { ABI } from './abi.js'
import { pinFileToPinata } from './providers/pinata.js'
import { pinFileToWeb3Storage } from './providers/web3storage.js'
export class IPDB {
    deployments = {
        goerli: "0xB4E1E4C194972703f9ecfeaB396B3B6aaccd52Ab",
        rinkeby: "0xC1755f486Fa83912a94b0A1904e74722d557AB0b",
        "aurora-testnet": "0x1Aa65998a6751464FACD2f62Fa28e5B0034496ca",
        mumbai: "0x1Aa65998a6751464FACD2f62Fa28e5B0034496ca"
    }
    ethers = ethers
    blockchain = 'goerli'
    ipfs
    wallet
    contract
    abi = ABI
    debug = false
    providers = {}

    async create(name) {
        if (this.wallet !== undefined) {
            if (this.ipfs === undefined) {
                if (this.debug) {
                    console.log("Creating IPFS instance..")
                }
                this.ipfs = await IPFS.create({ silent: this.debug ? false : true })
            }
            let address = this.wallet.address
            let version = 0
            if (this.contract === undefined) {
                this.contract = new ethers.Contract(this.deployments[this.blockchain], this.abi, this.wallet)
            }
            let id = "/" + address + "/" + name + "/ipdb" + version + '.json'
            let dbExists = false
            // Check if same database exists in blockchain
            try {
                if (this.debug) {
                    console.log("Checking on-chain database:", name)
                }
                const onchain = await this.contract.get(address, name)
                version = parseInt(onchain[1].toString())
                if (this.debug) {
                    console.log("On-chain version is:", version)
                }
                if (version > 0) {
                    dbExists = true
                }
            } catch (e) {
                if (this.debug) {
                    console.log(e)
                    console.log("Can't get latest version from blockchain..")
                }
            }
            if (!dbExists) {
                // Creating root path
                try {
                    await this.ipfs.files.mkdir("/" + address)
                } catch (e) {
                    if (this.debug) {
                        console.log("Root path exists..")
                    }
                }
                // Creating specific path
                try {
                    await this.ipfs.files.mkdir("/" + address + "/" + name)
                } catch (e) {
                    if (this.debug) {
                        console.log("Database path exists..")
                    }
                }
                // Check if database exists
                let exists = false
                try {
                    const stats = await this.ipfs.files.stat(id)
                    exists = true
                } catch (e) {
                    if (this.debug) {
                        console.log("Need to create database..")
                    }
                }
                if (!exists) {
                    try {
                        if (this.debug) {
                            console.log("Creating new database at:", id)
                        }
                        await this.ipfs.files.touch(id)
                        await this.ipfs.files.write(id, JSON.stringify({}), { cidVersion: 1 })
                    } catch (e) {
                        if (this.debug) {
                            console.log("Can't write new database..")
                            console.log(e)
                        }
                    }
                }
                let db
                try {
                    const chunks = []
                    for await (const chunk of this.ipfs.files.read(id)) {
                        chunks.push(chunk)
                    }
                    db = JSON.parse(chunks.join())
                } catch (e) {
                    if (this.debug) {
                        console.log("Can't open database..")
                    }
                }
                return { db, id }
            } else {
                console.log("Same database exists, please use `retrieve` function to instantiate the database.")
                return { db: false, id: false }
            }
        } else {
            console.log("Wallet is undefined, must provide it first")
            return false
        }
    }

    async retrieve(name, overwrite = false) {
        if (this.wallet !== undefined) {
            if (this.debug) {
                console.log("Creating IPFS instance..")
            }
            if (this.ipfs === undefined) {
                this.ipfs = await IPFS.create({ silent: this.debug ? false : true })
            }
            let address = this.wallet.address
            let version = 1
            let cid
            if (this.contract === undefined) {
                this.contract = new ethers.Contract(this.deployments[this.blockchain], this.abi, this.wallet)
            }
            // Get latest version from blockchain
            try {
                if (this.debug) {
                    console.log("Recovering database:", name)
                }
                const onchain = await this.contract.get(address, name)
                version = parseInt(onchain[1].toString())
                if (this.debug) {
                    console.log("On-chain version is:", version)
                }
                if (version > 0) {
                    cid = onchain[0]
                }
            } catch (e) {
                if (this.debug) {
                    console.log(e)
                    console.log("Can't get latest version from blockchain..")
                }
            }
            if (cid !== undefined) {
                let id = "/" + address + "/" + name + "/ipdb" + version + '.json'
                let db
                if (this.debug) {
                    console.log("Retrieving database from IPFS CID:", cid)
                }
                try {
                    const chunks = []
                    for await (const chunk of this.ipfs.cat(cid)) {
                        chunks.push(chunk.toString())
                    }
                    if (this.debug) {
                        console.log("RETRIEVED RAW DB:", chunks.join())
                    }
                    if (chunks.join().length > 0) {
                        db = JSON.parse(chunks.join().replace('{{', '{').replace('}}', '}'))
                    }
                } catch (e) {
                    if (this.debug) {
                        console.log(e)
                        console.log("Can't open database..")
                        return false
                    }
                }
                // Creating root path
                try {
                    await this.ipfs.files.mkdir("/" + address)
                } catch (e) {
                    if (this.debug) {
                        console.log("Root path exists..")
                    }
                }
                // Creating specific path
                try {
                    await this.ipfs.files.mkdir("/" + address + "/" + name)
                } catch (e) {
                    if (this.debug) {
                        console.log("Database path exists..")
                    }
                }
                // Check if database exists
                let exists = false
                try {
                    const stats = await this.ipfs.files.stat(id)
                    exists = true
                } catch (e) {
                    if (this.debug) {
                        console.log("Need to create database..")
                    }
                }
                if (!exists) {
                    try {
                        if (this.debug) {
                            console.log("Creating new database at:", id)
                        }
                        await this.ipfs.files.touch(id)
                        await this.ipfs.files.write(id, JSON.stringify(db), { cidVersion: 1 })
                    } catch (e) {
                        if (this.debug) {
                            console.log("Can't write new database..")
                        }
                    }
                } else if (overwrite === true) {
                    try {
                        if (this.debug) {
                            console.log("Overwriting database at:", id)
                        }
                        await this.ipfs.files.write(id, JSON.stringify(db), { cidVersion: 1 })
                    } catch (e) {
                        if (this.debug) {
                            console.log("Can't write new database..")
                            console.log(e)
                        }
                    }
                }
                return { db, id }
            } else {
                if (this.debug) {
                    console.log("Nothing to recover, DB never stored on-chain")
                }
                return false
            }
        } else {
            console.log("Wallet is undefined, must provide it first")
            return false
        }
    }

    async open(id) {
        try {
            const chunks = []
            for await (const chunk of this.ipfs.files.read(id)) {
                chunks.push(chunk.toString())
            }
            return JSON.parse(chunks.join().replace('{{', '{').replace('}}', '}'))
        } catch (e) {
            if (this.debug) {
                console.log(e)
            }
            return false
        }
    }

    async put(id, doc) {
        try {
            const chunks = []
            for await (const chunk of this.ipfs.files.read(id)) {
                chunks.push(chunk.toString())
            }
            let db = JSON.parse(chunks.join().replace('{{', '{').replace('}}', '}'))
            for (let k in doc) {
                db[k] = doc[k]
            }
            await this.ipfs.files.write(id, JSON.stringify(db), { cidVersion: 1 })
            return db
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async get(id, key) {
        try {
            const chunks = []
            for await (const chunk of this.ipfs.files.read(id)) {
                chunks.push(chunk.toString())
            }
            let db = JSON.parse(chunks.join())
            return db[key]
        } catch (e) {
            if (this.debug) {
                console.log(e)
            }
            return false
        }
    }

    async stats(id) {
        try {
            const stats = await this.ipfs.files.stat(id)
            return stats
        } catch (e) {
            return false
        }
    }

    async store(id) {
        if (this.contract !== undefined) {
            const split = id.split('/')
            if (split.length === 4) {
                if (split[1].toUpperCase() === this.wallet.address.toUpperCase()) {
                    const name = split[2]
                    const chunks = []
                    for await (const chunk of this.ipfs.files.read(id)) {
                        chunks.push(chunk.toString())
                    }
                    const db = chunks.join()
                    const hash = await this.ipfs.add(db, { cidVersion: 1 })
                    if (this.debug) {
                        console.log("Storing DB:", name)
                        console.log("CID is:", hash.path)
                    }
                    try {
                        if (this.debug) {
                            console.log("Creating blockchain transaction..")
                        }
                        const result = await this.contract.store(name, hash.path)
                        let newId = parseInt(split[3].replace('ipdb', '')) + 1
                        let updated = split[0] + '/' + split[1] + '/' + split[2] + '/ipdb' + newId + '.json'
                        if (this.debug) {
                            console.log("Storing database with new version at:", updated)
                        }
                        try {
                            await this.ipfs.files.rm(updated)
                            if (this.debug) {
                                console.log("Removing previous stored version, same /address/name/db found.")
                            }
                        } catch (e) {
                            if (this.debug) {
                                console.log("No version found, proceeding as expected.")
                            }
                        }
                        try {
                            await this.ipfs.files.cp(id, updated, { cidVersion: 1, parent: true })
                            if (this.debug) {
                                console.log("New version created correctly.")
                            }
                        } catch (e) {
                            if (this.debug) {
                                console.log("Can't make new copy.")
                                console.log("Tryinig copy from:", id)
                                console.log("Trying copying at:", updated)
                                console.log(e)
                            }
                        }
                        return result
                    } catch (e) {
                        if (this.debug) {
                            console.log("Can't store database..")
                            console.log(e)
                        }
                        return false
                    }
                } else {
                    if (this.debug) {
                        console.log("Provided address doesn't matches database one")
                    }
                    return false
                }
            } else {
                if (this.debug) {
                    console.log("Split seems not valid.")
                }
                return false
            }
        } else {
            console.log("Contract instance not found, please create it before store.")
            return false
        }
    }

    async set(provider, key) {
        this.providers[provider] = key
    }

    async pin(id, provider) {
        if (this.providers[provider] !== undefined) {
            try {
                const stats = await this.ipfs.files.stat(id)
                if (stats.cid !== undefined) {
                    const chunks = []
                    for await (const chunk of this.ipfs.files.read(id)) {
                        chunks.push(chunk.toString())
                    }
                    const db = chunks.join()
                    const hash = await this.ipfs.add(db, { cidVersion: 1 })
                    let pinned
                    if (provider === 'pinata') {
                        pinned = await pinFileToPinata(this.providers[provider], db, id, this.debug)
                    } else if (provider === 'web3storage') {
                        const version = id.split('/')[(id.split('/').length - 1)].replace('ipdb', '')
                        pinned = await pinFileToWeb3Storage(this.providers[provider], db, version, this.debug)
                    } else {
                        if (this.debug) {
                            console.log('Provider not recognized.')
                        }
                        return false
                    }
                    if (hash.path === pinned) {
                        if (this.debug) {
                            console.log('Pinning successfully verified.')
                        }
                        return pinned
                    } else {
                        if (this.debug) {
                            console.log('Pinned hash is different from stored one.')
                            console.log("Original:", hash.path)
                            console.log("Pinned:", pinned)
                        }
                        return false
                    }
                } else {
                    if (this.debug) {
                        console.log("Can't find file in IPFS node")
                    }
                    return false
                }
            } catch (e) {
                if (this.debug) {
                    console.log(e)
                }
                return false
            }
        } else {
            if (this.debug) {
                console.log('Provider key not found.')
            }
            return false
        }
    }
}
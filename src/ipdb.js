import * as IPFS from 'ipfs-core'
import { ethers } from "ethers"

export class IPDB {
    ipfs
    wallet

    async create(name, address) {
        console.log("Creating IPFS instance..")
        this.ipfs = await IPFS.create()
        if (address === undefined) {
            this.wallet = ethers.Wallet.createRandom()
            console.log("Created new DB identifier:", this.wallet.address)
            address = this.wallet.address
        }
        let version = "000000"
        let id = "/" + address + "/" + name + "/db" + version
        // Creating root path
        try {
            await this.ipfs.files.mkdir("/" + address)
        } catch (e) {
            console.log("Root path exists..")
        }
        // Creating specific path
        try {
            await this.ipfs.files.mkdir("/" + address + "/" + name)
        } catch (e) {
            console.log("Database path exists..")
        }
        // Check if database exists
        let exists = false
        try {
            const stats = await this.ipfs.files.stat(id)
            exists = true
            console.log(stats)
        } catch (e) {
            console.log("Need to create database..")
        }
        if (!exists) {
            try {
                console.log("Creating new database at:", id)
                await this.ipfs.files.touch(id)
                await this.ipfs.files.write(id, JSON.stringify({}))
            } catch (e) {
                console.log("Can't write new database..")
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
            console.log(e)
            console.log("Can't open database..")
        }
        return { db, id }
    }

    async open(id) {
        try {
            const chunks = []
            for await (const chunk of this.ipfs.files.read(id)) {
                chunks.push(chunk.toString())
            }
            return JSON.parse(chunks.join())
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async put(id, doc) {
        try {
            const chunks = []
            for await (const chunk of this.ipfs.files.read(id)) {
                chunks.push(chunk.toString())
            }
            let db = JSON.parse(chunks.join())
            for (let k in doc) {
                db[k] = doc[k]
            }
            await this.ipfs.files.write(id, JSON.stringify(db))
            let updated
            try {
                const chunks = []
                for await (const chunk of this.ipfs.files.read(id)) {
                    chunks.push(chunk)
                }
                updated = JSON.parse(chunks.join())
            } catch (e) {
                console.log(e)
                console.log("Can't open updated database..")
            }
            return updated
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
            console.log(e)
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

    // TODO: Store CID to blockchain to make it public
    // TODO: Recover database from latest blockchain version
}
# IPDB (MVP)

IPDB (Interplanetary Database) is a key/value store database built on top of IPFS (Interplanetary File System).

Project is intended to be an MVP and it will change during next weeks. It's born as a need for the Retrieval Pinning Protocol built by CryptoNet and YOMI to store data inside a public database which don't belong to a single entity but belong to all network.

Core idea is made by two parts:
- Use the MFS (Mutable file system) to easily manage and handle `json` files
- Use the blockchain (Ethereum or EVM) to save the latest version of the database on-chain

Each node is responsible, of course, of the pinning of the latest version of database to make it accessible also to other users.

Similar to the `multiaddr` standard we created a standard which defines the user, the database and the version. So each database has it's own `dbid` which is something like:

```
/0xEthereumAddress/DatabaseName/db<VERSION>
```

Each version will be stored on-chain and will be recovered later for update or read it. Of course only the owner will be able to store the information on-chain.

Blockchain part is still a work in progress, will be updated later these weeks.

## Folder structure and technology

Project is pretty simple, you'll find:
- `contract`: which contains the contract logic (WIP)
- `src`: which is the main package folder
- `tests`: which contains the test files

As you may noticed entire project is a NodeJS module and it will be published on NPM once it will be ready for test.

## Run tests

If you want to run some tests you can easily follow these steps, assuming you've NodeJS v16 installed and YARN:

```
yarn 
yarn test:local
```

After some seconds you should be able to see something like:

```
Creating IPFS instance..
Swarm listening on /ip4/127.0.0.1/tcp/4002/p2p/12D3KooWSZy8uChn5WRNyBh12sEK1bheYPwm2U9ikP9GxZUPzPNj
Swarm listening on /ip4/172.17.0.1/tcp/4002/p2p/12D3KooWSZy8uChn5WRNyBh12sEK1bheYPwm2U9ikP9GxZUPzPNj
Swarm listening on /ip4/127.0.0.1/tcp/4003/ws/p2p/12D3KooWSZy8uChn5WRNyBh12sEK1bheYPwm2U9ikP9GxZUPzPNj
Created new DB identifier: 0x2DFdA093a7FD8c32B73A41c65F1e256d1439a225
Need to create database..
Creating new database at: /0x2DFdA093a7FD8c32B73A41c65F1e256d1439a225/ipfsrocks/db000000
Contents are: {}
--
`rocks` value is: true
--
`power` value is: 100
--
Complete db is: { rocks: true, power: 100 }
--
Informations about db are: {
  cid: CID(QmXL26iGZ3MCAkpKnoBRpbc4oHH95nmjYF48FRWLYfk7Yv),
  type: 'file',
  size: 26,
  cumulativeSize: 97,
  blocks: 1,
  local: undefined,
  sizeLocal: undefined,
  withLocality: false,
  mode: 420,
  mtime: { secs: 1659927580, nsecs: 546000 }
}
--
Nothing to do, closing..
```

Done! As you can see we created a database that contains two keys (`rocks` and `power`) and the final CID is `QmXL26iGZ3MCAkpKnoBRpbc4oHH95nmjYF48FRWLYfk7Yv`. You can continue manipulate the database also if you close the window and use correct `dbid` to open it.

## What about blockchain?

As you may noticed at the very beginning of the test there's this piece of code:

```
const provider = new ipdb.ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/" + process.env.INFURA_PROJECT_ID);
ipdb.wallet = new ipdb.ethers.Wallet(process.env.OWNER_KEY).connect(provider)
```

This means the database you must create a wallet or use a key you've in your `.env` file to instantiate the database. Otherwise it will not be able to store or retrieve databases.

### Deployments
Contracts are deployed in following blockchains:
| Blockchain   | Address                               | 
|--------------|---------------------------------------|
| Rinkeby | 0x1Aa65998a6751464FACD2f62Fa28e5B0034496ca |
| Goerli  | 0x9Adf0998FEEb6A5E8d4227BF1F8DEb250Ee096A9 |

## Functions
Main examples can be read inside `tests` folder, anyway there's a recap of all functions:
### create(name)
This function will create a new local instance of a database called `name`, this returns an `id` and the `db` itself which can be read or populated.

### retrieve(name)
This function will retrieve latest version of database from blockchain in form of CID and will create a local copy on your machine, so you can interact with it very fast.

### put(id, content)
This function will put specified `content` inside database provided by `id` parameter. The `id` database must exists inside the machine because was created or retrieved before.

### stats(id)
This function will return the informations about the database.

### store(id)
This function will store specified database's CID into the blockchain. At the moment the only support blockchain is Goerli, so make sure you have some funds to store the database or the transaction will fail.
## TODO list

- [x] Switch to CID v1
- [x] Add tests to contract folder
- [x] Add a .env file to select the contract and add pinning services token  
- [ ] Add a web3.storage and nft.storage pinning system
- [ ] Write dynamic NFT use case
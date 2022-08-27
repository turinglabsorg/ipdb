# IPDB

IPDB (Interplanetary Database) is a key/value store database built on top of IPFS (Interplanetary File System).

Project is intended to be an MVP and it will change during next weeks. It's born as a need for the Retrieval Pinning Protocol built by CryptoNet and YOMI to store data inside a public database which don't belong to a single entity but belong to all network.

Core idea is made by two parts:
- Use the MFS (Mutable file system) to easily manage and handle `json` files
- Use the blockchain (Ethereum or EVM) to save the latest version of the database on-chain

Each node is responsible, of course, of the pinning of the latest version of database to make it accessible also to other users.

Similar to the `multiaddr` standard we created a standard which defines the user, the database and the version. So each database has it's own `dbid` which is something like:

```
/0xEthereumAddress/DatabaseName/<VERSION>
```

Each version will be stored on-chain and will be recovered later for update or read it. Of course only the owner will be able to store the information on-chain.

Another interesting feature is remote pinning to supported providers [Pinata](https://pinata.cloud) and [Web3Storage](https://web3.storage), if you like to add your provider here please open a pull request. Remote pinning will allow you to have a secure backup of your databases making them more distributed.
## Folder structure and technology

Project is pretty simple, you'll find:
- `contract`: which contains the contract logic
- `src`: which is the main package folder
- `tests`: which contains the test files
- `.env`: which will contain all your variables, please remember to setup it first.

As you may noticed entire project is a NodeJS module and it will be published on NPM once it will be ready for test.

## Run tests

If you want to run some tests you can easily follow these steps, assuming you've NodeJS v16 installed and YARN:

```
yarn
cp .env.example .env
```

Now customize your `.env` file with your own keys, then you're able to run one of the tests:
```
yarn chain:create
```

After some seconds you should be able to see something like:

```
Using provider: https://goerli.infura.io/v3/7e6812ca728848919e64a63a134a1e79
Creating IPFS instance..
Swarm listening on /ip4/127.0.0.1/tcp/4002/p2p/12D3KooWSZy8uChn5WRNyBh12sEK1bheYPwm2U9ikP9GxZUPzPNj
Swarm listening on /ip4/192.168.1.22/tcp/4002/p2p/12D3KooWSZy8uChn5WRNyBh12sEK1bheYPwm2U9ikP9GxZUPzPNj
Swarm listening on /ip4/172.17.0.1/tcp/4002/p2p/12D3KooWSZy8uChn5WRNyBh12sEK1bheYPwm2U9ikP9GxZUPzPNj
Swarm listening on /ip4/127.0.0.1/tcp/4003/ws/p2p/12D3KooWSZy8uChn5WRNyBh12sEK1bheYPwm2U9ikP9GxZUPzPNj
Checking on-chain database: ipdbrocks_1661516338036
On-chain version is: 0
Root path exists..
Need to create database..
Creating new database at: /0x5d0a965E6e8388fd39D897c2B2EED5c3074421d6/ipdbrocks_1661516338036/0
Contents are: {}
--
`rocks` value is: true
--
`power` value is: 100
--
Informations about db are: {
  cid: CID(bafybeicdq2w4ulz72x7tli6qoyjjwtj7tyxzvngzk6kedhza3bydxrgpj4),
  type: 'file',
  size: 26,
  cumulativeSize: 99,
  blocks: 1,
  local: undefined,
  sizeLocal: undefined,
  withLocality: false,
  mode: 420,
  mtime: { secs: 1661516344, nsecs: 371000 }
}
--
Storing DB: ipdbrocks_1661516338036
CID is: bafkreifzd53l5ko3l77hxofxwyq4niw2uudw3g7xop32kufznwnsamlss4
Storing database with new version at: /db1x5d0a965E6e8388fd39D897c2B2EED5c3074421d6/ipdbrocks_1661516338036/0
Pending transaction at: 0x72e5b573820434af206c791bb0d9aa61b3428dcadbcaabe88eb2f1d46b6093fb
💸 Gas used: 139237
Db stored successfully!
```

Done! As you can see we created a database that contains two keys (`rocks` and `power`) and the final CID is `QmXL26iGZ3MCAkpKnoBRpbc4oHH95nmjYF48FRWLYfk7Yv`. 
You can continue manipulate the database also if you close the terminal and use correct `dbid` to open it.

You can try other tests that will help you understand better how this library works.

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

Default blockchain is `Goerli` but you can switch from `Goerli` to `Rinkeby` like this:
```
const ipdb = new IPDB()
ipdb.blockchain = 'rinkeby'
```

or you can also define your own custom smart contract like this:
```
const ipdb = new IPDB()
ipdb.deployments.custom = '0x00000000000000YourOwnCustomSmartContract'
ipdb.blockchain = 'custom'
```

## Functions
Main examples can be read inside `tests` folder, anyway there's a recap of all functions:
### create(name)
This function will create a new local instance of a database called `name`, this returns an `id` and the `db` itself which can be read or populated.

### retrieve(name)
This function will retrieve latest version of database from blockchain in form of CID and will create a local copy on your machine, so you can interact with it very fast.

### put(id, content)
This function will put specified `content` inside database provided by `id` parameter. The `id` database must exists inside the machine because was created or retrieved before.

### get(id, key)
This function will return value of specified `key` from `id`.

### stats(id)
This function will return the informations about the database.

### store(id)
This function will store specified database's CID into the blockchain. At the moment the only support blockchain is Goerli, so make sure you have some funds to store the database or the transaction will fail.

### set(provider, jwt)
This function will prepare the remote pinning provider, supported one are `pinata` and `web3storage`. Please remember to add `JWT` tokens in your `.env` file.

### pin(id, provider)
This function will make a remote pinning of specified `id` to `provider`.
## TODO list

If you want to help doing some stuff you can follow this list or write me at turinglabs@icloud.com or DM me on [Twitter](https://twitter.com/turinglabsorg).

- [x] Switch to CID v1
- [x] Add tests to contract folder
- [x] Add a .env file to select the contract and add pinning services token  
- [x] Add a web3.storage and nft.storage pinning system
- [ ] Add PubSub support to exchange data between nodes
- [ ] Create a website for the project
- [ ] Publish version to NPM
- [ ] Create a pitch to explain the project
- [ ] Create a Twitter account to make some marketing on it

## Use cases
- [x] Dynamic NFT use case
- [ ] Decentralized git use case: each database can represent git folders, each git folder contains files, each file is hashed and uploaded as well
- [ ] The "Google's IPFS" use case: a collaborative repository of data where anyone can publish formatted metadatas (needs an oracle)

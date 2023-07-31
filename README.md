# SimpleFunding Contract

This is simple funding contract(transfer erc20/eth) repository.
## 1. SimpleFunding Contracts
### 1) SimpleFundingProxy Contract
This is proxy of simple funding contract so that we could update simple funding at any time if needed. <br>
`- Major Features`
```
* Set Implemention - Update SimpleFunding contract address on Proxy
* Transfer Ownership - Transfer Ownership of Proxy contract
```
### 2) SimpleFunding Contract
This is simple funding contract which transfer eth/erc20 to address. <br>
`- Major Features`
```
* transferToken - Transfer ERC20 Token.
* transferEth - Transfer ETH.
```

## 2. How to install/build/test SimpleFunding Contract
### 1) How to install
```
npm install
```
### 2) How to build
```
npm run build
```
### 3) How to test
```
npm run test
```
### 4) How to deploy
```
npx hardhat run --network ${network} ./scripts/deploy.js
```
### 5) How to verify
```
npx hardhat verify --network ${network} ${Proxy Contract Address}
npx hardhat verify --network ${network} ${SimpleFunding Contract Address}
```

## 3. Deployed Contract on Georli
### 1) Proxy Contract
```
https://goerli.etherscan.io/address/0x437f52E6338E0dAE4eA2327195F6099C56A5Ae6e#code
```

### 2) SimpleFunding Contract
```
https://goerli.etherscan.io/address/0x1af98c3e9d959ac978b12d3e3b401fc61b4c5b01#code
```
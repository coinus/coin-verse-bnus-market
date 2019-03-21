# Coin Verse 

CoinUs dApp network

Version: 0.1.4

### Smart contracts

#### Ropsten

| Contract                | Address                                      |
| ----------------------- | -------------------------------------------- |
| ContractRegistry        | `0x701ee83a345cc0c3813a9b753673656b1c60c883` |
| CoinVerseContractIds    | `0x294f54d9f9ba4744668267c2335d342cc9b657d0` |
| ContractIds             | `0x1e2ce7a7ac944a56fe18e870cd2a4db7b537f853` |
| ContractFeatures        | `0xb40534fab93fa9bb27f3143129e729e4a0500ac7` |
| BancorFormula           | `0xf760c861f71ddefe1364013333d3c6fe7ea29943` |
| BancorGasPriceLimit     | `0x4fb3e39bf3515a18983ff4f7bcdd5979fdbdc577` |
| BancorConverterFactory  | `0x5954ed8f89e2a9d744c2e5ff66a033e71d5a625a` |
| BancorConverterUpgrader | `0x270444fb6d2e0a00e87b01289cafe7c1c7f3bb11` |
| BancorNetwork           | `0x0f59e65606a4994ebb40be0bfb7230da1f85d5dc` |
| [**TokenPool**](https://ropsten.etherscan.io/address/0x86d04ae82466e820005ed38e14ef0e5259d352f7#writeContract)            | `0x86d04ae82466e820005ed38e14ef0e5259d352f7` |
| [**CnusPoolForStaking**](https://ropsten.etherscan.io/address/0x22e018e1f26bac57d1e818e766bee94f821c9e23#writeContract)   | `0x22e018e1f26bac57d1e818e766bee94f821c9e23` |
| [**BnusToken**](https://ropsten.etherscan.io/address/0x21b3e267d58c7b24b1eefb726e4a1454e54c24c4#writeContract)            | `0x21b3e267d58c7b24b1eefb726e4a1454e54c24c4` |
| [**CnusTokenMockUp**](https://ropsten.etherscan.io/address/0x7ec8a4bb1353048c04de979abb5aabd040415c3a#writeContract)      | `0x7ec8a4bb1353048c04de979abb5aabd040415c3a` |
| [**BnusConverter**](https://ropsten.etherscan.io/address/0x23b1116b8112ebb141e5409af4ac27f298907fbc#writeContract)        | `0x23b1116b8112ebb141e5409af4ac27f298907fbc` |


#### Mainnet

| Contract                | Address                                      |
| ----------------------- | -------------------------------------------- |
| ContractRegistry        | `0xa9190fb87aae004fdca9ef70b6c45a8cf5040d54` |
| CoinVerseContractIds    | `0xc3f2a2abedcf3e1a282d86df2667ebbcdf128da5` |
| ContractIds             | `0x0921b00413c72514f345d0c00edaa4d589c98102` |
| ContractFeatures        | `0x78d6d8d65c70c3fb99911681749dfb4c991ab194` |
| BancorFormula           | `0xf57b4967a428f397f8fd5d74e4f147797386b236` |
| BancorGasPriceLimit     | `0x7b3fd91cb2e9819c60973243e3a609e31018ced8` |
| BancorConverterFactory  | `0x5ccae9c34229bb1d936025ace3b1b4d2d2e493a6` |
| BancorConverterUpgrader | `0xc3b31787b62cdbf16d577a613316197fc47eed38` |
| BancorNetwork           | `0xa9a1205dc5d1ce8897470ed9bd119072a4d5ec0f` |
| **TokenPool**           | `0x5ebd231ca190623fbf829f97938ac2c127582ea0` |
| CnusPoolForStaking      | `0x70d93c969ab23468b6305f0180b6f05e8afe046f` |
| **BnusToken**           | `0xbcf8969f0f5c5075f0b925809fed62eb04e58ecf` |
| CnusToken               | `0x722f2f3eac7e9597c73a593f7cf3de33fbfc3308` |
| **BnusConverter**       | `0x13bccb947052935cc5a96d8bd761984918ccb667` |


### Development environment

[![](https://img.shields.io/badge/node-v11.6.0-blue.svg)](https://github.com/nodejs/node/releases/tag/v11.6.0) [![](https://img.shields.io/badge/npm-v6.5.0-blue.svg)](https://github.com/npm/cli/releases/tag/v6.5.0) [![](https://img.shields.io/badge/truffle-v4.1.14-blue.svg)](https://github.com/trufflesuite/truffle/releases/tag/v4.1.14) [![](https://img.shields.io/badge/solidity-v0.4.24-blue.svg)](https://github.com/ethereum/solidity/releases/tag/v0.4.24)



### Run test

1. Clone repository

   ```bash
   git clone https://github.com/coinus/coin-verse-bnus-market.git
   ```

2. Install packages

   ```bash
   npm install
   ```

3. Run the following command

   ```bash
   npm run test
   ```

## License

[MIT License](LICENSE)

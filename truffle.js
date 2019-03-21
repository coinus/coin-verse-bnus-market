const HDWalletProvider = require('truffle-hdwallet-provider')
require('dotenv').config()  // Store environment-specific variable from '.env' to process.env

module.exports = {
  migrations_directory: './migrations',
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gasPrice: 1000
    },
    testnet: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gasPrice: 1001
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY),
      network_id: 1,
      gasPrice: 7000000000
    },
    livetest: { // Mainnet Live test
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY),
      network_id: 1,
      gasPrice: 6000000000
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY),
      network_id: 3,
      gasPrice: 4000000000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY),
      network_id: 4,
      gasPrice: 4000000000
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  }
}


const { bancorConverterTestCase } = require('./bancorTester/BancorConverter')
const { tokenHolderTestCase } = require('./bancorTester/TokenHolder')
const { bancorConverterUpgraderTestCase } = require('./bancorTester/BancorConverterUpgrader')
const { smartTokenTestCase } = require('./bancorTester/SmartToken')
const { bancorNetworkTestCase } = require('./bancorTester/BancorNetwork')
const { contractRegistryTestCase } = require('./bancorTester/ContractRegistry')

const Contract = (artifact) => ({
  follows: (protocolTester) => protocolTester(artifact)
})

module.exports = {
  Contract,
  Protocol: {
    BancorConverter: bancorConverterTestCase,
    BancorConverterUpgrader: bancorConverterUpgraderTestCase,
    TokenHolder: tokenHolderTestCase,
    SmartToken: smartTokenTestCase,
    BancorNetwork: bancorNetworkTestCase,
    ContractRegistry: contractRegistryTestCase
  }
}

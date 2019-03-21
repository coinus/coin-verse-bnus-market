const { Contract, Protocol } = require('../protocol/Bancor')

const BnusConverterUpgrader = artifacts.require('BnusConverterUpgrader.sol')

contract('BnusConverterUpgrader', async () => {
  // Basically, it should pass all test cases of the bancor protocol.
  context('It follows the bancor protocol', async () => {
    it('should follow the bancor protocol', async () => {
      Contract(BnusConverterUpgrader).follows(Protocol.BancorConverterUpgrader)
    })
  })
})